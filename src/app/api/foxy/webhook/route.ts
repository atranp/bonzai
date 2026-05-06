import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/service";
import { verifyFoxyWebhookSignature } from "@/lib/foxy";

function mapStatus(foxyStatus: unknown): string {
  const s = typeof foxyStatus === "string" ? foxyStatus : "";
  if (s === "" || s === "approved" || s === "captured" || s === "authorized") {
    return "paid";
  }
  if (s === "pending" || s === "capturing") return "pending";
  if (s === "refunding" || s === "refunded") return "refunded";
  if (s === "voided") return "cancelled";
  if (s === "declined" || s === "rejected" || s === "problem") return "failed";
  return "pending";
}

function extractCustomField(
  payload: any,
  name: string,
): string | undefined {
  const embedded = payload?._embedded;
  const fields = embedded?.["fx:custom_fields"];
  if (!Array.isArray(fields)) return undefined;
  const match = fields.find((f) => f?.name === name);
  const v = match?.value;
  return typeof v === "string" ? v : undefined;
}

function extractItems(payload: any): Array<{
  name: string;
  code: string;
  price: number;
  quantity: number;
}> {
  const embedded = payload?._embedded;
  const items = embedded?.["fx:items"];
  if (!Array.isArray(items)) return [];
  return items
    .map((it) => ({
      name: String(it?.name ?? ""),
      code: String(it?.code ?? ""),
      price: Number(it?.price ?? 0),
      quantity: Number(it?.quantity ?? 0),
    }))
    .filter((x) => x.name && x.quantity > 0);
}

function extractShippingAddress(payload: any) {
  const embedded = payload?._embedded;
  const shipments = embedded?.["fx:shipments"];
  if (!Array.isArray(shipments) || shipments.length === 0) return null;
  const s = shipments[0];
  return {
    first_name: s?.first_name ?? null,
    last_name: s?.last_name ?? null,
    company: s?.company ?? null,
    address1: s?.address1 ?? null,
    address2: s?.address2 ?? null,
    city: s?.city ?? null,
    region: s?.region ?? null,
    postal_code: s?.postal_code ?? null,
    country: s?.country ?? null,
    phone: s?.phone ?? null,
    shipping_service_description: s?.shipping_service_description ?? null,
  };
}

export async function GET() {
  // FoxyCart sends a GET when saving webhook config.
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const signature = request.headers.get("foxy-webhook-signature") ?? "";
  const rawBody = await request.text();

  if (!signature || !verifyFoxyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const orderRef =
    extractCustomField(payload, "custom_order_ref") ??
    extractCustomField(payload, "order_ref");

  if (!orderRef) {
    return NextResponse.json({ error: "missing_order_ref" }, { status: 400 });
  }

  const foxyTransactionId =
    payload?.id != null ? String(payload.id) : crypto.randomUUID();

  const currency = String(payload?.currency_code ?? "USD");
  const subtotalCents = Math.round(Number(payload?.total_item_price ?? 0) * 100);
  const shippingCents = Math.round(Number(payload?.total_shipping ?? 0) * 100);
  const taxCents = Math.round(Number(payload?.total_tax ?? 0) * 100);
  const totalCents = Math.round(Number(payload?.total_order ?? 0) * 100);
  const email =
    typeof payload?.customer_email === "string" ? payload.customer_email : null;

  const status = mapStatus(payload?.status);
  const shippingAddress = extractShippingAddress(payload);
  const items = extractItems(payload);

  const supabase = createSupabaseService();

  // Upsert order by order_ref (unique) and attach transaction id.
  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .upsert(
      {
        order_ref: orderRef,
        status,
        email,
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        tax_cents: taxCents,
        total_cents: totalCents,
        currency,
        shipping_address: shippingAddress,
        foxy_transaction_id: foxyTransactionId,
        foxy_payload: payload,
      },
      { onConflict: "order_ref" },
    )
    .select("id")
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  const orderId = orderRow.id as string;

  // Replace items snapshot (idempotent).
  const { error: delError } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", orderId);
  if (delError) {
    return NextResponse.json({ error: delError.message }, { status: 500 });
  }

  if (items.length > 0) {
    const codes = [...new Set(items.map((i) => i.code).filter(Boolean))];
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id,foxy_code")
      .in("foxy_code", codes);

    if (prodErr) {
      return NextResponse.json({ error: prodErr.message }, { status: 500 });
    }

    const codeToProductId = new Map<string, string>();
    for (const p of products ?? []) {
      codeToProductId.set((p as any).foxy_code, (p as any).id);
    }

    const inserts = items.map((it) => {
      const priceCents = Math.round(it.price * 100);
      return {
        order_id: orderId,
        product_id: codeToProductId.get(it.code) ?? null,
        name_snapshot: it.name,
        price_cents: priceCents,
        qty: it.quantity,
        line_total_cents: priceCents * it.quantity,
      };
    });

    const { error: insErr } = await supabase.from("order_items").insert(inserts);
    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}


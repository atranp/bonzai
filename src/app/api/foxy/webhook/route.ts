import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/service";
import { verifyFoxyWebhookSignature } from "@/lib/foxy";

type JsonObject = Record<string, unknown>;

function isRecord(v: unknown): v is JsonObject {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function getEmbedded(payload: unknown): JsonObject | undefined {
  if (!isRecord(payload)) return undefined;
  const e = payload["_embedded"];
  return isRecord(e) ? e : undefined;
}

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

function extractCustomField(payload: unknown, name: string): string | undefined {
  const embedded = getEmbedded(payload);
  if (!embedded) return undefined;
  const fields = embedded["fx:custom_fields"];
  if (!Array.isArray(fields)) return undefined;
  const match = fields.find((f) => isRecord(f) && f["name"] === name);
  const v = match && isRecord(match) ? match["value"] : undefined;
  return typeof v === "string" ? v : undefined;
}

function extractItems(payload: unknown): Array<{
  name: string;
  code: string;
  price: number;
  quantity: number;
}> {
  const embedded = getEmbedded(payload);
  if (!embedded) return [];
  const items = embedded["fx:items"];
  if (!Array.isArray(items)) return [];
  return items
    .map((it: unknown) => {
      const row = isRecord(it) ? it : {};
      return {
        name: String(row["name"] ?? ""),
        code: String(row["code"] ?? ""),
        price: Number(row["price"] ?? 0),
        quantity: Number(row["quantity"] ?? 0),
      };
    })
    .filter((x) => x.name && x.quantity > 0);
}

function extractShippingAddress(payload: unknown) {
  const embedded = getEmbedded(payload);
  if (!embedded) return null;
  const shipments = embedded["fx:shipments"];
  if (!Array.isArray(shipments) || shipments.length === 0) return null;
  const s = isRecord(shipments[0]) ? shipments[0] : {};
  return {
    first_name: s["first_name"] ?? null,
    last_name: s["last_name"] ?? null,
    company: s["company"] ?? null,
    address1: s["address1"] ?? null,
    address2: s["address2"] ?? null,
    city: s["city"] ?? null,
    region: s["region"] ?? null,
    postal_code: s["postal_code"] ?? null,
    country: s["country"] ?? null,
    phone: s["phone"] ?? null,
    shipping_service_description: s["shipping_service_description"] ?? null,
  };
}

function parseUuid(raw: string | undefined): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const t = raw.trim();
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      t,
    )
  ) {
    return undefined;
  }
  return t;
}

function extractUserIdFromPayload(payload: unknown): string | undefined {
  return (
    parseUuid(extractCustomField(payload, "custom_user_id")) ??
    parseUuid(extractCustomField(payload, "user_id"))
  );
}

function extractPaymentSummary(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  const out: Record<string, unknown> = {};
  const embedded = getEmbedded(payload);
  const pm =
    payload["payment_method"] ??
    embedded?.["fx:payment_method"] ??
    embedded?.["fx:transaction_payment_method"];

  if (pm && typeof pm === "object" && !Array.isArray(pm)) {
    const o = pm as JsonObject;
    if (typeof o["cc_type"] === "string") out.brand = o["cc_type"];
    if (typeof o["type"] === "string") out.type = o["type"];
    const lastFour = o["last_four"];
    const last4 = o["last4"];
    const last =
      typeof lastFour === "string" ? lastFour : typeof last4 === "string" ? last4 : undefined;
    if (typeof last === "string") out.last4 = last;
    const masked = o["masked_number"];
    if (typeof masked === "string") out.masked = masked;
  }
  const gateway = payload["gateway_type"];
  if (typeof gateway === "string") {
    out.gateway = gateway;
  }
  return Object.keys(out).length ? out : null;
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

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const orderRef =
    extractCustomField(payload, "custom_order_ref") ??
    extractCustomField(payload, "order_ref");

  if (!orderRef) {
    return NextResponse.json({ error: "missing_order_ref" }, { status: 400 });
  }

  const foxyTransactionId =
    isRecord(payload) && payload["id"] != null
      ? String(payload["id"])
      : crypto.randomUUID();

  const currency =
    isRecord(payload) && typeof payload["currency_code"] === "string"
      ? payload["currency_code"]
      : "USD";
  const subtotalCents = Math.round(
    Number(isRecord(payload) ? (payload["total_item_price"] ?? 0) : 0) * 100,
  );
  const shippingCents = Math.round(
    Number(isRecord(payload) ? (payload["total_shipping"] ?? 0) : 0) * 100,
  );
  const taxCents = Math.round(
    Number(isRecord(payload) ? (payload["total_tax"] ?? 0) : 0) * 100,
  );
  const totalCents = Math.round(
    Number(isRecord(payload) ? (payload["total_order"] ?? 0) : 0) * 100,
  );
  const email =
    isRecord(payload) && typeof payload["customer_email"] === "string"
      ? payload["customer_email"]
      : null;

  const status = mapStatus(isRecord(payload) ? payload["status"] : undefined);
  const shippingAddress = extractShippingAddress(payload);
  const items = extractItems(payload);

  const supabase = createSupabaseService();

  const { data: existingOrder } = await supabase
    .from("orders")
    .select("user_id,payment_summary")
    .eq("order_ref", orderRef)
    .maybeSingle();

  const userIdFromPayload = extractUserIdFromPayload(payload);
  const userId =
    userIdFromPayload ?? (existingOrder?.user_id as string | null | undefined) ?? null;

  const paymentSummary =
    extractPaymentSummary(payload) ??
    (existingOrder?.payment_summary as Record<string, unknown> | null | undefined) ??
    null;

  // Upsert order by order_ref (unique) and attach transaction id.
  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .upsert(
      {
        order_ref: orderRef,
        status,
        email,
        user_id: userId,
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        tax_cents: taxCents,
        total_cents: totalCents,
        currency,
        shipping_address: shippingAddress,
        payment_summary: paymentSummary,
        foxy_transaction_id: foxyTransactionId,
        foxy_payload: isRecord(payload) ? payload : {},
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
      if (!isRecord(p)) continue;
      const code = p["foxy_code"];
      const id = p["id"];
      if (typeof code === "string" && typeof id === "string") {
        codeToProductId.set(code, id);
      }
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

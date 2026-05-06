import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/products";
import { createSupabaseService } from "@/lib/supabase/service";
import { buildFoxyCartUrl } from "@/lib/foxy";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug") ?? "";
  const qtyRaw = url.searchParams.get("qty") ?? "1";
  const qty = Math.max(1, Math.min(99, Number.parseInt(qtyRaw, 10) || 1));

  const product = await getProductBySlug(slug);
  if (!product) {
    return NextResponse.redirect(new URL("/compounds", url), 302);
  }

  const orderRef = crypto.randomUUID();
  const supabase = createSupabaseService();

  const subtotalCents = product.price_cents * qty;

  const { error } = await supabase.from("orders").insert({
    order_ref: orderRef,
    status: "pending",
    subtotal_cents: subtotalCents,
    total_cents: subtotalCents,
    currency: product.currency ?? "USD",
    foxy_payload: {
      created_from: "cart_redirect",
      slug: product.slug,
      qty,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const cartUrl = buildFoxyCartUrl({
    name: product.name,
    code: product.foxy_code,
    priceCents: product.price_cents,
    quantity: qty,
    orderRef,
  });

  return NextResponse.redirect(cartUrl, 302);
}


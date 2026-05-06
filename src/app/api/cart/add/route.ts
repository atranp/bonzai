import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getProductBySlug } from "@/lib/products";

export async function POST(request: Request) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = (await request.json()) as unknown;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const slug =
    body && typeof body === "object" && "slug" in body && typeof body.slug === "string"
      ? body.slug
      : "";
  const qtyRaw =
    body && typeof body === "object" && "qty" in body && typeof body.qty === "number"
      ? body.qty
      : 1;
  const qty = Math.max(1, Math.min(99, Math.floor(qtyRaw || 1)));

  const product = await getProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { data: existing, error: selErr } = await supabase
    .from("cart_items")
    .select("id,qty")
    .eq("user_id", user.id)
    .eq("product_id", product.id)
    .maybeSingle();

  if (selErr) {
    return NextResponse.json({ error: selErr.message }, { status: 500 });
  }

  if (existing) {
    const nextQty = Math.max(1, Math.min(99, (existing.qty as number) + qty));
    const { error: updErr } = await supabase
      .from("cart_items")
      .update({ qty: nextQty })
      .eq("id", existing.id as string);
    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }
  } else {
    const { error: insErr } = await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: product.id,
      qty,
    });
    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}


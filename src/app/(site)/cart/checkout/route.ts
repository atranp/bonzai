import { NextResponse } from "next/server";
import { buildFoxyCartUrlMulti } from "@/lib/foxy";
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSupabaseService } from "@/lib/supabase/service";

type CartRow = {
  id: string;
  qty: number;
  products:
    | {
    id: string;
    slug: string;
    name: string;
    price_cents: number;
    currency: string;
    foxy_code: string;
      }
    | Array<{
        id: string;
        slug: string;
        name: string;
        price_cents: number;
        currency: string;
        foxy_code: string;
      }>
    | null;
};

function unwrapProduct(row: CartRow) {
  const p = row.products;
  if (!p) return null;
  if (Array.isArray(p)) return p[0] ?? null;
  return p;
}

export async function GET(request: Request) {
  const supabaseUser = await createSupabaseServer();
  const {
    data: { user },
  } = await supabaseUser.auth.getUser();

  const url = new URL(request.url);
  if (!user) {
    const login = new URL("/login", url);
    login.searchParams.set("returnTo", "/cart");
    return NextResponse.redirect(login, 302);
  }

  const { data, error } = await supabaseUser
    .from("cart_items")
    .select("id,qty,products(id,slug,name,price_cents,currency,foxy_code)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as unknown as CartRow[];
  const items = rows
    .map((r) => {
      const product = unwrapProduct(r);
      return product && r.qty > 0 ? { cartItemId: r.id, qty: r.qty, product } : null;
    })
    .filter(Boolean) as Array<{
    cartItemId: string;
    qty: number;
    product: {
      id: string;
      slug: string;
      name: string;
      price_cents: number;
      currency: string;
      foxy_code: string;
    };
  }>;

  if (items.length === 0) {
    return NextResponse.redirect(new URL("/cart", url), 302);
  }

  const orderRef = crypto.randomUUID();

  const currency = items[0].product.currency ?? "USD";
  const subtotalCents = items.reduce(
    (sum, it) => sum + it.product.price_cents * it.qty,
    0,
  );

  // Create pending order + item snapshot now (so receipts can show even if webhook is delayed).
  // Uses service role (webhook uses service role too).
  const supabase = createSupabaseService();

  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .insert({
      order_ref: orderRef,
      status: "pending",
      user_id: user.id,
      subtotal_cents: subtotalCents,
      total_cents: subtotalCents,
      currency,
      foxy_payload: { created_from: "cart_checkout", cart_item_ids: items.map((x) => x.cartItemId) },
    })
    .select("id")
    .single();

  if (orderErr) {
    return NextResponse.json({ error: orderErr.message }, { status: 500 });
  }

  const orderId = orderRow.id as string;

  const orderItems = items.map((it) => ({
    order_id: orderId,
    product_id: it.product.id,
    name_snapshot: it.product.name,
    price_cents: it.product.price_cents,
    qty: it.qty,
    line_total_cents: it.product.price_cents * it.qty,
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
  if (itemsErr) {
    return NextResponse.json({ error: itemsErr.message }, { status: 500 });
  }

  const cartUrl = buildFoxyCartUrlMulti({
    items: items.map((it) => ({
      name: it.product.name,
      code: it.product.foxy_code,
      priceCents: it.product.price_cents,
      quantity: it.qty,
    })),
    orderRef,
    userId: user.id,
  });

  return NextResponse.redirect(cartUrl, 302);
}


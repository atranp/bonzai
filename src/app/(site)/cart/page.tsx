import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { formatUSD } from "@/lib/money";

const card =
  "rounded-2xl border border-ink/10 bg-[color-mix(in_oklab,var(--bone)_94%,white)] p-6 shadow-[0_1px_3px_rgba(10,9,6,0.05)]";

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

export default async function CartPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex-1">
        <section className="mx-auto max-w-2xl px-6 py-18">
          <div className={card}>
            <div className="text-sm text-ink/60">Please sign in to view your cart.</div>
            <Link
              href="/login?returnTo=%2Fcart"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-bone transition-colors hover:bg-ink/90"
            >
              Sign in
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const { data, error } = await supabase
    .from("cart_items")
    .select(
      "id,qty,products(id,slug,name,price_cents,currency,foxy_code)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as unknown as CartRow[];
  const items = rows
    .map((r) => {
      const product = unwrapProduct(r);
      return product && r.qty > 0 ? { ...r, product } : null;
    })
    .filter(Boolean) as Array<CartRow & { product: NonNullable<ReturnType<typeof unwrapProduct>> }>;

  const subtotalCents = items.reduce((sum, r) => {
    return sum + r.product.price_cents * r.qty;
  }, 0);

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-3xl px-6 py-18">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink/45">
          Cart
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
          Your cart
        </h1>

        {items.length === 0 ? (
          <div className={`mt-10 ${card}`}>
            <p className="text-sm text-ink/60">Your cart is empty.</p>
            <Link
              href="/compounds"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-bone transition-colors hover:bg-ink/90"
            >
              Browse compounds
            </Link>
          </div>
        ) : (
          <>
            <div className={`mt-10 ${card}`}>
              <div className="grid gap-4">
                {items.map((r) => {
                  return (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/8 pt-4 first:border-t-0 first:pt-0"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-ink">
                          {r.product.name}
                        </div>
                        <div className="mt-1 font-mono text-xs text-ink/50">
                          Qty {r.qty} · {formatUSD(r.product.price_cents)} each
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <form
                          action="/api/cart/update"
                          method="post"
                          className="flex items-center gap-2"
                        >
                          <input type="hidden" name="id" value={r.id} />
                          <input
                            type="number"
                            min={1}
                            max={99}
                            name="qty"
                            defaultValue={r.qty}
                            className="h-10 w-20 rounded-lg border border-ink/10 bg-bone/60 px-3 font-mono text-sm text-ink/80"
                          />
                          <button
                            type="submit"
                            className="inline-flex h-10 items-center justify-center rounded-lg border border-ink/10 bg-bone/60 px-3 text-sm font-medium text-ink/70 transition-colors hover:border-ink/20 hover:bg-bone/80"
                          >
                            Update
                          </button>
                        </form>

                        <form action="/api/cart/remove" method="post">
                          <input type="hidden" name="id" value={r.id} />
                          <button
                            type="submit"
                            className="inline-flex h-10 items-center justify-center rounded-lg border border-ink/10 bg-bone/60 px-3 text-sm font-medium text-ink/70 transition-colors hover:border-ink/20 hover:bg-bone/80"
                          >
                            Remove
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-ink/8 pt-5">
                <div className="text-sm font-medium text-ink/70">Subtotal</div>
                <div className="font-mono text-sm text-ink">
                  {formatUSD(subtotalCents)}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/compounds"
                className="text-sm font-medium text-ink/55 transition-colors hover:text-ink"
              >
                ← Continue shopping
              </Link>
              {/* Full navigation: <Link> RSC-fetch follows 302 cross-origin → Foxy blocks with CORS. */}
              <a
                href="/cart/checkout"
                className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-bone transition-colors hover:bg-ink/90"
              >
                Checkout
              </a>
            </div>
          </>
        )}
      </section>
    </main>
  );
}


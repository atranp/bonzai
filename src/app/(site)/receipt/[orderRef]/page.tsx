import Link from "next/link";
import { getOrderByRef } from "@/lib/orders";
import { formatUSD } from "@/lib/money";

function formatStatus(s: string) {
  return s.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const card =
  "rounded-2xl border border-ink/10 bg-[color-mix(in_oklab,var(--bone)_94%,white)] p-6 shadow-[0_1px_3px_rgba(10,9,6,0.05)]";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ orderRef: string }>;
}) {
  const { orderRef } = await params;
  const order = await getOrderByRef(orderRef);

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-2xl px-6 py-18">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink/45">
          Receipt
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
          Order received
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/60">
          Reference:{" "}
          <span className="font-mono text-[0.8125rem] text-ink">
            {orderRef}
          </span>
        </p>

        {order ? (
          <>
            <div className={`mt-10 ${card}`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink/45">
                    Status
                  </div>
                  <div className="mt-2 font-mono text-sm text-ink">
                    {formatStatus(order.status)}
                    {order.foxy_transaction_id ? (
                      <span className="text-ink/45">
                        {" "}
                        · {order.foxy_transaction_id}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink/45">
                    Total
                  </div>
                  <div className="mt-2 font-mono text-sm text-ink">
                    {formatUSD(order.total_cents)}
                  </div>
                </div>
              </div>
            </div>

            <div className={`mt-6 ${card}`}>
              <div className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink/45">
                Items
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                {(order.order_items ?? []).map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between gap-6 border-t border-ink/8 pt-3 first:border-t-0 first:pt-0"
                  >
                    <div>
                      <div className="text-sm font-medium text-ink">
                        {it.name_snapshot}
                      </div>
                      <div className="mt-1 font-mono text-xs text-ink/50">
                        Qty {it.qty} · {formatUSD(it.price_cents)} each
                      </div>
                    </div>
                    <div className="font-mono text-xs text-ink/60">
                      {formatUSD(it.line_total_cents)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-2 border-t border-ink/8 pt-4 font-mono text-xs text-ink/55">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatUSD(order.subtotal_cents)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{formatUSD(order.shipping_cents)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax</span>
                  <span>{formatUSD(order.tax_cents)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 text-sm text-ink">
                  <span>Total</span>
                  <span>{formatUSD(order.total_cents)}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={`mt-10 ${card}`}>
            <div className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink/45">
              Not found
            </div>
            <div className="mt-2 font-mono text-sm text-ink/60">
              No order found for this reference yet. If you just checked out,
              give it a moment for the webhook to land.
            </div>
          </div>
        )}

        <div className="mt-10">
          <Link
            href="/compounds"
            className="text-sm font-medium text-ink/55 transition-colors hover:text-ink"
          >
            Continue shopping →
          </Link>
        </div>
      </section>
    </main>
  );
}

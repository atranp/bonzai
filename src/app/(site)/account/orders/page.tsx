import Link from "next/link";
import { listMyOrders } from "@/lib/account/orders";
import { formatUSD } from "@/lib/money";

const card =
  "rounded-2xl border border-ink/10 bg-[color-mix(in_oklab,var(--bone)_94%,white)] p-6 shadow-[0_1px_3px_rgba(10,9,6,0.05)]";

function formatStatus(s: string) {
  return s.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatPaymentSummary(summary: unknown): string | null {
  if (!summary || typeof summary !== "object") return null;
  const o = summary as Record<string, unknown>;
  const parts: string[] = [];
  if (typeof o.brand === "string") parts.push(o.brand);
  if (typeof o.type === "string" && !o.brand) parts.push(o.type);
  if (typeof o.last4 === "string") parts.push(`••••${o.last4}`);
  if (typeof o.gateway === "string") parts.push(o.gateway);
  if (typeof o.masked === "string") parts.push(String(o.masked));
  return parts.length ? parts.join(" · ") : null;
}

export default async function AccountOrdersPage() {
  const orders = await listMyOrders();

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-3xl px-6 py-18">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink/45">
              Account
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              Orders
            </h1>
          </div>
          <Link
            href="/account"
            className="text-sm font-medium text-ink/55 transition-colors hover:text-ink"
          >
            ← Account
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className={`mt-10 ${card}`}>
            <p className="text-sm text-ink/60">
              No orders yet. Purchases made while signed in will show up here.
            </p>
            <Link
              href="/compounds"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-bone transition-colors hover:bg-ink/90"
            >
              Browse compounds
            </Link>
          </div>
        ) : (
          <ul className="mt-10 grid list-none gap-4">
            {orders.map((o) => {
              const pay = formatPaymentSummary(o.payment_summary);
              return (
                <li key={o.id} className={card}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="font-mono text-xs text-ink/50">
                        {new Date(o.created_at).toLocaleString()}
                      </div>
                      <div className="mt-2 font-mono text-sm text-ink">
                        Ref {o.order_ref}
                      </div>
                      <div className="mt-1 text-sm text-ink/60">
                        {formatStatus(o.status)}
                        {o.foxy_transaction_id ? (
                          <span className="text-ink/45">
                            {" "}
                            · {o.foxy_transaction_id}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm text-ink">
                        {formatUSD(o.total_cents)}
                      </div>
                      <Link
                        href={`/receipt/${encodeURIComponent(o.order_ref)}`}
                        className="mt-2 inline-block text-sm font-medium text-ink/55 underline decoration-ink/20 underline-offset-4 hover:text-ink"
                      >
                        Receipt
                      </Link>
                    </div>
                  </div>
                  {pay ? (
                    <div className="mt-4 border-t border-ink/8 pt-4 font-mono text-xs text-ink/50">
                      Payment: {pay}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatUSD } from "@/lib/money";

export function PurchasePanel({
  name,
  subtitle,
  slug,
  foxyCode,
  priceCents,
  currency,
  className,
}: {
  name: string;
  subtitle: string | null;
  slug: string;
  foxyCode: string;
  priceCents: number;
  currency: string;
  className?: string;
}) {
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  const href = useMemo(() => {
    return `/cart`;
  }, [slug, qty]);

  const label = useMemo(() => {
    return `${formatUSD(priceCents)} ${currency}`;
  }, [priceCents, currency]);

  async function addToCart() {
    if (adding) return;
    setAdding(true);
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, qty }),
      });
      if (!res.ok) return;
      router.push("/cart");
      router.refresh();
    } finally {
      setAdding(false);
    }
  }

  return (
    <section className={className}>
      <div className="rounded-2xl border border-ink/10 bg-[color-mix(in_oklab,var(--bone)_94%,white)] p-6 shadow-[0_1px_3px_rgba(10,9,6,0.05)] md:p-7">
        <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-[1.75rem] md:leading-snug">
          {name}
        </h1>
        <p className="mt-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink/50">
          {subtitle ?? "Research-grade peptide compound."}
        </p>

        <div className="mt-6 flex items-baseline justify-between gap-4 border-t border-ink/8 pt-6">
          <div>
            <p className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-ink/40">
              Price
            </p>
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-ink md:text-[1.65rem]">
              {label}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-ink/40">
              Code
            </p>
            <p className="mt-1.5 font-mono text-[0.8125rem] text-ink/75">
              {foxyCode}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="inline-flex shrink-0 items-center justify-center rounded-xl border border-ink/10 bg-bone/80 p-1">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-lg text-ink/45 transition hover:bg-ink/4 hover:text-ink"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <div
              className="min-w-11 text-center font-mono text-sm tabular-nums text-ink/80"
              aria-label="Quantity"
            >
              {qty}
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-lg text-ink/45 transition hover:bg-ink/4 hover:text-ink"
              onClick={() => setQty((q) => Math.min(99, q + 1))}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <Link
            href={href}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-ink px-5 text-sm font-semibold text-bone transition-colors hover:bg-ink/92"
            onClick={(e) => {
              e.preventDefault();
              void addToCart();
            }}
            aria-disabled={adding}
          >
            {adding ? "Adding…" : "Add to cart"}
          </Link>
        </div>

        <p className="mt-5 text-[0.6875rem] leading-relaxed text-ink/45">
          US-only · Flat-rate shipping · COA-backed · Research use only
        </p>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { formatUSD } from "@/lib/money";
import { resolveProductImageSrc } from "@/lib/product-image";
import type { Product } from "@/lib/products";

export function ProductCard({
  product,
  imageIndex,
}: {
  product: Product;
  imageIndex: number;
}) {
  const subtitle = (product.subtitle ?? "Research-grade").replace(/\.$/, "");

  return (
    <Link
      href={`/compounds/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-[color-mix(in_oklab,var(--bone)_94%,white)] text-ink shadow-[0_1px_3px_rgba(10,9,6,0.06)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-ink/16 hover:shadow-[0_16px_40px_-24px_rgba(10,9,6,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-toriRed/35 focus-visible:ring-offset-2 focus-visible:ring-offset-bone"
    >
      <div className="relative aspect-square bg-ink/5">
        <Image
          src={resolveProductImageSrc(product, imageIndex)}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink/40">
              {subtitle}
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink md:text-xl">
              {product.name}
            </h2>
          </div>
          <div className="shrink-0 rounded-lg border border-ink/10 bg-[color-mix(in_oklab,var(--bone)_70%,transparent)] px-3 py-2 text-right">
            <p className="font-mono text-[0.6875rem] tabular-nums font-medium text-ink">
              {formatUSD(product.price_cents)}
            </p>
          </div>
        </div>
        <p className="mt-4 font-mono text-[0.6875rem] text-ink/45">
          {product.foxy_code}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-ink/8 pt-4">
          <span className="text-[0.8125rem] font-medium text-ink/50 transition-colors group-hover:text-ink">
            View product
          </span>
          <span
            className="text-ink/30 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink/60"
            aria-hidden
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

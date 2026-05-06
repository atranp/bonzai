import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { listActiveProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function CompoundsPage() {
  const products = await listActiveProducts();

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-8 border-b border-ink/10 pb-10 md:flex-row md:items-end md:justify-between md:gap-10">
          <div>
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink/45">
              Catalog
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl lg:text-[2.5rem] lg:leading-tight">
              Compounds
            </h1>
            <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-ink/60">
              Research-grade peptides for qualified laboratories—traceable
              quality documentation and predictable fulfillment.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 font-mono text-[0.6875rem] text-ink/50 md:text-right">
            <span>US-only · Flat-rate shipping</span>
            <span>
              Questions?{' '}
              <a
                href="mailto:support@bonz.ai"
                className="text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:text-ink/80"
              >
                support@bonz.ai
              </a>
            </span>
            <Link
              href="/lab-reports"
              className="text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:text-ink/80"
            >
              Lab reports &amp; COA
            </Link>
          </div>
        </div>

        {products.length === 0 ? (
          <p className="mt-14 text-center text-[0.9375rem] text-ink/50">
            No compounds are listed right now. Check back soon.
          </p>
        ) : (
          <ul className="mt-10 grid list-none grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-8">
            {products.map((p, i) => (
              <li key={p.id}>
                <ProductCard product={p} imageIndex={i} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

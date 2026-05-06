import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/products";

export function RelatedProductGrid({
  catalog,
  currentSlug,
}: {
  catalog: Product[];
  currentSlug: string;
}) {
  const related = catalog
    .filter((p) => p.slug !== currentSlug)
    .slice(0, 3)
    .map((p) => ({
      product: p,
      imageIndex: Math.max(0, catalog.findIndex((x) => x.id === p.id)),
    }));

  if (related.length === 0) return null;

  return (
    <section className="mx-auto mt-14 max-w-7xl border-t border-ink/10 px-5 pt-12 sm:px-8 pb-20 md:pb-14">
      <h2 className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink/45">
        Related compounds
      </h2>
      <p className="mt-2 max-w-xl text-sm text-ink/55">
        Other SKUs lab buyers often order alongside this material.
      </p>
      <ul className="mt-8 grid list-none grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.map(({ product, imageIndex }) => (
          <li key={product.id}>
            <ProductCard product={product} imageIndex={imageIndex} />
          </li>
        ))}
      </ul>
    </section>
  );
}

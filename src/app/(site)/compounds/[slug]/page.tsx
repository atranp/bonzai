import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { ProductJsonLd } from "@/components/ProductJsonLd";
import { PurchasePanel } from "@/components/PurchasePanel";
import { RelatedProductGrid } from "@/components/RelatedProducts";
import { SpecGrid } from "@/components/SpecGrid";
import { productMarkdownExcerpt } from "@/lib/product-excerpt";
import { resolveProductImageSrc } from "@/lib/product-image";
import { getProductBySlug, listActiveProducts } from "@/lib/products";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

function readMeta(meta: Record<string, unknown>, key: string) {
  const v = meta[key];
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return "—";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Compound · BONZAI Peptides" };
  }

  const excerpt = productMarkdownExcerpt(product.description_md);
  const desc = [product.subtitle, excerpt].filter(Boolean).join(" · ");
  const path = resolveProductImageSrc(product, 0);
  const ogImage = absoluteUrl(path);
  const url = `/compounds/${product.slug}`;

  return {
    title: `${product.name} · BONZAI Peptides`,
    description: desc.slice(0, 200),
    alternates: { canonical: absoluteUrl(url) },
    openGraph: {
      title: product.name,
      description: desc.slice(0, 200),
      type: "website",
      url: absoluteUrl(url),
      images: [{ url: ogImage, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: desc.slice(0, 200),
      images: [ogImage],
    },
  };
}

export default async function CompoundDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, catalog] = await Promise.all([
    getProductBySlug(slug),
    listActiveProducts(),
  ]);
  if (!product) notFound();

  const heroSrc = resolveProductImageSrc(product, 0);

  const rows = [
    { k: "Code", v: product.foxy_code },
    { k: "Dose", v: readMeta(product.meta, "dose") },
    { k: "Purity", v: readMeta(product.meta, "purity") },
    { k: "CAS", v: readMeta(product.meta, "cas") },
    { k: "Lot", v: readMeta(product.meta, "lot") },
  ];

  return (
    <main className="flex-1 pb-24 md:pb-0">
      <ProductJsonLd product={product} />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          href="/compounds"
          className="inline-flex items-center gap-2 text-[0.8125rem] font-medium text-ink/45 transition-colors hover:text-ink"
        >
          <span aria-hidden className="text-ink/30">
            ←
          </span>
          Compounds
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(300px,1.15fr)] lg:items-start lg:gap-10 xl:gap-12">
          <div>
            <div className="overflow-hidden rounded-2xl border border-ink/10 bg-[color-mix(in_oklab,var(--bone)_92%,white)] text-ink shadow-[0_1px_3px_rgba(10,9,6,0.06)]">
              <figure className="m-0 border-b border-ink/6 px-5 py-6 md:px-6 md:py-8">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                  <Image
                    src={heroSrc}
                    alt={product.name}
                    fill
                    className="object-contain"
                    sizes="(max-width:1023px) 92vw, 45vw"
                    priority
                  />
                </div>
                <figcaption className="sr-only">Product photograph</figcaption>
              </figure>
              <div className="px-5 py-7 md:px-8 md:py-8">
                <p className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-ink/40">
                  Overview
                </p>
                <p className="mt-3 max-w-xl text-base font-medium leading-snug text-ink/90 md:text-lg">
                  Research-grade material for qualified laboratory use.
                </p>
                <Markdown className="mt-4 max-w-xl">
                  {product.description_md}
                </Markdown>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:sticky lg:top-28">
            <PurchasePanel
              name={product.name}
              subtitle={product.subtitle}
              slug={product.slug}
              foxyCode={product.foxy_code}
              priceCents={product.price_cents}
              currency={product.currency}
            />
            <p className="text-[0.6875rem] leading-relaxed text-ink/50">
              For qualified laboratory research only—not for human subjects,
              clinical use, dietary purposes, or consumer applications.
            </p>
            <SpecGrid title="Specifications" rows={rows} />
          </div>
        </div>

        <RelatedProductGrid catalog={catalog} currentSlug={product.slug} />
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-bone/95 px-4 py-3 shadow-[0_-8px_30px_rgba(10,9,6,0.08)] backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-1">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold tracking-tight text-ink">
              {product.name}
            </div>
            <div className="font-mono text-[0.6875rem] text-ink/50">
              {product.foxy_code}
            </div>
          </div>
          <Link
            href={`/cart`}
            className="ml-auto inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-ink px-5 text-sm font-semibold text-bone transition-colors hover:bg-ink/92"
          >
            Add to cart
          </Link>
        </div>
      </div>
    </main>
  );
}

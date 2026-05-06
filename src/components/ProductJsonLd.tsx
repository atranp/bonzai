import { absoluteUrl } from "@/lib/site";
import type { Product } from "@/lib/products";
import { resolveProductImageSrc } from "@/lib/product-image";

export function ProductJsonLd({ product }: { product: Product }) {
  const path = resolveProductImageSrc(product, 0);
  const imageUrls = /^https?:\/\//i.test(path)
    ? [path]
    : [absoluteUrl(path)];

  const priceAmount = (product.price_cents / 100).toFixed(2);
  const currency = (product.currency || "USD").toUpperCase();

  const structured = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.subtitle?.trim() ||
      `${product.name} — research-grade peptide reference material.`,
    sku: product.foxy_code,
    image: imageUrls,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/compounds/${encodeURIComponent(product.slug)}`),
      priceCurrency: currency,
      price: priceAmount,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <script
      type="application/ld+json"
      // JSON-LD is safe when built from primitives + known strings
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }}
    />
  );
}

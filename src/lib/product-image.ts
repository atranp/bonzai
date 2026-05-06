import type { Product } from "@/lib/products";

function isHttpOrHttpsUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Local `/public` assets keyed by catalog slug until `image_url` is populated in DB. */
const LOCAL_BY_SLUG: Record<string, string> = {
  "bpc-157": "/bch-157-product.png",
  "ghk-cu": "/ghk-cu-product.png",
  rt3: "/rt3-product.png",
  /** Common alternate slugs */
  "rt-3": "/rt3-product.png",
};

const REMOTE_FALLBACKS = [
  "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1628595351029-c2bf17511435?auto=format&fit=crop&w=800&q=80",
];

/**
 * Resolved image for product tiles/PDPs. Prefer a mapped `/public` asset when the
 * slug matches, then a valid HTTP(S) Supabase `image_url`, then a generic remote fallback.
 */
export function resolveProductImageSrc(
  product: Pick<Product, "slug" | "image_url">,
  fallbackIndex = 0,
): string {
  const key = product.slug.trim().toLowerCase();
  const local = LOCAL_BY_SLUG[key];
  if (local) return local;

  const remote = product.image_url?.trim();
  if (remote && isHttpOrHttpsUrl(remote)) return remote;

  return REMOTE_FALLBACKS[fallbackIndex % REMOTE_FALLBACKS.length]!;
}

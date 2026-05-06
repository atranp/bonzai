/** Site origin for canonical URLs, OG images, JSON-LD. No trailing slash. */
export function getSiteOrigin(): string {
  const configured =
    process.env.SITE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export function absoluteUrl(pathnameOrUrl: string): string {
  if (/^https?:\/\//i.test(pathnameOrUrl)) return pathnameOrUrl;
  const origin = getSiteOrigin();
  const path = pathnameOrUrl.startsWith("/")
    ? pathnameOrUrl
    : `/${pathnameOrUrl}`;
  return `${origin}${path}`;
}

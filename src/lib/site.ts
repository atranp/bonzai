/** Fix common typo: `https:/host` (one slash) breaks redirects (browser treats as path on current host). */
function fixMalformedProtocol(input: string): string {
  return input
    .replace(/^https:\/(?!\/)/i, "https://")
    .replace(/^http:\/(?!\/)/i, "http://");
}

/**
 * Site origin for canonical URLs, OG images, JSON-LD, Foxy `redirect` absolute URLs.
 * No trailing slash; always valid `https://host` or `http://host` when possible.
 */
export function getSiteOrigin(): string {
  const configured =
    process.env.SITE_URL?.trim() || process.env.NEXT_PUBLIC_SITE_URL?.trim();

  let candidate =
    configured && configured.length > 0
      ? fixMalformedProtocol(configured.replace(/\/$/, ""))
      : "";

  if (!candidate) {
    const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
    const vercel = process.env.VERCEL_URL?.trim();
    const host =
      production?.replace(/^https?:\/\//, "").replace(/\/$/, "") ??
      vercel?.replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (host) candidate = `https://${host}`;
  }

  if (!candidate) return "http://localhost:3000";

  try {
    if (!/^https?:\/\//i.test(candidate)) {
      candidate = `https://${candidate.replace(/^\/+/, "")}`;
    }
    const u = new URL(candidate);
    return `${u.protocol}//${u.host}`;
  } catch {
    return candidate.replace(/\/$/, "");
  }
}

export function absoluteUrl(pathnameOrUrl: string): string {
  if (/^https?:\/\//i.test(pathnameOrUrl)) {
    const fixed = fixMalformedProtocol(pathnameOrUrl);
    try {
      return new URL(fixed).href;
    } catch {
      return fixed;
    }
  }
  const origin = getSiteOrigin();
  const path = pathnameOrUrl.startsWith("/")
    ? pathnameOrUrl
    : `/${pathnameOrUrl}`;
  try {
    return new URL(path, `${origin}/`).href;
  } catch {
    return `${origin}${path}`;
  }
}

/** Absolute URL for your own pages (emails, OG, etc.). Prefer `checkoutReturnPathForFoxy` for Foxy `redirect`. */
export function checkoutReturnAbsoluteUrl(orderRef: string): string {
  const path = `/checkout/return?ref=${encodeURIComponent(orderRef)}`;
  return new URL(path, `${getSiteOrigin()}/`).href;
}

/**
 * Value for Foxy cart `redirect=` only: **path + query**, no origin.
 * Passing `https://www...` here can make Foxy prepend the store URL from admin and emit
 * `Refresh: .../https://www...` (broken). Relative paths resolve against your configured store domain.
 */
export function checkoutReturnPathForFoxy(orderRef: string): string {
  return `/checkout/return?ref=${encodeURIComponent(orderRef)}`;
}

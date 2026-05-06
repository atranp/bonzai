"use client";

import type { ReactNode } from "react";

/**
 * Bypasses Next client router / RSC fetches (which hit `?_rsc=` and can follow a 302 to Foxy —
 * Foxy omits ACAO headers → bogus “CORS” errors). Use full document navigation for external redirects.
 */
export function HardNavigateButton({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button type="button" className={className} onClick={() => window.location.assign(href)}>
      {children}
    </button>
  );
}

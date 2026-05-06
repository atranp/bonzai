import Link from "next/link";
import { type ComponentProps } from "react";

import { createSupabaseServer, getSessionUser } from "@/lib/supabase/server";

function CartIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 7h14l-1.4 7.4a2 2 0 0 1-2 1.6H9a2 2 0 0 1-2-1.6L5.5 3.5H3" />
      <path d="M9 20a1 1 0 1 0 0 .01" />
      <path d="M17 20a1 1 0 1 0 0 .01" />
    </svg>
  );
}

function Logo() {
  return (
    <Link
      href="/"
      className="group inline-flex shrink-0 flex-col gap-1 py-1 leading-none text-bone transition-opacity hover:opacity-90"
    >
      <span className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">
        <span>BONZ</span>
        <span className="text-toriRed">A</span>
        <span>I</span>
      </span>
      <span className="pl-[0.02em] text-[0.78rem] font-semibold tracking-wider text-bone/50">
        Peptides
      </span>
    </Link>
  );
}

export async function SiteHeader({
  className,
  ...props
}: ComponentProps<'header'>) {
  const user = await getSessionUser();
  const supabase = await createSupabaseServer();

  let cartCount = 0;
  if (user) {
    const { data, error } = await supabase
      .from("cart_items")
      .select("qty")
      .eq("user_id", user.id);
    if (!error && data) {
      cartCount = data.reduce((sum, r) => sum + (r.qty as number), 0);
    }
  }

  const link =
    "py-2 text-[0.9375rem] font-medium text-bone/60 transition-colors hover:text-bone";

  return (
    <header
      className={`sticky top-0 z-40 shrink-0 border-b border-bone/10 bg-ink/80 backdrop-blur-md ${className ?? ""}`}
      {...props}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5 sm:gap-10 sm:px-8 sm:py-6">
        <Logo />
        <nav className="hidden flex-1 items-center justify-center gap-12 md:flex">
          <Link href="/compounds" className={link}>
            Compounds
          </Link>
          <Link href="/research" className={link}>
            Research
          </Link>
          <Link href="/about" className={link}>
            About
          </Link>
          <Link href="/lab-reports" className={link}>
            Lab reports
          </Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href={user ? "/account" : "/login"}
            className="whitespace-nowrap py-2 text-[0.9375rem] font-medium text-bone/60 transition-colors hover:text-bone"
          >
            {user ? "Account" : "Sign in"}
          </Link>
          <Link
            href="/cart"
            aria-label={`Cart${cartCount > 0 ? ` (${cartCount} items)` : ""}`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-bone/70 transition-colors hover:bg-bone/10 hover:text-bone"
          >
            <CartIcon className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-toriRed px-1.5 py-0.5 text-[0.65rem] font-semibold leading-none text-bone">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/compounds"
            className="rounded-full bg-bone px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-bone/90 sm:px-5"
          >
            Shop
          </Link>
        </div>
      </div>
    </header>
  );
}

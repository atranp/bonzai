import Link from 'next/link';
import { type ComponentProps } from 'react';

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

export function SiteHeader({ className, ...props }: ComponentProps<'header'>) {
  const link =
    'py-2 text-[0.9375rem] font-medium text-bone/60 transition-colors hover:text-bone';

  return (
    <header
      className={`sticky top-0 z-40 shrink-0 border-b border-bone/10 bg-ink/80 backdrop-blur-md ${className ?? ''}`}
      {...props}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-10 px-6 py-5 sm:px-8 sm:py-6">
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
        <Link
          href="/compounds"
          className="shrink-0 rounded-full bg-bone px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-bone/90"
        >
          Shop
        </Link>
      </div>
    </header>
  );
}

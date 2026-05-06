import Link from 'next/link';

const footerLink = 'text-sm text-bone/55 transition-colors hover:text-bone';

export function SiteFooter() {
  return (
    <footer className="mt-auto shrink-0 border-t border-bone/12 bg-ink text-bone">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-10">
          <div className="md:col-span-1">
            <div className="text-lg font-bold tracking-tight">
              BONZ<span className="text-toriRed">A</span>I
            </div>
            <p className="mt-1 text-xs font-semibold tracking-wider text-bone/45">
              Peptides
            </p>
            <p className="mt-4 text-sm leading-relaxed text-bone/50">
              Peptide research materials for qualified institutions. Supporting
              longitudinal health science with traceable quality—not for
              personal or clinical use.
            </p>
          </div>
          <div>
            <div className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.16em] text-bone/45">
              Shop
            </div>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/compounds" className={footerLink}>
                  All compounds
                </Link>
              </li>
              <li>
                <Link href="/research" className={footerLink}>
                  Research
                </Link>
              </li>
              <li>
                <Link href="/lab-reports" className={footerLink}>
                  Lab reports
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.16em] text-bone/45">
              Company
            </div>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/about" className={footerLink}>
                  About
                </Link>
              </li>
              <li>
                <a href="mailto:support@bonz.ai" className={footerLink}>
                  Contact
                </a>
              </li>
              <li>
                <Link href="/lab-reports" className={footerLink}>
                  Quality &amp; COA
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.16em] text-bone/45">
              Legal
            </div>
            <ul className="mt-4 space-y-2.5">
              <li>
                <span className={`${footerLink} cursor-default`}>
                  Terms of service
                </span>
              </li>
              <li>
                <span className={`${footerLink} cursor-default`}>
                  Privacy policy
                </span>
              </li>
              <li>
                <span className={`${footerLink} cursor-default`}>
                  Shipping &amp; returns
                </span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-14 border-t border-bone/12 pt-8">
          <p className="font-mono text-[0.65rem] leading-relaxed text-bone/38">
            Laboratory research only. Buyer represents appropriate licensing and
            institutional use. Products are not intended to diagnose, treat,
            cure, or prevent any disease.
          </p>
          <p className="mt-4 text-[0.6875rem] text-bone/35">
            © {new Date().getFullYear()} BONZAI Peptides. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

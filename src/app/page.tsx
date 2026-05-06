import Image from 'next/image';
import Link from 'next/link';
import { formatUSD } from '@/lib/money';
import { resolveProductImageSrc } from '@/lib/product-image';
import { listActiveProducts, type Product } from '@/lib/products';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let featured: Product[] = [];
  try {
    const all = await listActiveProducts();
    featured = all.slice(0, 3);
  } catch {
    featured = [];
  }

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1">
        {/* Hero */}
        <section className="relative w-full overflow-x-clip">
          <div className="relative isolate min-h-fit w-full overflow-hidden bg-bone text-ink">
            <Image
              src="/hero-bg.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="pointer-events-none select-none object-cover object-[center_top] sm:object-center"
            />
            <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-12 sm:px-8 md:py-16">
              <div className="relative max-w-xl">
                <div
                  aria-hidden
                  className="absolute -inset-x-4 -inset-y-5 -z-10 rounded-3xl bg-linear-to-br from-bone/95 from-0% via-bone/72 via-42% to-transparent to-98% sm:-inset-x-5 sm:rounded-[1.625rem] sm:-inset-y-6 sm:via-50% md:right-3 lg:via-bone/62"
                />
                <div className="relative px-7 py-9 sm:px-8 md:px-10 md:py-11">
                  <p className="font-mono text-[0.6875rem] font-medium uppercase leading-normal tracking-[0.18em] text-ink/55">
                    Laboratory research · not for human use
                  </p>
                  <h1 className="mt-7 text-balance text-4xl font-bold leading-[1.07] tracking-[-0.02em] text-ink md:mt-8 md:text-[2.75rem] md:leading-[1.06] lg:text-[3.375rem] lg:leading-[1.06] xl:text-6xl xl:leading-[1.05]">
                    Peptide compounds,
                    <br />
                    always lab-tested.
                  </h1>
                  <p className="mt-7 w-full max-w-none text-[0.98rem] leading-[1.65] text-ink/72 md:mt-8 md:text-[1.0625rem] md:leading-[1.7]">
                    Every batch is run through independent analytical testing
                    before release. Certificates of analysis on file, lot
                    traceability end to end, and purity targets stated up front.
                    Domestic orders typically ship within 48 hours.
                  </p>
                  <div className="relative mt-11 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <Link
                      href="/compounds"
                      className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-bone transition-colors hover:bg-ink/90"
                    >
                      Explore compounds
                    </Link>
                    <Link
                      href="/lab-reports"
                      className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-ink/28 bg-bone/80 px-6 text-sm font-semibold text-ink shadow-[0_1px_2px_rgba(10,9,6,0.06)] backdrop-blur-sm transition-colors hover:border-ink/40 hover:bg-bone/92"
                    >
                      View lab reports
                    </Link>
                  </div>
                  <div className="relative mt-13 border-t border-ink/16 pt-11 md:mt-14 md:pt-12">
                    <div
                      aria-hidden
                      className="absolute left-8 top-0 h-px w-18 bg-toriRed sm:left-10"
                    />
                    <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-3 sm:gap-x-6 md:gap-x-8">
                      <article className="relative min-w-0 pl-6 sm:pl-7">
                        <div
                          aria-hidden
                          className="absolute top-1 bottom-0 left-1.5 w-px bg-linear-to-b from-toriRed/90 via-toriRed/35 to-transparent sm:left-2"
                        />
                        <div className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-toriRed">
                          01 · Verification
                        </div>
                        <div className="mt-3.5 flex items-baseline gap-0.5 tabular-nums tracking-tight">
                          <span className="text-[2.5rem] font-bold leading-none text-toriRed md:text-[2.875rem]">
                            99
                          </span>
                          <span className="text-[1.875rem] font-bold leading-none text-toriRed/75 md:text-[2rem]">
                            %
                          </span>
                        </div>
                        <h2 className="mt-3.5 text-sm font-semibold leading-snug tracking-tight text-ink">
                          Purity certified
                        </h2>
                        <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink/62 sm:text-sm">
                          Verified by independent third-party{' '}
                          <span className="font-medium text-ink">HPLC</span> on
                          every batch.
                        </p>
                      </article>
                      <article className="relative min-w-0 pl-6 sm:pl-7">
                        <div
                          aria-hidden
                          className="absolute top-1 bottom-0 left-1.5 w-px bg-linear-to-b from-toriRed/90 via-toriRed/35 to-transparent sm:left-2"
                        />
                        <div className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-toriRed">
                          02 · Fulfillment
                        </div>
                        <div className="mt-3.5 flex items-baseline gap-0.5 tabular-nums tracking-tight">
                          <span className="text-[2.5rem] font-bold leading-none text-toriRed md:text-[2.875rem]">
                            48
                          </span>
                          <span className="text-[1.875rem] font-bold leading-none text-toriRed/72 md:text-[2rem]">
                            h
                          </span>
                        </div>
                        <h2 className="mt-3.5 text-sm font-semibold leading-snug tracking-tight text-ink">
                          Ships in 48 hours
                        </h2>
                        <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink/62 sm:text-sm">
                          Cold-chain packaging and{' '}
                          <span className="font-medium text-ink">tracked</span>{' '}
                          domestic shipping.
                        </p>
                      </article>
                      <article className="relative min-w-0 pl-6 sm:pl-7">
                        <div
                          aria-hidden
                          className="absolute top-1 bottom-0 left-1.5 w-px bg-linear-to-b from-toriRed/90 via-toriRed/35 to-transparent sm:left-2"
                        />
                        <div className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.15em] text-toriRed">
                          03 · Stability
                        </div>
                        <div className="mt-3.5 flex items-baseline gap-0 tabular-nums tracking-tight">
                          <span className="text-[2.5rem] font-bold leading-none text-toriRed md:text-[2.875rem]">
                            −80
                          </span>
                        </div>
                        <h2 className="mt-3.5 text-sm font-semibold leading-snug tracking-tight text-ink">
                          Storage stable
                        </h2>
                        <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink/62 sm:text-sm">
                          Lyophilized for shelf stability. Includes
                          reconstitution guide.
                        </p>
                      </article>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-bone/15 bg-ink px-6 py-10 sm:px-8">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4 md:gap-6 lg:gap-10">
            {[
              ['COA archived', 'Per-lot analytical records'],
              ['HPLC-backed', 'Third-party verification'],
              ['Cold-chain', 'Insulated outbound'],
              ['Traceable lots', 'End-to-end chain'],
            ].map(([t, sub]) => (
              <div key={t} className="min-w-0">
                <div className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.14em] text-toriRed">
                  {t}
                </div>
                <p className="mt-2 text-[0.8125rem] leading-snug text-bone/50">
                  {sub}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured products */}
        <section className="bg-bone px-6 py-16 text-ink sm:px-8 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-toriRed">
                  Featured
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                  Compound lineup
                </h2>
                <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-ink/65">
                  Rotation of high-demand reference materials—all run through QC
                  before release.
                </p>
              </div>
              <Link
                href="/compounds"
                className="shrink-0 text-sm font-semibold text-ink underline decoration-ink/25 underline-offset-4 transition-colors hover:decoration-ink"
              >
                View all →
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
              {featured.length === 0 ? (
                <p className="col-span-full text-sm text-ink/55">
                  Catalog loading unavailable—visit{' '}
                  <Link
                    href="/compounds"
                    className="font-medium text-ink underline"
                  >
                    Compounds
                  </Link>{' '}
                  directly.
                </p>
              ) : (
                featured.map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/compounds/${p.slug}`}
                    className="group overflow-hidden rounded-3xl border border-ink/10 bg-linear-to-b from-bone to-bone shadow-[0_14px_40px_-28px_rgba(10,9,6,0.45)] ring-ink/10 transition-[border-color,box-shadow] hover:border-toriRed/35 hover:shadow-[0_20px_50px_-36px_rgba(10,9,6,0.5)]"
                  >
                    <div className="relative aspect-square bg-ink/5">
                      <Image
                        src={resolveProductImageSrc(p, i)}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                        sizes="(max-width:768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-6 pb-7">
                      <div className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-ink/45">
                        {p.subtitle ?? 'Research-grade'}
                      </div>
                      <div className="mt-2 text-lg font-bold tracking-tight text-ink">
                        {p.name}
                      </div>
                      <div className="mt-4 flex items-baseline justify-between gap-3">
                        <span className="font-mono text-sm text-toriRed tabular-nums">
                          From {formatUSD(p.price_cents)}
                        </span>
                        <span className="text-xs font-semibold opacity-70 transition-opacity group-hover:opacity-100">
                          Details →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Newsletter-ish CTA */}
        <section className="border-t border-bone/15 bg-linear-to-br from-[#eae6dc] via-bone to-[#ebe7df] px-6 py-16 text-ink sm:px-8 md:py-18">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="min-w-0 max-w-xl">
              <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-toriRed">
                Stay current
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                Lot drops &amp; COA updates
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                Low-volume list: new catalog SKUs, restocks, and method notes.
                No promo spam.
              </p>
            </div>
            <form
              className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center"
              action="#"
            >
              <label htmlFor="home-email" className="sr-only">
                Email
              </label>
              <input
                id="home-email"
                type="email"
                placeholder="you@institution.edu"
                className="h-12 w-full flex-1 rounded-full border border-ink/15 bg-white/80 px-5 text-sm text-ink shadow-inner outline-none ring-0 placeholder:text-ink/35 focus:border-toriRed/50 focus:ring-2 focus:ring-toriRed/20"
              />
              <button
                type="submit"
                className="h-12 shrink-0 rounded-full bg-ink px-7 text-sm font-semibold text-bone transition-colors hover:bg-ink/90"
              >
                Notify me
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

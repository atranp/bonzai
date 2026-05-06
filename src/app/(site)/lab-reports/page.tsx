import Link from 'next/link';

const reports = [
  { id: 'coa-bpc-157-b240512', title: 'COA — BPC-157 — Lot B240512' },
  { id: 'coa-ghk-cu-g240501', title: 'COA — GHK-Cu — Lot G240501' },
  { id: 'coa-rt3-r240421', title: 'COA — RT3 — Lot R240421' },
];

export default function LabReportsPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink/45">
              Lab reports
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Certificates of analysis
            </h1>
          </div>
          <div className="font-mono text-xs text-ink/50">
            Verified · Batch-level traceability
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4">
          {reports.map((r) => (
            <Link
              key={r.id}
              href="#"
              className="flex items-center justify-between gap-6 rounded-2xl border border-ink/10 bg-[color-mix(in_oklab,var(--bone)_94%,white)] px-6 py-5 shadow-[0_1px_3px_rgba(10,9,6,0.05)] transition-[border-color,box-shadow] hover:border-ink/18 hover:shadow-[0_8px_24px_-16px_rgba(10,9,6,0.15)]"
            >
              <div className="text-sm font-medium text-ink">{r.title}</div>
              <div className="text-xs font-medium text-ink/45">PDF</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

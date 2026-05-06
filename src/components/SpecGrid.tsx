type Row = { k: string; v: string };

export function SpecGrid({
  title,
  rows,
  className,
}: {
  title: string;
  rows: Row[];
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-ink/10 bg-[color-mix(in_oklab,var(--bone)_94%,white)] shadow-[0_1px_3px_rgba(10,9,6,0.05)] ${className ?? ""}`}
    >
      <div className="border-b border-ink/10 px-5 py-4">
        <div className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-ink/45">
          {title}
        </div>
      </div>
      <dl className="grid grid-cols-1 gap-0 divide-y divide-ink/6">
        {rows.map((r) => (
          <div
            key={r.k}
            className="grid grid-cols-[minmax(0,0.85fr)_1.15fr] gap-4 px-5 py-3.5"
          >
            <dt className="text-[0.625rem] font-medium uppercase tracking-[0.12em] text-ink/40">
              {r.k}
            </dt>
            <dd className="text-right font-mono text-[0.8125rem] tabular-nums text-ink/85">
              {r.v}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}


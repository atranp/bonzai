export default function CompoundDetailLoading() {
  return (
    <main className="flex-1 animate-pulse pb-24 md:pb-0">
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="h-4 max-w-[7rem] rounded bg-ink/8" />
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(300px,1.15fr)]">
          <div className="space-y-6">
            <div className="h-11 max-w-[18rem] rounded-lg bg-ink/10 md:h-12" />
            <div className="h-3 max-w-[10rem] rounded bg-ink/8" />
            <div className="space-y-3 rounded-2xl border border-ink/8 p-6">
              <div className="aspect-square w-full rounded-lg bg-ink/8" />
              <div className="h-3 max-w-[80%] rounded bg-ink/8" />
              <div className="h-3 max-w-[60%] rounded bg-ink/8" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-72 rounded-2xl border border-ink/8 bg-ink/6" />
            <div className="h-48 rounded-2xl border border-ink/8 bg-ink/6" />
          </div>
        </div>
      </section>
    </main>
  );
}

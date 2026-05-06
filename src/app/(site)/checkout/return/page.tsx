import Link from "next/link";

export default async function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-2xl px-6 py-18">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink/45">
          Checkout
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
          Processing…
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/60">
          If your payment succeeded, your receipt will be available shortly.
        </p>
        {ref ? (
          <div className="mt-10">
            <Link
              href={`/receipt/${encodeURIComponent(ref)}`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-bone transition-colors hover:bg-ink/90"
            >
              View receipt
            </Link>
          </div>
        ) : (
          <div className="mt-10 font-mono text-xs text-ink/50">
            Missing order reference.
          </div>
        )}
      </section>
    </main>
  );
}

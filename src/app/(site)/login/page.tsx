import Link from "next/link";
import { signIn } from "@/lib/auth/actions";

const card =
  "rounded-2xl border border-ink/10 bg-[color-mix(in_oklab,var(--bone)_94%,white)] p-6 shadow-[0_1px_3px_rgba(10,9,6,0.05)]";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; error?: string; notice?: string }>;
}) {
  const { returnTo, error, notice } = await searchParams;
  const next = returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/account";

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-md px-6 py-18">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink/45">
          Account
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
          Sign in
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/60">
          Use the email and password for your BONZAI account.
        </p>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        ) : null}
        {notice ? (
          <div className="mt-6 rounded-xl border border-ink/12 bg-ink/[0.04] px-4 py-3 text-sm text-ink/80">
            {notice}
          </div>
        ) : null}

        <form action={signIn} className={`mt-10 ${card}`}>
          <input type="hidden" name="returnTo" value={next} />
          <div className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink/45">
                Email
              </span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="h-11 rounded-xl border border-ink/15 bg-white/90 px-4 text-sm text-ink outline-none ring-0 placeholder:text-ink/35 focus:border-toriRed/45 focus:ring-2 focus:ring-toriRed/15"
                placeholder="you@lab.org"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink/45">
                Password
              </span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="h-11 rounded-xl border border-ink/15 bg-white/90 px-4 text-sm text-ink outline-none ring-0 placeholder:text-ink/35 focus:border-toriRed/45 focus:ring-2 focus:ring-toriRed/15"
              />
            </label>
            <button
              type="submit"
              className="h-12 rounded-full bg-ink text-sm font-semibold text-bone transition-colors hover:bg-ink/90"
            >
              Sign in
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-ink/55">
          No account?{" "}
          <Link
            href={`/signup?returnTo=${encodeURIComponent(next)}`}
            className="font-medium text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
          >
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}

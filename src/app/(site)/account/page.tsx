import Link from "next/link";
import { getSessionUser } from "@/lib/supabase/server";

const card =
  "rounded-2xl border border-ink/10 bg-[color-mix(in_oklab,var(--bone)_94%,white)] p-6 shadow-[0_1px_3px_rgba(10,9,6,0.05)]";

export default async function AccountHomePage() {
  const user = await getSessionUser();
  const email = user?.email ?? "";

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-2xl px-6 py-18">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink/45">
          Account
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
          Welcome back
        </h1>
        <p className="mt-4 font-mono text-sm text-ink/60">{email}</p>

        <ul className={`mt-10 grid list-none gap-4 ${card} sm:grid-cols-2`}>
          <li>
            <Link
              href="/account/orders"
              className="block rounded-xl border border-ink/8 bg-bone/50 p-5 transition-colors hover:border-ink/20 hover:bg-bone/80"
            >
              <div className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink/45">
                Orders
              </div>
              <div className="mt-2 text-sm font-medium text-ink">Order history</div>
            </Link>
          </li>
          <li>
            <Link
              href="/account/shipping"
              className="block rounded-xl border border-ink/8 bg-bone/50 p-5 transition-colors hover:border-ink/20 hover:bg-bone/80"
            >
              <div className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink/45">
                Shipping
              </div>
              <div className="mt-2 text-sm font-medium text-ink">Saved addresses</div>
            </Link>
          </li>
        </ul>

        <div className="mt-10">
          <Link
            href="/logout"
            className="text-sm font-medium text-ink/55 underline decoration-ink/20 underline-offset-4 transition-colors hover:text-ink"
          >
            Sign out
          </Link>
        </div>
      </section>
    </main>
  );
}

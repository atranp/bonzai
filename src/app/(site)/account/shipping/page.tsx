import Link from "next/link";
import {
  createShippingAddress,
  deleteShippingAddress,
  setDefaultShippingAddress,
  updateShippingAddress,
} from "@/lib/account/shipping-actions";
import { createSupabaseServer } from "@/lib/supabase/server";

const card =
  "rounded-2xl border border-ink/10 bg-[color-mix(in_oklab,var(--bone)_94%,white)] p-6 shadow-[0_1px_3px_rgba(10,9,6,0.05)]";

const input =
  "h-11 w-full rounded-xl border border-ink/15 bg-white/90 px-4 text-sm text-ink outline-none ring-0 placeholder:text-ink/35 focus:border-toriRed/45 focus:ring-2 focus:ring-toriRed/15";

const label = "text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink/45";

type Row = {
  id: string;
  label: string | null;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  region: string | null;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
};

export default async function ShippingPage() {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase
    .from("shipping_addresses")
    .select(
      "id,label,first_name,last_name,company,address1,address2,city,region,postal_code,country,phone,is_default",
    )
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as Row[];

  return (
    <main className="flex-1">
      <section className="mx-auto max-w-3xl px-6 py-18">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink/45">
              Account
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
              Shipping addresses
            </h1>
          </div>
          <Link
            href="/account"
            className="text-sm font-medium text-ink/55 transition-colors hover:text-ink"
          >
            ← Account
          </Link>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink/60">
          Saved addresses are for your convenience at checkout. FoxyCart may still
          collect the ship-to on hosted checkout.
        </p>

        <div className={`mt-10 ${card}`}>
          <h2 className="text-sm font-semibold text-ink">Add address</h2>
          <form action={createShippingAddress} className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 sm:col-span-2">
                <span className={label}>Label (optional)</span>
                <input name="label" className={input} placeholder="Lab shipping" />
              </label>
              <label className="grid gap-2">
                <span className={label}>First name</span>
                <input name="first_name" className={input} />
              </label>
              <label className="grid gap-2">
                <span className={label}>Last name</span>
                <input name="last_name" className={input} />
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <span className={label}>Company</span>
                <input name="company" className={input} />
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <span className={label}>Address line 1</span>
                <input name="address1" className={input} required />
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <span className={label}>Address line 2</span>
                <input name="address2" className={input} />
              </label>
              <label className="grid gap-2">
                <span className={label}>City</span>
                <input name="city" className={input} required />
              </label>
              <label className="grid gap-2">
                <span className={label}>Region / state</span>
                <input name="region" className={input} />
              </label>
              <label className="grid gap-2">
                <span className={label}>Postal code</span>
                <input name="postal_code" className={input} required />
              </label>
              <label className="grid gap-2">
                <span className={label}>Country</span>
                <input name="country" className={input} defaultValue="US" />
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <span className={label}>Phone</span>
                <input name="phone" type="tel" className={input} />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input name="is_default" type="checkbox" className="rounded border-ink/25" />
              Set as default
            </label>
            <button
              type="submit"
              className="h-11 rounded-full bg-ink text-sm font-semibold text-bone transition-colors hover:bg-ink/90"
            >
              Save address
            </button>
          </form>
        </div>

        <ul className="mt-10 grid list-none gap-8">
          {rows.map((r) => (
            <li key={r.id} className={card}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-ink">
                    {r.label || "Address"}
                    {r.is_default ? (
                      <span className="ml-2 rounded-full bg-ink/8 px-2 py-0.5 font-mono text-[0.65rem] font-medium uppercase tracking-wider text-ink/65">
                        Default
                      </span>
                    ) : null}
                  </div>
                  <address className="mt-3 not-italic text-sm leading-relaxed text-ink/70">
                    {[r.first_name, r.last_name].filter(Boolean).join(" ")}
                    <br />
                    {r.company ? (
                      <>
                        {r.company}
                        <br />
                      </>
                    ) : null}
                    {r.address1}
                    <br />
                    {r.address2 ? (
                      <>
                        {r.address2}
                        <br />
                      </>
                    ) : null}
                    {[r.city, r.region, r.postal_code].filter(Boolean).join(", ")}
                    <br />
                    {r.country}
                    {r.phone ? (
                      <>
                        <br />
                        {r.phone}
                      </>
                    ) : null}
                  </address>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!r.is_default ? (
                    <form action={setDefaultShippingAddress}>
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-ink/15 px-4 py-2 text-xs font-medium text-ink transition-colors hover:border-ink/30"
                      >
                        Make default
                      </button>
                    </form>
                  ) : null}
                  <form action={deleteShippingAddress}>
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-red-500/25 px-4 py-2 text-xs font-medium text-red-800 transition-colors hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>

              <details className="mt-6 border-t border-ink/8 pt-6">
                <summary className="cursor-pointer text-sm font-medium text-ink/55">
                  Edit
                </summary>
                <form action={updateShippingAddress} className="mt-6 grid gap-4">
                  <input type="hidden" name="id" value={r.id} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 sm:col-span-2">
                      <span className={label}>Label</span>
                      <input
                        name="label"
                        className={input}
                        defaultValue={r.label ?? ""}
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className={label}>First name</span>
                      <input
                        name="first_name"
                        className={input}
                        defaultValue={r.first_name ?? ""}
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className={label}>Last name</span>
                      <input
                        name="last_name"
                        className={input}
                        defaultValue={r.last_name ?? ""}
                      />
                    </label>
                    <label className="grid gap-2 sm:col-span-2">
                      <span className={label}>Company</span>
                      <input
                        name="company"
                        className={input}
                        defaultValue={r.company ?? ""}
                      />
                    </label>
                    <label className="grid gap-2 sm:col-span-2">
                      <span className={label}>Address line 1</span>
                      <input
                        name="address1"
                        className={input}
                        required
                        defaultValue={r.address1}
                      />
                    </label>
                    <label className="grid gap-2 sm:col-span-2">
                      <span className={label}>Address line 2</span>
                      <input
                        name="address2"
                        className={input}
                        defaultValue={r.address2 ?? ""}
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className={label}>City</span>
                      <input name="city" className={input} required defaultValue={r.city} />
                    </label>
                    <label className="grid gap-2">
                      <span className={label}>Region</span>
                      <input
                        name="region"
                        className={input}
                        defaultValue={r.region ?? ""}
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className={label}>Postal code</span>
                      <input
                        name="postal_code"
                        className={input}
                        required
                        defaultValue={r.postal_code}
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className={label}>Country</span>
                      <input name="country" className={input} defaultValue={r.country} />
                    </label>
                    <label className="grid gap-2 sm:col-span-2">
                      <span className={label}>Phone</span>
                      <input
                        name="phone"
                        type="tel"
                        className={input}
                        defaultValue={r.phone ?? ""}
                      />
                    </label>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-ink/70">
                    <input
                      name="is_default"
                      type="checkbox"
                      defaultChecked={r.is_default}
                      className="rounded border-ink/25"
                    />
                    Default
                  </label>
                  <button
                    type="submit"
                    className="h-11 rounded-full bg-ink text-sm font-semibold text-bone transition-colors hover:bg-ink/90"
                  >
                    Update address
                  </button>
                </form>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

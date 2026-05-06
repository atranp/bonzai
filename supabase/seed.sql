-- Seed 3 placeholder products (edit these to match your real catalog).
-- IMPORTANT: set `foxy_code` to the FoxyCart product code.

insert into public.products (slug, name, subtitle, description_md, price_cents, currency, active, foxy_code, image_url, meta)
values
  (
    'bpc-157',
    'BPC-157',
    'Research-grade peptide',
    'Lyophilized peptide intended for research applications.\n\n- Purity: ≥99%\n- Third-party COA included',
    9900,
    'USD',
    true,
    'BPC157-5MG',
    null,
    jsonb_build_object('dose','5mg','lot','B240512','cas','137525-51-0','purity','≥99.2%')
  ),
  (
    'ghk-cu',
    'GHK-Cu',
    'Research-grade peptide',
    'Copper tripeptide compound for research use.',
    12900,
    'USD',
    true,
    'GHKCU-5MG',
    null,
    jsonb_build_object('dose','5mg','purity','≥99%')
  ),
  (
    'rt3',
    'RT3',
    'Research-grade peptide',
    'Lyophilized peptide for research applications.',
    14900,
    'USD',
    true,
    'RT3-2MG',
    null,
    jsonb_build_object('dose','2mg','purity','≥99%')
  )
on conflict (slug) do update set
  name = excluded.name,
  subtitle = excluded.subtitle,
  description_md = excluded.description_md,
  price_cents = excluded.price_cents,
  currency = excluded.currency,
  active = excluded.active,
  foxy_code = excluded.foxy_code,
  image_url = excluded.image_url,
  meta = excluded.meta;


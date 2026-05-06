## BONZAI Store

Next.js + FoxyCart (hosted checkout) + Supabase (products + orders).

## Local setup

### Env

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FOXYCART_STORE_DOMAIN`
- `FOXYCART_WEBHOOK_SECRET`
- `SITE_URL` (optional but recommended)

### Supabase

Run these in the Supabase SQL editor:

- `supabase/schema.sql`
- `supabase/seed.sql`

### Dev

```bash
npm run dev
```

## Supabase auth & accounts

- **Auth**: email/password via Supabase Auth (`/login`, `/signup`, `/logout`).
- **Account**: `/account`, order history at `/account/orders`, addresses at `/account/shipping`.
- **Checkout**: `/cart/redirect` requires a signed-in user. The app sends `custom_user_id` (Supabase user id) to FoxyCart so the webhook can attach `orders.user_id`.

Re-run `supabase/schema.sql` on your project if you created the DB before `user_id` / RLS / `shipping_addresses` existed.

## FoxyCart config (v1)

- **Cart link**: add-to-cart uses `custom_order_ref` and `custom_user_id` (set automatically by `/cart/redirect`).
- **Checkout**: hosted.
- **Return URLs**:
  - Return: `${SITE_URL}/checkout/return?ref={{custom_order_ref}}`
  - Receipt: `${SITE_URL}/receipt/{{custom_order_ref}}`
- **Webhook**:
  - URL: `${SITE_URL}/api/foxy/webhook`
  - Secret: `FOXYCART_WEBHOOK_SECRET`
  - Signature header: `Foxy-Webhook-Signature` (HMAC-SHA256 hex of raw payload)

## Vercel deploy

1. Import this repo into Vercel.
2. Add env vars (same as `.env.example`) in Project Settings.
3. Deploy.
4. Update FoxyCart webhook + return URLs to your Vercel domain.

## Operational notes

- `/cart/redirect?slug=bpc-157&qty=1` requires sign-in, inserts a `pending` order with `user_id`, then redirects to FoxyCart checkout with `custom_order_ref` + `custom_user_id`.
- Foxy webhook `POST /api/foxy/webhook` upserts the order + snapshots line items into `order_items`.

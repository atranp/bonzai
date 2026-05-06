-- BONZAI Peptides - minimal schema
-- Run in Supabase SQL editor (or via migration tooling).

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  subtitle text,
  description_md text not null default '',
  price_cents int not null check (price_cents >= 0),
  currency text not null default 'USD',
  active boolean not null default true,
  foxy_code text not null unique,
  image_url text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_ref text not null unique,
  status text not null check (status in ('pending','paid','failed','refunded','cancelled')),
  email text,
  user_id uuid references auth.users(id) on delete set null,
  subtotal_cents int not null default 0 check (subtotal_cents >= 0),
  shipping_cents int not null default 0 check (shipping_cents >= 0),
  tax_cents int not null default 0 check (tax_cents >= 0),
  total_cents int not null default 0 check (total_cents >= 0),
  currency text not null default 'USD',
  shipping_address jsonb,
  payment_summary jsonb,
  foxy_transaction_id text unique,
  foxy_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Idempotent adds when upgrading an existing DB created from an older schema.sql
alter table public.orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.orders add column if not exists payment_summary jsonb;

create index if not exists orders_user_id_idx on public.orders(user_id);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  name_snapshot text not null,
  price_cents int not null check (price_cents >= 0),
  qty int not null check (qty > 0),
  line_total_cents int not null check (line_total_cents >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipping_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  first_name text,
  last_name text,
  company text,
  address1 text not null,
  address2 text,
  city text not null,
  region text,
  postal_code text not null,
  country text not null default 'US',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shipping_addresses_user_id_idx on public.shipping_addresses(user_id);

create unique index if not exists shipping_addresses_one_default_per_user
  on public.shipping_addresses (user_id)
  where is_default = true;

create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists products_active_idx on public.products(active);

-- Cart (multi-item, user-owned)
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  qty int not null check (qty > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists cart_items_user_id_idx on public.cart_items(user_id);
create index if not exists cart_items_product_id_idx on public.cart_items(product_id);

-- updated_at helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists user_profiles_set_updated_at on public.user_profiles;
create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

drop trigger if exists shipping_addresses_set_updated_at on public.shipping_addresses;
create trigger shipping_addresses_set_updated_at
before update on public.shipping_addresses
for each row execute function public.set_updated_at();

drop trigger if exists cart_items_set_updated_at on public.cart_items;
create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

-- Sync profile row when a user signs up / email changes (runs in Supabase as service role)
create or replace function public.handle_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, email)
  values (new.id, new.email)
  on conflict (user_id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_auth_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of email on auth.users
for each row execute function public.handle_auth_user();

-- RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart_items enable row level security;
alter table public.user_profiles enable row level security;
alter table public.shipping_addresses enable row level security;

-- Public read access to active products
drop policy if exists products_public_read_active on public.products;
create policy products_public_read_active
on public.products
for select
to anon, authenticated
using (active = true);

-- User-owned orders (read-only for authenticated)
drop policy if exists orders_select_own on public.orders;
create policy orders_select_own
on public.orders
for select
to authenticated
using (user_id is not null and user_id = auth.uid());

-- Line items for owned orders
drop policy if exists order_items_select_own on public.order_items;
create policy order_items_select_own
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.user_id is not null
      and o.user_id = auth.uid()
  )
);

-- Cart items CRUD for owner
drop policy if exists cart_items_select_own on public.cart_items;
create policy cart_items_select_own
on public.cart_items
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists cart_items_insert_own on public.cart_items;
create policy cart_items_insert_own
on public.cart_items
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists cart_items_update_own on public.cart_items;
create policy cart_items_update_own
on public.cart_items
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists cart_items_delete_own on public.cart_items;
create policy cart_items_delete_own
on public.cart_items
for delete
to authenticated
using (user_id = auth.uid());

-- Profiles: user can read/update own row
drop policy if exists user_profiles_select_own on public.user_profiles;
create policy user_profiles_select_own
on public.user_profiles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists user_profiles_update_own on public.user_profiles;
create policy user_profiles_update_own
on public.user_profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Shipping addresses CRUD for owner
drop policy if exists shipping_addresses_select_own on public.shipping_addresses;
create policy shipping_addresses_select_own
on public.shipping_addresses
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists shipping_addresses_insert_own on public.shipping_addresses;
create policy shipping_addresses_insert_own
on public.shipping_addresses
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists shipping_addresses_update_own on public.shipping_addresses;
create policy shipping_addresses_update_own
on public.shipping_addresses
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists shipping_addresses_delete_own on public.shipping_addresses;
create policy shipping_addresses_delete_own
on public.shipping_addresses
for delete
to authenticated
using (user_id = auth.uid());


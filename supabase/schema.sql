-- Practice orders for the Atelier shop. Run this in the Supabase SQL editor.
-- The Next.js server writes with SUPABASE_SECRET_KEY. Shoppers never talk to these tables directly.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  store_slug text not null,
  customer_name text not null,
  email text not null,
  address text not null,
  city text not null,
  status text not null default 'placed',
  total_cents integer not null check (total_cents >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id text not null,
  name text not null,
  unit_cents integer not null check (unit_cents >= 0),
  quantity integer not null check (quantity between 1 and 20)
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete cascade,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'USD',
  status text not null,
  reference text not null unique,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.transactions enable row level security;

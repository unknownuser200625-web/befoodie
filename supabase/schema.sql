-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Restaurants Table
create table public.restaurants (
  id uuid default uuid_generate_v4() primary key,
  slug text not null unique,
  name text not null,
  logo_url text,
  owner_password_hash text,
  staff_pin_hash text,
  active_session_id text,
  created_at bigint default extract(epoch from now()) * 1000
);

-- 2. Categories Table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  name text not null,
  order_index int default 0,
  created_at timestamptz default now()
);

-- 3. Products Table
create table public.products (
  id text primary key, -- Legacy IDs are strings like 'vb-1', keeping text for compatibility
  restaurant_id uuid references public.restaurants(id) on delete cascade not null, -- Links to restaurant
  name text not null,
  description text,
  price numeric not null,
  category text not null, -- Stores category name directly as per legacy type
  image text,
  available boolean default true,
  created_at timestamptz default now()
);

-- 4. Tables Configuration (Optional, for tracking valid tables)
create table public.tables (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  table_number text not null,
  unique(restaurant_id, table_number)
);

-- 5. Sessions Table
create table public.sessions (
  id text primary key, -- Using text ID to match legacy session generation
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  table_id text not null,
  business_date text not null,
  status text check (status in ('OPEN', 'PAID')) default 'OPEN',
  total_amount numeric default 0,
  created_at bigint default extract(epoch from now()) * 1000,
  paid_at bigint
);

-- 6. Orders Table
create table public.orders (
  id text primary key,
  restaurant_id uuid references public.restaurants(id) on delete cascade not null,
  session_id text references public.sessions(id) on delete cascade,
  table_id text not null,
  total_price numeric not null,
  status text not null,
  timestamp bigint default extract(epoch from now()) * 1000,
  business_date text
);

-- 7. Order Items Table
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id text references public.orders(id) on delete cascade not null,
  name text not null,
  price numeric not null,
  quantity int not null
);

-- Row Level Security (RLS) Configuration

alter table restaurants enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table sessions enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table tables enable row level security;

-- Policies (Permissive for initial SaaS setup)
create policy "Public read access" on restaurants for select using (true);
create policy "Public read access" on products for select using (true);
create policy "Public read access" on categories for select using (true);

-- Allow insert/update for seeding options (DEV ONLY)
create policy "Public insert access" on restaurants for insert with check (true);
create policy "Public update access" on restaurants for update using (true);

create policy "Public insert access" on products for insert with check (true);
create policy "Public update access" on products for update using (true);

create policy "Public insert access" on categories for insert with check (true);
create policy "Public update access" on categories for update using (true);


-- Allow anon to create orders/sessions (Guest ordering)
create policy "Anon insert orders" on orders for insert with check (true);
create policy "Anon select orders" on orders for select using (true); 

create policy "Anon insert sessions" on sessions for insert with check (true);
create policy "Anon select sessions" on sessions for select using (true);

create policy "Anon insert order_items" on order_items for insert with check (true);
create policy "Anon select order_items" on order_items for select using (true);

create policy "Anon select tables" on tables for select using (true);

-- Create 'demo' restaurant if not exists
insert into public.restaurants (slug, name, created_at)
values ('demo', 'Demo Restaurant', extract(epoch from now()) * 1000)
on conflict (slug) do nothing;

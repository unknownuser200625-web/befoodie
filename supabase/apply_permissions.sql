-- FIX RLS PERMISSIONS FOR SEEDING
-- Run this in Supabase SQL Editor

-- 1. Reset policies for Products
drop policy if exists "Public insert access" on products;
drop policy if exists "Public update access" on products;
drop policy if exists "Public read access" on products;

create policy "Enable access for all users" on products for all using (true) with check (true);

-- 2. Reset policies for Categories
drop policy if exists "Public insert access" on categories;
drop policy if exists "Public update access" on categories;
drop policy if exists "Public read access" on categories;

create policy "Enable access for all users" on categories for all using (true) with check (true);

-- 3. Reset policies for Tables
drop policy if exists "Public insert access" on tables;
drop policy if exists "Public update access" on tables;
drop policy if exists "Public read access" on tables;

create policy "Enable access for all users" on tables for all using (true) with check (true);

-- 4. Reset policies for Restaurants
drop policy if exists "Public insert access" on restaurants;
drop policy if exists "Public update access" on restaurants;
drop policy if exists "Public read access" on restaurants;
create policy "Enable access for all users" on restaurants for all using (true) with check (true);

-- 5. Reset policies for Orders/Sessions (just in case)
drop policy if exists "Anon insert orders" on orders;
create policy "Enable access for all users" on orders for all using (true) with check (true);

drop policy if exists "Anon insert sessions" on sessions;
create policy "Enable access for all users" on sessions for all using (true) with check (true);

-- Drop existing policies to avoid conflicts
drop policy if exists "Public insert access" on restaurants;
drop policy if exists "Public update access" on restaurants;
drop policy if exists "Public insert access" on products;
drop policy if exists "Public update access" on products;
drop policy if exists "Public insert access" on categories;
drop policy if exists "Public update access" on categories;
drop policy if exists "Public insert access" on tables;
drop policy if exists "Public update access" on tables;

-- Create permissive policies for SEEDING (Dev/Migration Mode)
-- These allow anyone to insert/update. You should remove/restrict these before going fully public if sensitive.

-- 1. Restaurants
create policy "Public insert access" on restaurants for insert with check (true);
create policy "Public update access" on restaurants for update using (true);

-- 2. Products
create policy "Public insert access" on products for insert with check (true);
create policy "Public update access" on products for update using (true);

-- 3. Categories
create policy "Public insert access" on categories for insert with check (true);
create policy "Public update access" on categories for update using (true);

-- 4. Tables
create policy "Public insert access" on tables for insert with check (true);
create policy "Public update access" on tables for update using (true);

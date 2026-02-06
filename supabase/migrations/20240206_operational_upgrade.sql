-- Migration: Core Operational Stability and UX Tagging

-- 1. Update Products Table for Food Type
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS food_type TEXT DEFAULT 'veg' CHECK (food_type IN ('veg', 'non_veg', 'egg'));

-- 2. Update Categories Table for Category Type
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS category_type TEXT DEFAULT 'mixed' CHECK (category_type IN ('veg', 'non_veg', 'mixed'));

-- 3. Update Sessions Table for Global/Business Day Sessions
-- Make table_id nullable for global operational sessions
ALTER TABLE public.sessions ALTER COLUMN table_id DROP NOT NULL;

-- Update status check to include 'active' and 'closed'
-- Note: Postgres doesn't allow direct check constraint modification easily, so we drop and recreate
ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_status_check;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_status_check CHECK (status IN ('OPEN', 'PAID', 'active', 'closed'));

-- 4. Update Restaurants Table for Operational Status
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS is_system_open BOOLEAN DEFAULT false;

-- 5. Build History Table (if not exists, as used in start-new-day)
CREATE TABLE IF NOT EXISTS public.history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    date TEXT NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    closed_at TIMESTAMPTZ DEFAULT now()
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_sessions_business_date ON public.sessions(business_date);
CREATE INDEX IF NOT EXISTS idx_products_food_type ON public.products(food_type);

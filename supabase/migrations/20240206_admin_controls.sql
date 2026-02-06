-- Migration: Admin Controls & Enhanced History
-- Description: Adds order pausing and detailed history metrics.

-- 1. Add order pausing toggle to restaurants
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS is_accepting_orders BOOLEAN DEFAULT true;

-- 2. Enhance daily summary with granular metrics
ALTER TABLE public.restaurant_daily_summary 
ADD COLUMN IF NOT EXISTS qr_orders_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS counter_orders_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_order_value NUMERIC DEFAULT 0;

-- 3. Add last_active to device_sessions for heartbeat
ALTER TABLE public.device_sessions 
ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ DEFAULT now();

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_device_sessions_last_active ON public.device_sessions(last_active);
CREATE INDEX IF NOT EXISTS idx_device_sessions_restaurant_id ON public.device_sessions(restaurant_id);

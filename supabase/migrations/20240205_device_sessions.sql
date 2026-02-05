-- Migration: Device Sessions and Daily Kitchen Sessions

-- 1. Device Sessions Table
CREATE TABLE IF NOT EXISTS public.device_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'staff')),
    device_name TEXT,
    device_type TEXT,
    browser TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_active_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- 2. Restaurant Daily Sessions Table
CREATE TABLE IF NOT EXISTS public.restaurant_daily_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    business_date DATE NOT NULL DEFAULT CURRENT_DATE,
    session_started_at TIMESTAMPTZ DEFAULT now(),
    session_closed_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(restaurant_id, business_date)
);

-- 3. RLS Policies
ALTER TABLE public.device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_daily_sessions ENABLE ROW LEVEL SECURITY;

-- Permissive policies for now (as per existing pattern)
CREATE POLICY "Public select device_sessions" ON public.device_sessions FOR SELECT USING (true);
CREATE POLICY "Public insert device_sessions" ON public.device_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update device_sessions" ON public.device_sessions FOR UPDATE USING (true);

CREATE POLICY "Public select daily_sessions" ON public.restaurant_daily_sessions FOR SELECT USING (true);
CREATE POLICY "Public insert daily_sessions" ON public.restaurant_daily_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update daily_sessions" ON public.restaurant_daily_sessions FOR UPDATE USING (true);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_device_sessions_restaurant ON public.device_sessions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_daily_sessions_restaurant_date ON public.restaurant_daily_sessions(restaurant_id, business_date);

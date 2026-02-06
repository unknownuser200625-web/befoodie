-- Migration: Production POS Session Architecture Refactor (FIXED)
-- Description: Separates business-level operational sessions from table billing sessions.

-- 1. Restaurant Operational Sessions (Business Day)
CREATE TABLE IF NOT EXISTS public.restaurant_operational_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    business_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active','closed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    closed_at TIMESTAMPTZ,
    UNIQUE(restaurant_id, business_date)
);

-- 2. Table Sessions (Transactional Billing)
CREATE TABLE IF NOT EXISTS public.table_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    table_id TEXT NOT NULL,
    operational_session_id UUID REFERENCES public.restaurant_operational_sessions(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open','paid','cancelled')),
    total_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    closed_at TIMESTAMPTZ,
    UNIQUE(table_id, operational_session_id)
);

-- 3. Restaurant Daily Summary (Archival Performance)
CREATE TABLE IF NOT EXISTS public.restaurant_daily_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    business_date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0,
    closed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(restaurant_id, business_date)
);

-- 4. Enable RLS
ALTER TABLE public.restaurant_operational_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_daily_summary ENABLE ROW LEVEL SECURITY;

-- 5. Safe Policies (Read Only for now)
CREATE POLICY "Allow read ops sessions"
ON public.restaurant_operational_sessions
FOR SELECT
USING (true);

CREATE POLICY "Allow read table sessions"
ON public.table_sessions
FOR SELECT
USING (true);

CREATE POLICY "Allow read daily summary"
ON public.restaurant_daily_summary
FOR SELECT
USING (true);

-- 6. Mark Legacy Sessions Table
COMMENT ON TABLE public.sessions IS 'LEGACY TABLE — DO NOT USE FOR NEW POS LOGIC';

-- Migration: Architecture Hardening & Atomic Order RPC
-- Description: Enforces strict session integrity, removes legacy columns, and moves order logic to DB.

-- 1. Drop Legacy Session Tables & Columns
DROP TABLE IF EXISTS public.sessions; -- Legacy sessions table
ALTER TABLE public.restaurants DROP COLUMN IF EXISTS active_session_id;

-- 2. Enforce Constraints on Orders
-- Ensure operational_session_id is mandatory (It should be populated by now)
ALTER TABLE public.orders 
    ALTER COLUMN operational_session_id SET NOT NULL,
    ALTER COLUMN table_session_id SET NOT NULL;

-- Convert business_date to DATE if it's not already
-- (Using explicit cast just in case it was text)
ALTER TABLE public.orders 
    ALTER COLUMN business_date TYPE DATE USING business_date::DATE;

ALTER TABLE public.orders 
    ALTER COLUMN business_date SET NOT NULL;

-- 3. Triggers for Integrity
-- Trigger A: Prevent updates to session references
CREATE OR REPLACE FUNCTION prevent_order_session_update()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.operational_session_id IS DISTINCT FROM NEW.operational_session_id OR
       OLD.table_session_id IS DISTINCT FROM NEW.table_session_id OR
       OLD.business_date IS DISTINCT FROM NEW.business_date THEN
        RAISE EXCEPTION 'Cannot modify session references on an existing order';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_protect_order_session ON public.orders;
CREATE TRIGGER tr_protect_order_session
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION prevent_order_session_update();

-- Trigger B: Ensure business_date matches operational_session
CREATE OR REPLACE FUNCTION validate_order_business_date()
RETURNS TRIGGER AS $$
DECLARE
    v_session_date DATE;
BEGIN
    SELECT business_date INTO v_session_date
    FROM public.restaurant_operational_sessions
    WHERE id = NEW.operational_session_id;

    IF v_session_date IS NULL THEN
         RAISE EXCEPTION 'Invalid operational_session_id';
    END IF;

    IF NEW.business_date != v_session_date THEN
        RAISE EXCEPTION 'Order business_date (%) does not match operational session date (%)', NEW.business_date, v_session_date;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_validate_order_date ON public.orders;
CREATE TRIGGER tr_validate_order_date
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION validate_order_business_date();

-- 4. Atomic RPC: place_restaurant_order
CREATE OR REPLACE FUNCTION place_restaurant_order(
    p_restaurant_id UUID,
    p_table_id TEXT,
    p_items JSONB,
    p_total_price NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_ops_session_id UUID;
    v_business_date DATE;
    v_table_session_id UUID;
    v_order_id UUID;
    v_is_accepting BOOLEAN;
    v_item JSONB;
BEGIN
    -- A. Validate Restaurant & Acceptance
    SELECT is_accepting_orders INTO v_is_accepting
    FROM public.restaurants
    WHERE id = p_restaurant_id;

    IF v_is_accepting IS NOT TRUE THEN
        RAISE EXCEPTION 'Restaurant is not currently accepting orders';
    END IF;

    -- B. Get Active Operational Session (Locking not strictly needed for read, but good for consistency)
    SELECT id, business_date INTO v_ops_session_id, v_business_date
    FROM public.restaurant_operational_sessions
    WHERE restaurant_id = p_restaurant_id
      AND status = 'active'
      AND business_date = CURRENT_DATE
    LIMIT 1;

    IF v_ops_session_id IS NULL THEN
        RAISE EXCEPTION 'Restaurant is closed (No active session for today)';
    END IF;

    -- C. Get or Create Table Session
    SELECT id INTO v_table_session_id
    FROM public.table_sessions
    WHERE restaurant_id = p_restaurant_id
      AND table_id = p_table_id
      AND operational_session_id = v_ops_session_id
      AND status = 'open'
    LIMIT 1;

    IF v_table_session_id IS NULL THEN
        INSERT INTO public.table_sessions (
            restaurant_id, 
            table_id, 
            operational_session_id, 
            status, 
            total_amount
        ) VALUES (
            p_restaurant_id,
            p_table_id,
            v_ops_session_id,
            'open',
            0
        ) RETURNING id INTO v_table_session_id;
    END IF;

    -- D. Insert Order
    INSERT INTO public.orders (
        restaurant_id,
        table_session_id,
        operational_session_id,
        business_date,
        table_id,
        total_price,
        status,
        timestamp -- Legacy column support
    ) VALUES (
        p_restaurant_id,
        v_table_session_id,
        v_ops_session_id,
        v_business_date,
        p_table_id,
        p_total_price,
        'Pending',
        extract(epoch from now()) * 1000 -- Matches Date.now() JS behavior
    ) RETURNING id INTO v_order_id;

    -- E. Insert Order Items
    -- p_items is generic JSONB array: [{name, price, quantity}, ...]
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        INSERT INTO public.order_items (
            order_id,
            name,
            price,
            quantity
        ) VALUES (
            v_order_id,
            (v_item->>'name')::TEXT,
            (v_item->>'price')::NUMERIC,
            (v_item->>'quantity')::INTEGER
        );
    END LOOP;
    
    -- F. Update Table Session Total (Optional but good for data consistency if used)
    UPDATE public.table_sessions
    SET total_amount = total_amount + p_total_price
    WHERE id = v_table_session_id;

    -- Return the Order ID and Context
    RETURN jsonb_build_object(
        'id', v_order_id,
        'operational_session_id', v_ops_session_id,
        'business_date', v_business_date,
        'status', 'Pending'
    );
END;
$$;

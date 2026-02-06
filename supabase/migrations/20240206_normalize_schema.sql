-- ================================================================
-- CRITICAL: Database Normalization Script
-- Purpose: Fix schema drift and ensure single source of truth
-- Run this in Supabase SQL Editor IMMEDIATELY
-- ================================================================

-- STEP 1: Close ALL old/duplicate operational sessions
-- Ensures only TODAY's session can be active
UPDATE restaurant_operational_sessions
SET 
    status = 'closed',
    closed_at = NOW()
WHERE 
    status = 'active'
    AND business_date < CURRENT_DATE;

-- STEP 2: Ensure ONLY ONE active session per restaurant for today
-- If multiple exist for same date, keep the latest one
WITH ranked_sessions AS (
    SELECT 
        id,
        restaurant_id,
        business_date,
        ROW_NUMBER() OVER (
            PARTITION BY restaurant_id, business_date 
            ORDER BY created_at DESC
        ) as rn
    FROM restaurant_operational_sessions
    WHERE 
        status = 'active'
        AND business_date = CURRENT_DATE
)
UPDATE restaurant_operational_sessions
SET 
    status = 'closed',
    closed_at = NOW()
WHERE id IN (
    SELECT id 
    FROM ranked_sessions 
    WHERE rn > 1
);

-- STEP 3: Sync restaurants.is_system_open with operational session state
-- If active session exists for today -> is_system_open = TRUE
-- Otherwise -> is_system_open = FALSE
UPDATE restaurants r
SET is_system_open = EXISTS (
    SELECT 1 
    FROM restaurant_operational_sessions ops
    WHERE 
        ops.restaurant_id = r.id
        AND ops.business_date = CURRENT_DATE
        AND ops.status = 'active'
);

-- STEP 4: Default is_accepting_orders to TRUE for all open restaurants
-- (Admin can manually pause later)
UPDATE restaurants
SET is_accepting_orders = TRUE
WHERE is_system_open = TRUE;

-- STEP 5: Close restaurants with no active session
UPDATE restaurants
SET is_accepting_orders = FALSE
WHERE is_system_open = FALSE;

-- ================================================================
-- VERIFICATION QUERIES (Run these after the above)
-- ================================================================

-- Check: Active sessions per restaurant (should be 0 or 1 per restaurant)
SELECT 
    r.slug as restaurant,
    COUNT(*) as active_sessions_today,
    MAX(ops.business_date) as session_date,
    r.is_system_open,
    r.is_accepting_orders
FROM restaurants r
LEFT JOIN restaurant_operational_sessions ops 
    ON ops.restaurant_id = r.id 
    AND ops.status = 'active'
    AND ops.business_date = CURRENT_DATE
GROUP BY r.id, r.slug, r.is_system_open, r.is_accepting_orders;

-- Check: Session status breakdown
SELECT 
    status,
    COUNT(*) as count,
    MIN(business_date) as earliest_date,
    MAX(business_date) as latest_date
FROM restaurant_operational_sessions
GROUP BY status;

-- Check: Restaurants state
SELECT 
    slug,
    is_system_open,
    is_accepting_orders,
    food_policy
FROM restaurants
ORDER BY slug;

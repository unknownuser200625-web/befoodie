-- Add food_policy column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN food_policy TEXT NOT NULL DEFAULT 'MIXED' 
CHECK (food_policy IN ('PURE_VEG', 'PURE_NON_VEG', 'MIXED'));

-- Update existing restaurants to have MIXED policy (backward compatible)
UPDATE restaurants 
SET food_policy = 'MIXED' 
WHERE food_policy IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN restaurants.food_policy IS 'Restaurant food policy: PURE_VEG (only veg), PURE_NON_VEG (all types), MIXED (all types with filters)';

-- Migration: Food Tagging & Categorization
-- Description: Adds veg/non-veg support and category types.

-- 1. Add food_type to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS food_type TEXT DEFAULT 'veg' CHECK (food_type IN ('veg', 'non-veg', 'egg'));

-- 2. Add category_type to categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS category_type TEXT DEFAULT 'food' CHECK (category_type IN ('food', 'beverage', 'liquor', 'other'));

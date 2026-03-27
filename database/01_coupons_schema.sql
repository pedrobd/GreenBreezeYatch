-- Migration: Coupon System
-- Description: Creates the coupons table and updates reservations to support discounts.

-- 1. Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percentage NUMERIC NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    boat_ids UUID[] DEFAULT NULL, -- NULL means all boats
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add columns to reservations
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- 3. Enable RLS (Assuming other tables have it)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- 4. Basic Policies (Adjust as needed for your project)
CREATE POLICY "Allow authenticated full access to coupons" 
ON coupons FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow public read access to active coupons" 
ON coupons FOR SELECT 
TO anon 
USING (is_active = true AND CURRENT_DATE BETWEEN start_date AND end_date);

-- Migration: Advanced Pricing & Extras Architecture
-- Desc: Adds tables for boat_programs and boat_extras, modifies reservations table, creates reservation_extras.

-- 1. Create boat_programs table
CREATE TABLE IF NOT EXISTS public.boat_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boat_id UUID NOT NULL REFERENCES public.fleet(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_hours NUMERIC,
    price_low NUMERIC,
    price_mid NUMERIC,
    price_high NUMERIC,
    vat_rate NUMERIC DEFAULT 6,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for boat_programs
ALTER TABLE public.boat_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read access on boat_programs" ON public.boat_programs FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on boat_programs" ON public.boat_programs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on boat_programs" ON public.boat_programs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on boat_programs" ON public.boat_programs FOR DELETE USING (auth.role() = 'authenticated');

-- 2. Create boat_extras table
CREATE TABLE IF NOT EXISTS public.boat_extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boat_id UUID NOT NULL REFERENCES public.fleet(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    vat_rate NUMERIC DEFAULT 23,
    pricing_type TEXT DEFAULT 'per_booking', -- 'per_booking' or 'per_person'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for boat_extras
ALTER TABLE public.boat_extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read access on boat_extras" ON public.boat_extras FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on boat_extras" ON public.boat_extras FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on boat_extras" ON public.boat_extras FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on boat_extras" ON public.boat_extras FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Modify reservations table
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.boat_programs(id) ON DELETE SET NULL;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS season_applied TEXT;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC DEFAULT 0;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS extras_amount NUMERIC DEFAULT 0;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS vat_base_amount NUMERIC DEFAULT 0;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS vat_extras_amount NUMERIC DEFAULT 0;

-- 4. Create reservation_extras table
CREATE TABLE IF NOT EXISTS public.reservation_extras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
    extra_id UUID NOT NULL REFERENCES public.boat_extras(id) ON DELETE CASCADE,
    quantity NUMERIC DEFAULT 1,
    unit_price_at_booking NUMERIC NOT NULL,
    vat_rate_at_booking NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for reservation_extras
ALTER TABLE public.reservation_extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all read access on reservation_extras" ON public.reservation_extras FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on reservation_extras" ON public.reservation_extras FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update on reservation_extras" ON public.reservation_extras FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated delete on reservation_extras" ON public.reservation_extras FOR DELETE USING (auth.role() = 'authenticated');

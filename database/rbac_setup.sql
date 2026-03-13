-- SQL Migration: RBAC and Team Management
-- This script sets up the roles, profiles, team members, and staffing tables.

-- 1. PROFILES (Extension of Auth User)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'booking_manager', 'skipper')) DEFAULT 'skipper',
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TEAM MEMBERS (The actual people working)
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('skipper', 'marinheiro')),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Linked login
    nif TEXT,
    billing_address TEXT,
    rate_half_day NUMERIC(10, 2),
    rate_full_day NUMERIC(10, 2),
    rate_extra_hour NUMERIC(10, 2),
    hourly_rate_owners NUMERIC(10, 2) DEFAULT 13.00,
    hourly_rate_extra NUMERIC(10, 2), -- Deprecated in favor of personalized rates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. STAFF RATES (Reference for automated calculations)
CREATE TABLE IF NOT EXISTS public.staff_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_role TEXT NOT NULL, -- skipper, marinheiro
    program_code TEXT NOT NULL, -- sunset, half_day, full_day, etc
    base_value NUMERIC(10, 2) NOT NULL,
    extra_hour_value NUMERIC(10, 2) NOT NULL,
    UNIQUE(staff_role, program_code)
);

-- 4. RESERVATION STAFF (Assignment and Hours)
CREATE TABLE IF NOT EXISTS public.reservation_staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
    role_at_time TEXT NOT NULL,
    base_program TEXT,
    extra_hours NUMERIC(10, 2) DEFAULT 0,
    bonus_review NUMERIC(10, 2) DEFAULT 0,
    total_payout NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_staff ENABLE ROW LEVEL SECURITY;

-- Basic Policies
CREATE POLICY "Profiles are viewable by everyone logged in" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can edit their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Seed Rates (Staffing conditions)
INSERT INTO public.staff_rates (staff_role, program_code, base_value, extra_hour_value) VALUES
('marinheiro', 'sunset', 55.00, 30.00),
('marinheiro', 'half_day', 65.00, 30.00),
('marinheiro', '6_hour', 90.00, 30.00),
('marinheiro', 'full_day', 110.00, 30.00),
('skipper', 'half_day', 55.00, 20.00),
('skipper', 'full_day', 90.00, 20.00);

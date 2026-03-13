-- Add staff columns to reservations table
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS skipper_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS marinheiro_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS extra_hours NUMERIC(10, 2) DEFAULT 0;

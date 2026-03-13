-- Migration: Add Marinheiro to profiles role check
-- Desc: Modifies the check constraint on the profiles table to allow the 'marinheiro' role.

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'booking_manager', 'skipper', 'marinheiro', 'other'));

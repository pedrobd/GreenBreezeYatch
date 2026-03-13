-- Migration: Adding Detailed Descriptions to Fleet
-- Desc: Adds 'description' and 'inclusions' columns to support Rich Text on the Frontoffice.

ALTER TABLE public.fleet ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.fleet ADD COLUMN IF NOT EXISTS inclusions TEXT;
ALTER TABLE public.fleet ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0;

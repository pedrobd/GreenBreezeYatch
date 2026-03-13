-- Migration: Add Gallery to Fleet
-- Desc: Adds a gallery column to store multiple image URLs for a boat.

ALTER TABLE public.fleet ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT '{}';

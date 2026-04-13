-- Migration to add invoice_number to reservations table
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS invoice_number TEXT;

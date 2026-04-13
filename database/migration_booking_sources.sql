-- Create booking_sources table
CREATE TABLE IF NOT EXISTS public.booking_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- 'Agencia', 'Redes Sociais', 'Plataformas'
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Update reservations table
-- Note: Rename might fail if column 'source' doesn't exist, so we use IF EXISTS logic if possible or just assume it exists as I just created it.
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reservations' AND column_name='source') THEN
        ALTER TABLE public.reservations RENAME COLUMN source TO source_type;
    ELSE
        ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'Cliente Final';
    END IF;
END $$;

ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS source_id UUID REFERENCES public.booking_sources(id);

-- SQL to allow anon to select from reservations (needed for the returning ID)
DROP POLICY IF EXISTS "Permitir Leitura Pública de Reservas (Própria Sessão)" ON public.reservations;
CREATE POLICY "Permitir Leitura Pública de Reservas (Própria Sessão)" ON public.reservations
FOR SELECT TO anon USING (true);

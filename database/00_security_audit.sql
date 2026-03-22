-- ==========================================
-- GREEN BREEZE: SECURITY & AUDIT SQL SCRIPT
-- ==========================================
-- Este script aplica as melhores práticas de Banco de Dados:
-- 1. Criação de Triggers Automáticos (updated_at)
-- 2. Constraints de Validação (CHECK, NOT NULL)
-- 3. Ativação de Row Level Security (RLS)
-- 4. Criação de Políticas (Policies)

-- -----------------------------------------------------------------------------
-- 1. SETUP DE AUDITORIA: Função e Triggers para 'updated_at'
-- -----------------------------------------------------------------------------

-- Função global que atualiza o 'updated_at' para NOW()
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Verifica e adiciona coluna updated_at e o trigger associado em cada tabela
DO $$ 
DECLARE
    t_name text;
    tables text[] := ARRAY['reservations', 'boat_programs', 'fleet', 'extra_activities', 'food_menu', 'blog_posts'];
BEGIN
    FOREACH t_name IN ARRAY tables LOOP
        -- Adiciona a coluna se não existir
        EXECUTE format('ALTER TABLE IF EXISTS public.%I ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();', t_name);
        
        -- Garante que o created_at existe
        EXECUTE format('ALTER TABLE IF EXISTS public.%I ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();', t_name);

        -- Remove o trigger se existir e recria para garantir que funciona
        EXECUTE format('DROP TRIGGER IF EXISTS trg_update_%I_updated_at ON public.%I;', t_name, t_name);
        EXECUTE format('
            CREATE TRIGGER trg_update_%I_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t_name, t_name);
    END LOOP;
END $$;


-- -----------------------------------------------------------------------------
-- 2. CONSTRAINTS DE VALIDAÇÃO GLOBAIS (Sanitização e Integridade)
-- -----------------------------------------------------------------------------

-- Frota (Fleet)
ALTER TABLE public.fleet ADD CONSTRAINT check_fleet_capacity CHECK (capacity > 0);
ALTER TABLE public.fleet ADD CONSTRAINT check_fleet_price CHECK (base_price >= 0);

-- Menu de Comida (food_menu)
ALTER TABLE public.food_menu ADD CONSTRAINT check_food_price CHECK (price >= 0);
ALTER TABLE public.food_menu ADD CONSTRAINT check_food_stock CHECK (stock >= 0);

-- Atividades Extras (extra_activities)
ALTER TABLE public.extra_activities ADD CONSTRAINT check_extras_price CHECK (price >= 0);
ALTER TABLE public.extra_activities ADD CONSTRAINT check_extras_stock CHECK (stock >= 0);

-- Programas de Barco (boat_programs)
ALTER TABLE public.boat_programs ADD CONSTRAINT check_programs_price_l CHECK (price_low >= 0);
ALTER TABLE public.boat_programs ADD CONSTRAINT check_programs_price_m CHECK (price_mid >= 0);
ALTER TABLE public.boat_programs ADD CONSTRAINT check_programs_price_h CHECK (price_high >= 0);

-- Reservas (Reservations)
ALTER TABLE public.reservations ADD CONSTRAINT check_total_amount CHECK (total_amount >= 0);
ALTER TABLE public.reservations ADD CONSTRAINT check_passengers CHECK (passengers_adults > 0);


-- -----------------------------------------------------------------------------
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------------------------------

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boat_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extra_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;


-- -----------------------------------------------------------------------------
-- 4. POLÍTICAS DE ACESSO (POLICIES)
-- -----------------------------------------------------------------------------

-- A. Políticas para o Frontend / Website Público (Leitura Apenas - Anon)
-- Nota: Garantimos que o "anon" (Frontend) consegue ler a frota, extras e blogs para o site funcionar

-- Fleet
DROP POLICY IF EXISTS "Permitir Leitura Pública de Frota Ativa" ON public.fleet;
CREATE POLICY "Permitir Leitura Pública de Frota Ativa" ON public.fleet
FOR SELECT USING (status = 'Disponível');

-- Blog
DROP POLICY IF EXISTS "Permitir Leitura Pública de Blog Ativo" ON public.blog_posts;
CREATE POLICY "Permitir Leitura Pública de Blog Ativo" ON public.blog_posts
FOR SELECT USING (status = 'Publicado');

-- Comida/Extras e Programas
DROP POLICY IF EXISTS "Permitir Leitura Pública de Menu e Extras Ativos" ON public.food_menu;
CREATE POLICY "Permitir Leitura Pública de Menu e Extras Ativos" ON public.food_menu
FOR SELECT USING (status = 'Disponível');

DROP POLICY IF EXISTS "Permitir Leitura Pública de Atividades Ativas" ON public.extra_activities;
CREATE POLICY "Permitir Leitura Pública de Atividades Ativas" ON public.extra_activities
FOR SELECT USING (status = 'Disponível');

DROP POLICY IF EXISTS "Permitir Leitura Pública de Programas Ativos" ON public.boat_programs;
CREATE POLICY "Permitir Leitura Pública de Programas Ativos" ON public.boat_programs
FOR SELECT USING (is_active = true);


-- B. Políticas para Submissão de Reservas pelo Frontend (Anon consegue Inserir, mas não consegue Ler)
DROP POLICY IF EXISTS "Permitir Criação Pública de Reservas" ON public.reservations;
CREATE POLICY "Permitir Criação Pública de Reservas" ON public.reservations
FOR INSERT WITH CHECK (true);


-- C. Políticas de Administração / Backoffice (Service Role ou Utilizador Autenticado)
-- Permite todas as operações (CRUD) para administradores autenticados e o service_role.

DO $$ 
DECLARE
    t_name text;
    tables text[] := ARRAY['reservations', 'boat_programs', 'fleet', 'extra_activities', 'food_menu', 'blog_posts'];
BEGIN
    FOREACH t_name IN ARRAY tables LOOP
        -- Remove antigas caso já existam para não dar erro
        EXECUTE format('DROP POLICY IF EXISTS "Acesso Total para Administradores" ON public.%I;', t_name);
        
        -- Aqui criamos uma regra dizendo: se tiver autenticado, pode fazer TUDO.
        EXECUTE format('
            CREATE POLICY "Acesso Total para Administradores" ON public.%I
            FOR ALL TO authenticated
            USING (true)
            WITH CHECK (true);
        ', t_name);
        
        -- O service_role ignora RLS por defeito, mas é boa prática ter explícito caso mudem settings
    END LOOP;
END $$;

-- FIM DO SCRIPT

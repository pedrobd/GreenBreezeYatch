-- SQL Schema for GreenBreeze Backoffice
-- Execute this file in your Supabase SQL Editor

-- 1. FLEET (Frota)
CREATE TABLE public.fleet (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    current_location TEXT DEFAULT 'Marina de Albufeira',
    status TEXT DEFAULT 'Disponível',
    base_price NUMERIC(10, 2),
    is_partner BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. FOOD MENU (Refeições)
CREATE TABLE public.food_menu (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    dietary_info TEXT DEFAULT 'Nenhum',
    stock INTEGER DEFAULT 999,
    status TEXT DEFAULT 'Disponível',
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. EXTRA ACTIVITIES (Atividades Extra)
CREATE TABLE public.extra_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    price NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'Disponível',
    stock INTEGER DEFAULT 999,
    availability TEXT DEFAULT 'Sempre',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. BLOG (Artigos)
CREATE TABLE public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    publish_date DATE,
    status TEXT DEFAULT 'Rascunho',
    views INTEGER DEFAULT 0,
    category TEXT NOT NULL,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. RESERVATIONS (Reservas Principais)
CREATE TABLE public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_phone TEXT,
    boat_id UUID REFERENCES public.fleet(id),
    date DATE NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'Pendente',
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_status TEXT DEFAULT 'Aguardando Pagamento',
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. RESERVATION FOOD (Relacionamento Reserva <-> Comida)
CREATE TABLE public.reservation_food (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    food_id UUID REFERENCES public.food_menu(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. RESERVATION ACTIVITIES (Relacionamento Reserva <-> Extras)
CREATE TABLE public.reservation_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES public.extra_activities(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup RLS (Row Level Security) - Permite leitura pública (Frontoffice) e acesso total pelo Backoffice (bypassed via Service Role)
-- Fleet
ALTER TABLE public.fleet ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.fleet FOR SELECT USING (true);
-- Food Menu
ALTER TABLE public.food_menu ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.food_menu FOR SELECT USING (true);
-- Extra Activities
ALTER TABLE public.extra_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.extra_activities FOR SELECT USING (true);
-- Blog Posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.blog_posts FOR SELECT USING (true);
-- Reservations
-- Reservations devem ser protegidas, clientes apenas podem inserir (frontoffice) e backoffice lê tudo.
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can insert reservations" ON public.reservations FOR INSERT WITH CHECK (true);
-- Reservation Food/Activities
ALTER TABLE public.reservation_food ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can insert reservation_food" ON public.reservation_food FOR INSERT WITH CHECK (true);
ALTER TABLE public.reservation_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can insert reservation_activities" ON public.reservation_activities FOR INSERT WITH CHECK (true);

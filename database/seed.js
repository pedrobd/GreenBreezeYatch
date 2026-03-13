const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const fleet = [
    {
        name: "Chaparrall",
        type: "Lancha Rápida",
        capacity: 8,
        current_location: "Doca 3, Marina de Albufeira",
        status: "Disponível",
        base_price: 450.00,
    },
    {
        name: "Greenline 33",
        type: "Híbrido Solar",
        capacity: 10,
        current_location: "Doca 1, Marina de Albufeira",
        status: "Em Viagem",
        base_price: 1200.00,
    },
    {
        name: "Jenneau",
        type: "Veleiro",
        capacity: 6,
        current_location: "Doca 5, Marina de Albufeira",
        status: "Disponível",
        base_price: 600.00,
    },
    {
        name: "Pussicat",
        type: "Catamarã VIP",
        capacity: 16,
        current_location: "Doca VIP, Marina de Albufeira",
        status: "Manutenção",
        base_price: 1800.00,
    }
];

const foodItems = [
    {
        name: "Tábua de Queijos e Charcutaria Premium",
        category: "Aperitivos",
        price: 65.00,
        status: "Disponível",
        dietary_info: "Nenhum",
        stock: 999,
    },
    {
        name: "Sushi Combo (40 peças)",
        category: "Refeição Principal",
        price: 90.00,
        status: "Disponível",
        dietary_info: "Nenhum",
        stock: 999,
    },
    {
        name: "Moët & Chandon Imperial Brut",
        category: "Bebidas",
        price: 120.00,
        status: "Pouco Stock",
        dietary_info: "Nenhum",
        stock: 5,
    }
];

const activities = [
    {
        name: "Aluguer de Jetski (Seadoo)",
        type: "Equipamento Motorizado",
        price: 150.00,
        status: "Disponível",
        stock: 2,
        availability: "Sempre",
    },
    {
        name: "Sessão Fotográfica com Drone",
        type: "Serviço",
        price: 200.00,
        status: "Disponível",
        stock: 999,
        availability: "Requer Marcação (48h)",
    }
];

const blogPosts = [
    {
        title: "As 5 Melhores Praias Secretas do Algarve",
        slug: "5-melhores-praias-secretas-algarve",
        author: "Maria Costa",
        publish_date: "2024-05-10",
        status: "Publicado",
        views: 1245,
        category: "Destinos & Dicas",
        content: "Conteúdo do artigo..."
    },
    {
        title: "Vinhos Algarvios: O que Provar a Bordo",
        slug: "vinhos-algarvios-provar-a-bordo",
        author: "Equipa GreenBreeze",
        publish_date: "2024-04-22",
        status: "Publicado",
        views: 850,
        category: "Gastronomia",
        content: "Conteúdo do artigo..."
    }
];

async function seed() {
    console.log("Seeding Fleet...");
    const { error: fleetErr } = await supabase.from('fleet').insert(fleet);
    if (fleetErr) console.error(fleetErr);

    console.log("Seeding Food...");
    const { error: foodErr } = await supabase.from('food_menu').insert(foodItems);
    if (foodErr) console.error(foodErr);

    console.log("Seeding Activities...");
    const { error: actErr } = await supabase.from('extra_activities').insert(activities);
    if (actErr) console.error(actErr);

    console.log("Seeding Blog...");
    const { error: blogErr } = await supabase.from('blog_posts').insert(blogPosts);
    if (blogErr) console.error(blogErr);

    console.log("Seeding Complete!");
}

seed();

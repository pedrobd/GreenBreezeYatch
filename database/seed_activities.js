const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedActivities() {
    console.log("Seeding Activities...");
    const activities = [
        {
            name: "Paddle Boarding",
            type: "Desporto Aquático",
            price: 25.00,
            status: "Disponível",
            stock: 10,
            availability: "Todos os dias, 09:00 - 18:00"
        },
        {
            name: "Snorkelling Tour",
            type: "Experiência",
            price: 45.00,
            status: "Disponível",
            stock: 5,
            availability: "Sábados e Domingos"
        },
        {
            name: "Jet Ski Rental",
            type: "Motorizado",
            price: 80.00,
            status: "Disponível",
            stock: 3,
            availability: "Mediante reserva prévia"
        }
    ];

    const { error } = await supabase.from('extra_activities').insert(activities);
    if (error) {
        console.error("Error seeding activities:", error);
    } else {
        console.log("Activities Seeded Successfully!");
    }
}

seedActivities();

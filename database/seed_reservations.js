const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedReservations() {
    console.log("Fetching Boats...");
    const { data: boats, error: boatsErr } = await supabase.from('fleet').select('id, name');
    if (boatsErr || !boats || boats.length === 0) {
        console.error("No boats found to link reservations to", boatsErr);
        return;
    }

    const reservations = [
        {
            client_name: "João Duarte",
            client_email: "joao.duarte@example.com",
            client_phone: "+351 912 345 678",
            boat_id: boats.find(b => b.name === "Chaparrall")?.id || boats[0].id,
            date: "2024-05-15",
            time: "10:00 - 14:00",
            status: "Confirmado",
            total_amount: 450.00,
            payment_status: "Pago",
            payment_method: "Cartão de Crédito"
        },
        {
            client_name: "Maria Costa",
            client_email: "maria.costa@example.com",
            client_phone: "+351 923 456 789",
            boat_id: boats.find(b => b.name === "Greenline 33")?.id || boats[0].id,
            date: "2024-05-18",
            time: "09:30 - 17:30",
            status: "Pendente",
            total_amount: 1200.00,
            payment_status: "Aguardando Pagamento",
            payment_method: "Pronta a Pagar"
        },
        {
            client_name: "Ana Ribeiro",
            client_email: "ana.r@example.com",
            boat_id: boats.find(b => b.name === "Pussicat")?.id || boats[0].id,
            date: "2024-05-22",
            time: "10:00 - 18:00",
            status: "Cancelado",
            total_amount: 1800.00,
            payment_status: "Reembolsado",
            payment_method: "Transferência"
        }
    ];

    console.log("Seeding Reservations...");
    const { error } = await supabase.from('reservations').insert(reservations);
    if (error) {
        console.error(error);
    } else {
        console.log("Reservations Seeded Successfully!");
    }
}

seedReservations();

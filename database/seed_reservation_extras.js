const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedReservationExtras() {
    console.log("Seeding Reservation Extras...");

    // 1. Get some reservations
    const { data: reservations } = await supabase.from('reservations').select('id').limit(5);
    if (!reservations || reservations.length === 0) {
        console.log("No reservations found to seed extras.");
        return;
    }

    // 2. Get some activities
    const { data: activities } = await supabase.from('extra_activities').select('id').limit(3);
    const { data: rootActivities } = await supabase.from('activities').select('id').limit(3);

    // We discovered earlier we have both `activities` and `extra_activities`. Assuming extra_activities is the one.
    const activeExtras = activities && activities.length > 0 ? activities : rootActivities;

    // 3. Get some food
    const { data: foodItems } = await supabase.from('food_menu').select('id').limit(3);

    if (!activeExtras || activeExtras.length === 0 || !foodItems || foodItems.length === 0) {
        console.log("Not enough extras or food to seed.");
        return;
    }

    // 4. Create relationships
    const reservationActivities = [];
    const reservationFood = [];

    // Assign random extras and food to reservations
    reservations.forEach((res, index) => {
        // Assign 1 activity
        reservationActivities.push({
            reservation_id: res.id,
            activity_id: activeExtras[index % activeExtras.length].id,
            quantity: Math.floor(Math.random() * 4) + 1
        });

        // Assign 1 food item
        reservationFood.push({
            reservation_id: res.id,
            food_id: foodItems[index % foodItems.length].id,
            quantity: Math.floor(Math.random() * 8) + 2
        });
    });

    // 5. Insert
    const { error: actError } = await supabase.from('reservation_activities').insert(reservationActivities);
    if (actError) console.error("Error seeding reservation_activities:", actError);
    else console.log("Seeded reservation_activities.");

    const { error: foodError } = await supabase.from('reservation_food').insert(reservationFood);
    if (foodError) console.error("Error seeding reservation_food:", foodError);
    else console.log("Seeded reservation_food.");

    console.log("Finished seeding.");
}

seedReservationExtras();

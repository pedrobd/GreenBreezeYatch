const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateReservationDate() {
    const today = new Date().toISOString().split('T')[0];
    const { data: reservations, error: fetchErr } = await supabase.from('reservations').select('id').limit(1);

    if (reservations && reservations.length > 0) {
        const resId = reservations[0].id;
        const { error: updateErr } = await supabase.from('reservations').update({ date: today }).eq('id', resId);
        if (updateErr) {
            console.error("Failed to update:", updateErr);
        } else {
            console.log("Successfully updated reservation to today:", today);
        }
    } else {
        console.log("No reservations found.");
    }
}

updateReservationDate();

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
    process.env[k] = envConfig[k];
}

async function checkSchema() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error("Missing credentials");
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Checking tables...");
    
    // Check coupons
    const { error: couponError } = await supabase.from('coupons').select('id').limit(1);
    console.log("Table 'coupons':", couponError ? (couponError.code === '42P01' ? 'MISSING' : couponError.message) : 'EXISTS');

    // Check profiles
    const { error: profileError } = await supabase.from('profiles').select('id').limit(1);
    console.log("Table 'profiles':", profileError ? (profileError.code === '42P01' ? 'MISSING' : profileError.message) : 'EXISTS');

    // Check team_members
    const { error: teamError } = await supabase.from('team_members').select('id').limit(1);
    console.log("Table 'team_members':", teamError ? (teamError.code === '42P01' ? 'MISSING' : teamError.message) : 'EXISTS');

    // Check staff_rates
    const { error: ratesError } = await supabase.from('staff_rates').select('id').limit(1);
    console.log("Table 'staff_rates':", ratesError ? (ratesError.code === '42P01' ? 'MISSING' : ratesError.message) : 'EXISTS');

    // Check reservation_staff
    const { error: staffResError } = await supabase.from('reservation_staff').select('id').limit(1);
    console.log("Table 'reservation_staff':", staffResError ? (staffResError.code === '42P01' ? 'MISSING' : staffResError.message) : 'EXISTS');
}

checkSchema();

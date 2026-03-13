const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim().replace(/^"|"$/g, '');
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function addColumn() {
    console.log('Attempting to add sort_order column via RPC if exists...');
    // There is no standard DDL RPC, but let's try to just insert a dummy with sort_order 
    // to see if it implicitly works (it won't).
    
    // The only way to add columns is via the Supabase Dashboard or migrations.
    // However, I can try to use the 'pg_net' or similar if they are enabled, but unlikely.
    
    console.log('Checking if sort_order already exists safely...');
    const { data, error } = await supabase.from('food_menu').select('sort_order').limit(1);
    if (error) {
        if (error.code === '42703') { // undefined_column
            console.log('Column sort_order does NOT exist. Please add it to the food_menu table (Integer, default 0).');
        } else {
            console.error('Error checking column:', error);
        }
    } else {
        console.log('Column sort_order already exists!');
    }
}

addColumn();

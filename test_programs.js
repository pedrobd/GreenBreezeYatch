const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://uivklnesapamowuafgld.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// I will just use the anon key if present in env.local
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
let key = "";
let url = "https://uivklnesapamowuafgld.supabase.co";
for (const line of envFile.split('\n')) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

const supabase = createClient(url, key);

async function run() {
    const { data, error } = await supabase.from('boat_programs').select('boat_id, name, duration_hours');
    console.log(JSON.stringify(data, null, 2));
}
run();

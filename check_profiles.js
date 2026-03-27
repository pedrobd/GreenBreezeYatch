const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) { process.env[k] = envConfig[k]; }

async function checkProfiles() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) { console.error(error); return; }
    console.log("Found " + data.length + " profiles:");
    data.forEach(p => console.log("- " + p.full_name + " (" + p.role + ")"));
}

checkProfiles();

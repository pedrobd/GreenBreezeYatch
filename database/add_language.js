const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addLanguage() {
    const sql = `
        ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS marina_name TEXT;
        ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS language TEXT;
        ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS timezone TEXT;
    `;

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error('Error executing SQL via RPC:', error);
    } else {
        console.log('Successfully added columns (marina_name, language, timezone) to system_settings');
    }
}

addLanguage();

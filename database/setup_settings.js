const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setup() {
    console.log('Setting up system_settings table...');

    const sql = `
    CREATE TABLE IF NOT EXISTS public.system_settings (
        id TEXT PRIMARY KEY,
        gemini_api_key TEXT,
        brand_tone TEXT,
        seo_keywords TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

    -- Create policy (Allow authenticated users to manage settings)
    DO $$ BEGIN
        CREATE POLICY "Admins can manage system_settings" 
        ON public.system_settings 
        FOR ALL 
        USING (auth.role() = 'authenticated');
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END $$;
  `;

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        // If rpc exec_sql is not available, we might need another way or just report it
        console.error('Error executing SQL via RPC:', error);
        console.log('Attempting to create table directly via query if possible (Note: some Supabase projects don\'t allow arbitrary SQL via client)');

        // Alternative: check if table exists by trying to select from it
        const { error: selectError } = await supabase.from('system_settings').select('id').limit(1);
        if (selectError) {
            console.log('Please run the following SQL in your Supabase SQL Editor:');
            console.log(sql);
        } else {
            console.log('Table system_settings already exists.');
        }
    } else {
        console.log('Successfully set up system_settings table.');
    }
}

setup();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addFrontofficeExtras() {
    console.log("Adding description, image_url, and show_in_frontoffice to boat_extras table...");

    // Using an RPC call or directly executing SQL via the REST API
    // The easiest way is to use a direct rpc call if available, or just run SQL since we are admin
    // Wait, by default there is no arbitrary SQL execution on supabase client. 
    // We can use the postgres connection string or do it in the SQL Editor.
    // However, Supabase JS client doesn't execute raw SQL unless you've defined an RPC function for it.

    // Instead of raw query, I'll log instruction to run this via psql or SQL editor
    console.log(`
Please run the following SQL command in your Supabase SQL Editor:

ALTER TABLE public.boat_extras 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS show_in_frontoffice BOOLEAN DEFAULT true;
    `);

    console.log("You can also run this locally using: npx supabase db psql");
}

addFrontofficeExtras();

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('Adding sort_order column to extras table...');
    
    // Attempt DDL - SQL script to repeat in Dashboard if this fails
    const sql = `ALTER TABLE extras ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;`;
    
    console.log('Please execute the following SQL in the Supabase Dashboard SQL Editor:');
    console.log(sql);
}

migrate();

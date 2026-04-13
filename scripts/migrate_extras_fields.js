const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('Adding category and quantity columns to extras table...');
    
    // Check if columns exist first via RPC or direct SQL
    // Since I don't have a direct SQL runner, I'll try to add them and handle error
    
    const { error: error1 } = await supabase.rpc('exec_sql', {
        sql_string: 'ALTER TABLE extras ADD COLUMN IF NOT EXISTS category text DEFAULT \'aluguer\';'
    });
    
    if (error1) {
        // Falling back to a simple insert/delete if RPC is missing
        console.log('exec_sql RPC might be missing, attempting DDL via regular query if possible (Note: usually needs SQL editor)');
        console.error('Error adding category:', error1.message);
    }

    const { error: error2 } = await supabase.rpc('exec_sql', {
        sql_string: 'ALTER TABLE extras ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1;'
    });
    
    if (error2) {
        console.error('Error adding quantity:', error2.message);
    }

    console.log('Migration attempted.');
}

migrate();

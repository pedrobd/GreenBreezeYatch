const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runStaffMigration() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const sqlPath = path.join(__dirname, 'add_staff_to_reservations.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Applying staff columns migration...");

    // Using postgres extension if available or just informative error
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        console.error("Error applying migration via RPC. Please copy-paste the content of 'database/add_staff_to_reservations.sql' into the Supabase SQL Editor manually.");
        process.exit(1);
    }

    console.log("Migration applied successfully!");
}

runStaffMigration();


const { createClient } = require('@supabase/supabase-client');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase
        .from('fleet')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching from fleet:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns in fleet:', Object.keys(data[0]));
    } else {
        console.log('No data in fleet table to infer columns. Trying a different approach...');
        const { data: columns, error: colError } = await supabase
            .rpc('get_table_columns', { table_name: 'fleet' });

        if (colError) {
            console.error('Error fetching columns via RPC (might not exist):', colError);
        } else {
            console.log('Columns:', columns);
        }
    }
}

checkSchema();

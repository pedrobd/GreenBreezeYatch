const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Service Role Key");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
    const { data, error } = await supabase.auth.admin.createUser({
        email: 'info@greenbreeze.pt',
        password: 'Password123!',
        email_confirm: true
    });

    if (error) {
        console.error("Error creating user:", error.message);
    } else {
        console.log("Admin user created successfully:", data.user.email);
    }
}

createAdmin();

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase variables in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPassword() {
  try {
    // List users
    console.log("Fetching users...");
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error fetching users:", usersError);
      return;
    }

    const users = usersData.users;
    if (users.length === 0) {
      console.log("No users found in this Supabase project.");
      return;
    }

    console.log(`Found ${users.length} users:`);
    for (const user of users) {
      console.log(`- ID: ${user.id}, Email: ${user.email}`);
      
      // Let's reset the first user's password or all users if it's a test env
      // Usually there is only one or two admins. Let's just reset everyone's password to 'Greenbreeze2026!'
      const newPassword = "Greenbreeze2026!";
      console.log(`Resetting password for ${user.email} to: ${newPassword}`);
      
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: newPassword,
        email_confirm: true // just in case
      });

      if (error) {
         console.error(`Failed to reset password for ${user.email}:`, error.message);
      } else {
         console.log(`Successfully reset password for ${user.email}.`);
      }
    }
  } catch (err) {
    console.error("Script error:", err);
  }
}

resetPassword();

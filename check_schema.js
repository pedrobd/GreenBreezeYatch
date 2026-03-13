const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gtaytqkzonbiyfmjwtbd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0YXl0cWt6b25iaXlmbWp3dGJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTA5ODAsImV4cCI6MjA4NzYyNjk4MH0.p-HXoVHbTeRdzOS2pebvtpp8iaSeFT3iqaiWDEL_Xi8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('food_menu').select('*').limit(1);
    if (error) {
        console.error(error);
        return;
    }
    if (data && data.length > 0) {
        console.log('COLUMNS:' + JSON.stringify(Object.keys(data[0])));
    } else {
        console.log("Empty table");
    }
}

check();

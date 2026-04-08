const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gtaytqkzonbiyfmjwtbd.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0YXl0cWt6b25iaXlmbWp3dGJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA1MDk4MCwiZXhwIjoyMDg3NjI2OTgwfQ.DqG8AZpMuEtm0ChM1u1xS8a2F8ubFE1gxOoqDUYg-NA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function sync() {
    console.log('--- STARTING SYNC ---');
    
    // 1. Fetch from 'extras'
    const { data: extras } = await supabase.from('extras').select('*');
    console.log(`Found ${extras?.length || 0} global extras.`);
    
    for (const extra of (extras || [])) {
        console.log(`Syncing global extra: ${extra.name} (${extra.id})`);
        const { error } = await supabase.from('extra_activities').upsert({
            id: extra.id,
            name: extra.name,
            price: extra.price,
            type: 'Global Extra',
            status: 'Active',
            updated_at: new Date().toISOString()
        });
        if (error) console.error(`Error syncing ${extra.name}:`, error.message);
    }
    
    // 2. Fetch from 'boat_extras'
    const { data: boatExtras } = await supabase.from('boat_extras').select('*');
    console.log(`Found ${boatExtras?.length || 0} boat-specific extras.`);
    
    for (const bExtra of (boatExtras || [])) {
        console.log(`Syncing boat extra: ${bExtra.name} (${bExtra.id})`);
        const { error } = await supabase.from('extra_activities').upsert({
            id: bExtra.id,
            name: bExtra.name,
            price: bExtra.price,
            type: 'Boat Extra',
            status: 'Active',
            updated_at: new Date().toISOString()
        });
        if (error) console.error(`Error syncing ${bExtra.name}:`, error.message);
    }
    
    console.log('--- SYNC COMPLETED ---');
}

sync();

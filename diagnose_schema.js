
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manual env parsing
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
    console.error('Could not read .env.local');
    process.exit(1)
}

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim().replace(/^"|"$/g, '');
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
    let output = 'Starting Diagnostic...\n\n';

    // 1. Check columns of reservations
    const { data, error } = await supabase.from('reservations').select('*').limit(1);
    if (error) {
        output += `Error fetching reservations: ${JSON.stringify(error, null, 2)}\n`;
    } else if (data && data.length > 0) {
        output += `Reservations columns found: ${Object.keys(data[0]).join(', ')}\n`;
    } else {
        output += 'Reservations table is empty.\n';
    }

    // 2. Check team_members
    const { data: teamData, error: teamError } = await supabase.from('team_members').select('*').limit(1);
    if (teamError) {
        output += `Error fetching team_members: ${JSON.stringify(teamError, null, 2)}\n`;
    } else {
        output += 'team_members table is OK.\n';
    }

    // 3. Check staff_rates
    const { data: ratesData, error: ratesError } = await supabase.from('staff_rates').select('*').limit(1);
    if (ratesError) {
        output += `Error fetching staff_rates: ${JSON.stringify(ratesError, null, 2)}\n`;
    } else if (ratesData && ratesData.length > 0) {
        output += `Staff Rates columns found: ${Object.keys(ratesData[0]).join(', ')}\n`;
    } else {
        output += 'staff_rates table is empty or missing.\n';
    }

    // 4. Test the join
    output += '\nTesting join...\n';
    const { error: joinError } = await supabase
        .from('reservations')
        .select('*, skipper:team_members!skipper_id(name)')
        .limit(1);

    if (joinError) {
        output += `Join failed: ${JSON.stringify(joinError, null, 2)}\n`;
    } else {
        output += 'Join worked!\n';
    }

    fs.writeFileSync('diag_result.txt', output, 'utf8');
    console.log('Diagnostic finished. See diag_result.txt');
}

diagnose();

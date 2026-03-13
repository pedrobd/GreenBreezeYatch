import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
    console.log('Checking reservations table schema...')
    const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .limit(1)

    console.log('\nChecking boat_programs table...')
    const { data: programs, error: progError } = await supabase.from('boat_programs').select('*').limit(1)

    console.log('\nChecking fleet table...')
    const { data: fleet, error: fleetError } = await supabase.from('fleet').select('*').limit(1)

    console.log('\nChecking extra_activities table...')
    const { data: acts, error: actsError } = await supabase.from('extra_activities').select('*').limit(1)

    console.log('\nChecking food_menu table...')
    const { data: food, error: foodError } = await supabase.from('food_menu').select('*').limit(1)

    const results = {
        reservations: data && data.length > 0 ? Object.keys(data[0]) : [],
        boat_programs: programs && programs.length > 0 ? Object.keys(programs[0]) : [],
        fleet: fleet && fleet.length > 0 ? Object.keys(fleet[0]) : [],
        extra_activities: acts && acts.length > 0 ? Object.keys(acts[0]) : [],
        food_menu: food && food.length > 0 ? Object.keys(food[0]) : [],
        resError: error,
        progError: progError,
        fleetError: fleetError,
        actsError: actsError,
        foodError: foodError
    }

    fs.writeFileSync('schema_info.json', JSON.stringify(results, null, 2))
    console.log('Schema info written to schema_info.json')
}

checkSchema()

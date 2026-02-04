import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import * as bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyIntegrity() {
    console.log('--- TASK 1: DATABASE INTEGRITY VERIFICATION ---');

    // 1. Fetch Demo Restaurant
    const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', 'demo')
        .single();

    if (error || !restaurant) {
        console.error('FAILED: Could not fetch "demo" restaurant.', error);
        return;
    }

    console.log(`Restaurant Name: ${restaurant.name}`);
    console.log(`Stored Owner Hash: ${restaurant.owner_password_hash}`);
    console.log(`Stored Staff Hash: ${restaurant.staff_pin_hash}`);

    // 2. Test Owner Comparison
    const testOwnerPass = 'demo@123';
    const ownerMatch = await bcrypt.compare(testOwnerPass, restaurant.owner_password_hash);
    console.log(`\nTesting Owner Password: "${testOwnerPass}"`);
    console.log(`Bcrypt Match Result: ${ownerMatch ? '✅ SUCCESS' : '❌ FAILED'}`);

    // 3. Test Staff Comparison
    const testStaffPin = '1234';
    const staffMatch = await bcrypt.compare(testStaffPin, restaurant.staff_pin_hash);
    console.log(`\nTesting Staff PIN: "${testStaffPin}"`);
    console.log(`Bcrypt Match Result: ${staffMatch ? '✅ SUCCESS' : '❌ FAILED'}`);

    console.log('\n--- VERIFICATION COMPLETE ---');
}

verifyIntegrity();

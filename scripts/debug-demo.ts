import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import * as bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('--- DATA VERIFICATION MODE: Task 1 ---');
    try {
        const { data: restaurant, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('slug', 'demo')
            .single();

        if (error) {
            console.error('ERROR fetching demo:', error);
            return;
        }

        console.log(`[VERIFY] Slug: ${restaurant.slug}`);
        console.log(`[VERIFY] Owner Hash: ${restaurant.owner_password_hash}`);
        console.log(`[VERIFY] Staff Hash: ${restaurant.staff_pin_hash}`);

        const ownerMatch = await bcrypt.compare('demo@123', restaurant.owner_password_hash);
        console.log(`[VERIFY] Owner Password Match (demo@123): ${ownerMatch ? '✅ YES' : '❌ NO'}`);

        const staffMatch = await bcrypt.compare('1234', restaurant.staff_pin_hash);
        console.log(`[VERIFY] Staff PIN Match (1234): ${staffMatch ? '✅ YES' : '❌ NO'}`);

    } catch (e) {
        console.error('UNEXPECTED ERROR:', e);
    }
}
run();

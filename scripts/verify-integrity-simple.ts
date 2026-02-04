import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import * as bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyIntegrity() {
    try {
        const { data: restaurant, error } = await supabase.from('restaurants').select('*').eq('slug', 'demo').single();
        if (error || !restaurant) { console.log('FAILED TO FETCH DEMO'); return; }

        const ownerMatch = await bcrypt.compare('demo@123', restaurant.owner_password_hash);
        const staffMatch = await bcrypt.compare('1234', restaurant.staff_pin_hash);

        console.log('--- DATA VERIFICATION REPORT ---');
        console.log(`Restaurant Slug: ${restaurant.slug}`);
        console.log(`Stored Owner Hash: ${restaurant.owner_password_hash}`);
        console.log(`Stored Staff Hash: ${restaurant.staff_pin_hash}`);
        console.log(`Owner Match (demo@123): ${ownerMatch ? 'YES' : 'NO'}`);
        console.log(`Staff Match (1234): ${staffMatch ? 'YES' : 'NO'}`);
        console.log('-------------------------------');
    } catch (e) { console.log('ERROR: ' + e.message); }
}
verifyIntegrity();

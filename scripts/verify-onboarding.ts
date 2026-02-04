import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyOnboardingData() {
    console.log('Verifying Onboarding Data...');

    // 1. Get the latest created restaurant (non-demo)
    const { data: restaurants, error: rErr } = await supabase
        .from('restaurants')
        .select('*')
        .neq('slug', 'demo')
        .order('created_at', { ascending: false })
        .limit(1);

    if (rErr || !restaurants || restaurants.length === 0) {
        console.error('No new restaurant found!');
        process.exit(1);
    }

    const rest = restaurants[0];
    console.log(`Found Restaurant: ${rest.name} (${rest.slug})`);
    console.log(`ID: ${rest.id}`);

    // 2. Check Tables
    const { count: tableCount } = await supabase
        .from('tables')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', rest.id);

    console.log(`Tables auto-seeded: ${tableCount} (Expected: 10)`);

    // 3. Check Categories
    const { count: catCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', rest.id);

    console.log(`Categories auto-seeded: ${catCount} (Expected: 4)`);

    if (tableCount === 10 && catCount === 4) {
        console.log('✅ ONBOARDING DATA VERIFIED');
    } else {
        console.error('❌ ONBOARDING DATA INCOMPLETE');
        process.exit(1);
    }
}

verifyOnboardingData();

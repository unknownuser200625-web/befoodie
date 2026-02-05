import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySeeding() {
    console.log('Verifying Seeding Results...');

    // 1. Check Restaurant
    const { data: restaurants } = await supabase.from('restaurants').select('*').eq('slug', 'demo');
    console.log(`Restaurants found: ${restaurants?.length} (Expected: 1)`);
    if (restaurants?.[0]) console.log('Demo ID:', restaurants[0].id);

    // 2. Check Categories
    const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
    console.log(`Categories count: ${catCount} (Expected: > 0)`);

    // 3. Check Products
    const { count: prodCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
    console.log(`Products count: ${prodCount} (Expected: > 0)`);

    // 4. Check Tables
    const { count: tableCount, data: tables } = await supabase.from('tables').select('*', { count: 'exact' });
    console.log(`Tables count: ${tableCount} (Expected: 10)`);
    if (tables && tables.length > 0) {
        console.log('Sample Table:', tables[0]);
    }

    if (restaurants?.length === 1 && (catCount || 0) > 0 && (prodCount || 0) > 0 && (tableCount || 0) >= 10) {
        console.log('✅ VERIFICATION SUCCESS');
    } else {
        console.error('❌ VERIFICATION FAILED');
        process.exit(1);
    }
}

verifySeeding();

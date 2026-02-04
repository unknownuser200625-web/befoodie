
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_PASSWORD = 'demo@123';
const TARGET_SLUG = 'demo';

async function verify() {
    console.log(`[VERIFY] Checking credentials for restaurant: ${TARGET_SLUG}`);

    const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', TARGET_SLUG)
        .single();

    if (error || !restaurant) {
        console.error('[ERROR] Could not find demo restaurant:', error?.message);
        return;
    }

    console.log(`[INFO] Found restaurant: ${restaurant.name} (ID: ${restaurant.id})`);

    const storedHash = restaurant.owner_password_hash;
    console.log(`[INFO] Current Hash: ${storedHash}`);

    if (!storedHash) {
        console.log('[WARN] No hash found! Proceeding to update...');
    } else {
        const isMatch = await bcrypt.compare(TARGET_PASSWORD, storedHash);
        if (isMatch) {
            console.log('--- VERIFICATION SUCCESS ---');
            console.log(`Password "${TARGET_PASSWORD}" is VALID for slug "${TARGET_SLUG}"`);
            console.log('--- END LOG ---');
            return;
        } else {
            console.log('--- VERIFICATION FAILURE ---');
            console.log(`Password "${TARGET_PASSWORD}" is INVALID for slug "${TARGET_SLUG}"`);
        }
    }

    console.log('[ACTION] Regenerating hash and updating database...');
    const newHash = await bcrypt.hash(TARGET_PASSWORD, 10);

    const { error: updateError } = await supabase
        .from('restaurants')
        .update({ owner_password_hash: newHash })
        .eq('slug', TARGET_SLUG);

    if (updateError) {
        console.error('[ERROR] Failed to update hash:', updateError.message);
    } else {
        console.log(`[SUCCESS] Hash updated successfully to: ${newHash}`);
    }
}

verify();

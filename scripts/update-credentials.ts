import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import * as bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCredentials() {
    console.log('Generating hashes...');

    // 1. Generate Hashes
    const ownerPassword = "demo@123";
    const staffPin = "1234";

    const ownerHash = await bcrypt.hash(ownerPassword, 10);
    const pinHash = await bcrypt.hash(staffPin, 10);

    console.log("Hashes generated.");

    // 2. Update Restaurant
    console.log("Updating demo restaurant...");
    const { data, error } = await supabase
        .from('restaurants')
        .update({
            owner_password_hash: ownerHash,
            staff_pin_hash: pinHash
        })
        .eq('slug', 'demo')
        .select();

    if (error) {
        console.error("Update failed:", error);
        process.exit(1);
    }

    console.log("✅ Credentials updated successfully!");
    console.log("Owner Hash:", ownerHash);
    console.log("Staff Hash:", pinHash);
}

updateCredentials();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local manually
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        console.log('Fetching restaurants...');
        const { data, error } = await supabase.from('restaurants').select('*').limit(1);

        if (error) {
            console.error('Supabase Error:', error);
            process.exit(1);
        }

        console.log('Success! Connection verified.');
        console.log('Data sample:', data);
    } catch (err) {
        console.error('Unexpected error:', err);
        process.exit(1);
    }
}

testConnection();

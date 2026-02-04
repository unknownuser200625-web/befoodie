import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import * as bcrypt from 'bcryptjs';
import { PRODUCTS } from '../src/lib/data'; // Adjust path if needed

// Load .env.local manually
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedDatabase() {
    console.log('Starting seed process...');

    try {
        // 1. Get or Create Demo Restaurant
        const { data: restaurant, error: resError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('slug', 'demo')
            .single();

        if (resError && resError.code !== 'PGRST116') {
            console.error('Error fetching restaurant:', resError);
            return;
        }

        let restaurantId = restaurant?.id;

        const ownerHash = await bcrypt.hash('demo@123', 10);
        const pinHash = await bcrypt.hash('1234', 10);

        if (!restaurantId) {
            console.log('Creating demo restaurant...');
            const { data: newRes, error: createError } = await supabase
                .from('restaurants')
                .insert({
                    slug: 'demo',
                    name: 'Demo Restaurant',
                    active_session_id: 'session-1',
                    owner_password_hash: ownerHash,
                    staff_pin_hash: pinHash
                })
                .select()
                .single();

            if (createError) throw createError;
            restaurantId = newRes.id;
            console.log('Created demo restaurant with ID:', restaurantId);
        } else {
            console.log('Found existing demo restaurant:', restaurantId);
            // Optional: Update hashes if they don't match, but for seeding we might just want to ensure they are set
            // For now, let's update them to ensure we are in a consistent state
            await supabase.from('restaurants').update({
                owner_password_hash: ownerHash,
                staff_pin_hash: pinHash
            }).eq('id', restaurantId);
            console.log('Updated demo restaurant credentials.');
        }

        // 2. Sync Categories
        const uniqueCategories = Array.from(new Set(PRODUCTS.map((p: any) => p.category)));
        console.log(`Found ${uniqueCategories.length} categories to sync.`);

        for (const catName of uniqueCategories) {
            const { data: existingCat } = await supabase
                .from('categories')
                .select('id')
                .eq('restaurant_id', restaurantId)
                .eq('name', catName)
                .single();

            if (!existingCat) {
                await supabase.from('categories').insert({
                    restaurant_id: restaurantId,
                    name: catName,
                    order_index: 0
                });
            }
        }
        console.log('Categories synced.');

        // 3. Sync Products
        console.log(`Syncing ${PRODUCTS.length} products...`);
        const productsToUpsert = PRODUCTS.map((p: any) => ({
            id: p.id,
            restaurant_id: restaurantId,
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            image: p.image,
            available: p.available
        }));

        const { error: productsError } = await supabase
            .from('products')
            .upsert(productsToUpsert, { onConflict: 'id' });

        if (productsError) {
            console.error('Error syncing products:', productsError);
            throw productsError;
        }
        console.log('Products synced successfully!');

        // 4. Create Tables
        const tables = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        console.log(`Syncing ${tables.length} tables...`);

        for (const tNum of tables) {
            const { error: tableError } = await supabase
                .from('tables')
                .upsert({
                    restaurant_id: restaurantId,
                    table_number: tNum
                }, { onConflict: 'restaurant_id, table_number' });

            if (tableError) {
                console.error(`Error syncing table ${tNum}:`, tableError);
            }
        }
        console.log('Tables synced.');
        console.log('Seed completed successfully.');

    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
}

seedDatabase();

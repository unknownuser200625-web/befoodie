import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { PRODUCTS } from '../src/lib/data'; // Adjust path if needed
import { Product } from '../src/types';

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
            // PGRST116 is "The result contains 0 rows"
            console.error('Error fetching restaurant:', resError);
            return;
        }

        let restaurantId = restaurant?.id;

        if (!restaurantId) {
            console.log('Creating demo restaurant...');
            const { data: newRes, error: createError } = await supabase
                .from('restaurants')
                .insert({
                    slug: 'demo',
                    name: 'Demo Restaurant',
                    active_session_id: 'session-1', // Default active session
                    owner_password_hash: 'admin123', // In real app, hash this
                    staff_pin_hash: '1234'
                })
                .select()
                .single();

            if (createError) throw createError;
            restaurantId = newRes.id;
            console.log('Created demo restaurant with ID:', restaurantId);
        } else {
            console.log('Found existing demo restaurant:', restaurantId);
        }

        // 2. Sync Categories
        const uniqueCategories = Array.from(new Set(PRODUCTS.map((p: any) => p.category)));
        console.log(`Found ${uniqueCategories.length} categories to sync.`);

        for (const catName of uniqueCategories) {
            // Check if exists
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

        // Prepare products with correct restaurant_id
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

        // Upsert (Insert or Update)
        const { error: productsError } = await supabase
            .from('products')
            .upsert(productsToUpsert, { onConflict: 'id' });

        if (productsError) {
            console.error('Error syncing products:', productsError);
            throw productsError;
        }

        console.log('Products synced successfully!');

        // 4. Create Tables
        const tables = ['1', '2', '3', '4', '5'];
        console.log(`Syncing ${tables.length} tables...`);

        for (const tNum of tables) {
            const { error: tableError } = await supabase
                .from('tables')
                .upsert({
                    restaurant_id: restaurantId,
                    table_number: tNum
                }, { onConflict: 'restaurant_id, table_number' }); // Requires unique constraint in schema

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

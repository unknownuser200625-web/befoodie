import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Test API endpoint to verify Supabase database connection
 * GET /api/test-db
 */
export async function GET() {
    try {
        // Test 1: Fetch restaurants table
        const { data: restaurants, error: restaurantsError } = await supabase
            .from('restaurants')
            .select('*')
            .limit(5);

        if (restaurantsError) {
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch restaurants',
                details: restaurantsError.message,
            }, { status: 500 });
        }

        // Test 2: Fetch products table (check restaurant_id exists)
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, name, restaurant_id')
            .limit(5);

        if (productsError) {
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch products',
                details: productsError.message,
            }, { status: 500 });
        }

        // Test 3: Verify multi-tenant structure
        const hasRestaurantId = products && products.length > 0 && products.every(p => p.restaurant_id);

        return NextResponse.json({
            success: true,
            message: 'Supabase connection successful',
            tests: {
                restaurants: {
                    count: restaurants?.length || 0,
                    data: restaurants,
                },
                products: {
                    count: products?.length || 0,
                    hasRestaurantId,
                    sample: products?.slice(0, 2),
                },
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        let details = "Unknown error";
        if (error instanceof Error) {
            details = error.message;
        }
        return NextResponse.json({
            success: false,
            error: 'Database connection test failed',
            details: details,
        }, { status: 500 });
    }
}

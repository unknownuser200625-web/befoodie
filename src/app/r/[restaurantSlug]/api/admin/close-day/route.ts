import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;

        // 1. Resolve Restaurant
        const { data: restaurant, error: resError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('slug', restaurantSlug)
            .single();

        if (resError || !restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        // 2. Call RPC to Close Session
        const { data, error: rpcError } = await supabase
            .rpc('close_operational_session', {
                p_restaurant_id: restaurant.id
            });

        if (rpcError) {
            console.error('[CLOSE-DAY] RPC Failed:', rpcError);
            return NextResponse.json({ error: rpcError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            summary: {
                total_orders: data.total_orders,
                total_revenue: data.total_revenue,
                total_tables: data.total_tables
            }
        });
    } catch (error) {
        console.error('Close Day error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

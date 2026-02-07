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

        // 2. Call RPC to Start Session
        const { data, error: rpcError } = await supabase
            .rpc('start_operational_session', {
                p_restaurant_id: restaurant.id
            });

        if (rpcError) {
            console.error('[START-NEW-DAY] RPC Failed:', rpcError);
            return NextResponse.json({ error: rpcError.message }, { status: 400 }); // Likely 'already exists'
        }

        console.log('[START-NEW-DAY] Success:', data);

        return NextResponse.json({
            success: true,
            operationalSessionId: data.operational_session_id,
            message: data.message
        });
    } catch (error) {
        console.error('Start New Day error', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

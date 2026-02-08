import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;

        // 1. Resolve Restaurant
        const { data: restaurant, error: resError } = await supabase
            .from('restaurants')
            .select('id, is_accepting_orders')
            .eq('slug', restaurantSlug)
            .single();

        console.log('[SESSION-STATUS] Restaurant lookup:', { restaurantSlug, found: !!restaurant });

        if (resError || !restaurant) {
            console.error('[SESSION-STATUS] Restaurant not found:', resError);
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        const today = new Date().toISOString().split('T')[0];

        // 2. Query Single Source of Truth View
        const { data: statusView, error: viewError } = await supabase
            .from('restaurant_status')
            .select('is_system_open, is_accepting_orders, current_business_date, active_operational_session_id')
            .eq('restaurant_id', restaurant.id)
            .single();

        if (viewError) {
            console.error('[SESSION-STATUS] View query error:', viewError);
            throw viewError;
        }

        const response = {
            is_system_open: statusView?.is_system_open ?? false,
            is_accepting_orders: statusView?.is_accepting_orders ?? false,
            current_business_date: statusView?.current_business_date || today,
            active_operational_session_id: statusView?.active_operational_session_id || null
        };

        console.log('[SESSION-STATUS] Response:', response);

        return NextResponse.json(response);
    } catch (error) {
        console.error('Session status error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

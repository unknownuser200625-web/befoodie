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

        // 2. Fetch Active Operational Session (Ignore date-strictness to prevent timezone sync issues)
        const { data: session, error: sessError } = await supabase
            .from('restaurant_operational_sessions')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (sessError) {
            console.error('[SESSION-STATUS] Session query error:', sessError);
            throw sessError;
        }

        const response = {
            isOpen: !!session,
            isAcceptingOrders: restaurant.is_accepting_orders,
            businessDate: session?.business_date || today,
            operationalSessionId: session?.id || null
        };

        console.log('[SESSION-STATUS] Response:', response);

        return NextResponse.json(response);
    } catch (error) {
        console.error('Session status error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

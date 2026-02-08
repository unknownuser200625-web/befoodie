import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;

        // 1. Call Security Definer RPC
        const { data: statusData, error: rpcError } = await supabase
            .rpc('get_restaurant_status', {
                p_slug: restaurantSlug
            });

        if (rpcError) {
            console.error('[SESSION-STATUS] RPC error:', rpcError);
            throw rpcError;
        }

        if (!statusData || statusData.length === 0) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        // 2. Handle Array Response
        const status = statusData[0];
        const today = new Date().toISOString().split('T')[0];

        const response = {
            is_system_open: status.is_system_open,
            is_accepting_orders: status.is_accepting_orders,
            current_business_date: status.current_business_date || today,
            active_operational_session_id: status.active_operational_session_id
        };

        console.log('[SESSION-STATUS] Response:', response);

        return NextResponse.json(response);
    } catch (error) {
        console.error('Session status error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

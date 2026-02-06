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
            .select('id')
            .eq('slug', restaurantSlug)
            .single();

        if (resError || !restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        const today = new Date().toISOString().split('T')[0];

        // 2. Fetch Active Operational Session
        const { data: session, error: sessError } = await supabase
            .from('restaurant_operational_sessions')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .eq('business_date', today)
            .eq('status', 'active')
            .maybeSingle();

        if (sessError) throw sessError;

        return NextResponse.json({
            isOpen: !!session,
            businessDate: today,
            sessionId: session?.id || null
        });
    } catch (error) {
        console.error('Session status error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

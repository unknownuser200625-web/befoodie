import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;

        const { data: restaurant, error: resError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('slug', restaurantSlug)
            .single();

        if (resError || !restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        const { data: history, error } = await supabase
            .from('history')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .order('date', { ascending: false });

        if (error) throw error;

        // Map snake_case to camelCase
        const mappedHistory = history.map(h => ({
            ...h,
            totalOrders: h.total_orders,
            totalRevenue: h.total_revenue,
            closedAt: h.closed_at,
            orders: [], // Deep historical data would need separate fetch per day if requested
            sessions: []
        }));

        return NextResponse.json(mappedHistory);
    } catch (error) {
        console.error('History GET error', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

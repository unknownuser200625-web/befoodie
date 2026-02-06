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

        const { data: summary, error } = await supabase
            .from('restaurant_daily_summary')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .order('business_date', { ascending: false });

        if (error) throw error;

        // Map snake_case to camelCase
        const mappedHistory = summary.map(h => ({
            id: h.id,
            date: h.business_date, // Map business_date to date for frontend compatibility
            totalOrders: h.total_orders,
            totalRevenue: h.total_revenue,
            closedAt: h.closed_at,
            orders: [],
            sessions: []
        }));

        return NextResponse.json(mappedHistory);
    } catch (error) {
        console.error('History GET error', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

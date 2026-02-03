import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
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

        const today = new Date().toISOString().split('T')[0];

        // 1. Get all closed sessions for today
        const { data: sessions, error: sessError } = await supabase
            .from('sessions')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .eq('business_date', today)
            .eq('status', 'PAID');

        if (sessError) throw sessError;

        const totalRevenue = sessions.reduce((sum, s) => sum + Number(s.total_amount), 0);
        const totalOrders = 0; // Would need to count orders linked to these sessions

        // 2. Insert into History
        const { error: histError } = await supabase
            .from('history')
            .insert({
                restaurant_id: restaurant.id,
                date: today,
                total_orders: totalOrders,
                total_revenue: totalRevenue,
                closed_at: new Date().toISOString()
            });

        if (histError) throw histError;

        // 3. Clear/Archive data (or just let it be, and next day starts fresh because of business_date)
        // Usually, we close the system for the day
        await supabase
            .from('restaurants')
            .update({ is_system_open: false })
            .eq('id', restaurant.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Start New Day error', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

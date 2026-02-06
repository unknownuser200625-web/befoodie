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

        // 2. Resolve Active Operational Session
        const { data: opsSession, error: opsError } = await supabase
            .from('restaurant_operational_sessions')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (opsError || !opsSession) {
            return NextResponse.json({ error: 'No active session to close' }, { status: 400 });
        }

        // 3. Aggregate Data for History Hardening
        // - total_orders (Number of tables/sessions)
        // - total_revenue (Sum of all PAID table_sessions)
        // - qr_orders_count (table_id != 'COUNTER')
        // - counter_orders_count (table_id == 'COUNTER')

        const { data: tableSessions } = await supabase
            .from('table_sessions')
            .select('id, table_id, total_amount, status')
            .eq('operational_session_id', opsSession.id);

        const paidSessions = tableSessions?.filter(s => s.status === 'paid') || [];

        const total_orders = paidSessions.length;
        const total_revenue = paidSessions.reduce((sum, s) => sum + Number(s.total_amount), 0);

        const counter_orders_count = paidSessions.filter(s => s.table_id === 'COUNTER').length;
        const qr_orders_count = total_orders - counter_orders_count;
        const average_order_value = total_orders > 0 ? (total_revenue / total_orders) : 0;

        // 4. Update Daily Summary
        const { error: summaryError } = await supabase
            .from('restaurant_daily_summary')
            .upsert({
                restaurant_id: restaurant.id,
                business_date: opsSession.business_date,
                total_orders,
                total_revenue,
                qr_orders_count,
                counter_orders_count,
                average_order_value,
                closed_at: new Date().toISOString()
            }, {
                onConflict: 'restaurant_id, business_date'
            });

        if (summaryError) throw summaryError;

        // 5. Hard Close the Session
        const { error: updateError } = await supabase
            .from('restaurant_operational_sessions')
            .update({
                status: 'closed',
                closed_at: new Date().toISOString()
            })
            .eq('id', opsSession.id);

        if (updateError) throw updateError;

        // 6. LEGACY compatibility: set is_system_open to false
        await supabase
            .from('restaurants')
            .update({ is_system_open: false })
            .eq('id', restaurant.id);

        return NextResponse.json({
            success: true,
            summary: {
                total_orders,
                total_revenue,
                qr_orders_count,
                counter_orders_count,
                average_order_value
            }
        });
    } catch (error) {
        console.error('Close Day error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

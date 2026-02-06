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

        const today = new Date().toISOString().split('T')[0];

        // 1. Close Past Active Sessions & Generate Summary
        const { data: pastSessions } = await supabase
            .from('restaurant_operational_sessions')
            .select('id, business_date')
            .eq('restaurant_id', restaurant.id)
            .eq('status', 'active')
            .lt('business_date', today);

        if (pastSessions && pastSessions.length > 0) {
            for (const sess of pastSessions) {
                // Calculate Revenue from PAID table sessions
                const { data: tableSessions } = await supabase
                    .from('table_sessions')
                    .select('total_amount')
                    .eq('operational_session_id', sess.id)
                    .eq('status', 'paid');

                const revenue = tableSessions?.reduce((sum, t) => sum + Number(t.total_amount), 0) || 0;
                const tablesServed = tableSessions?.length || 0;

                // Archive to Summary
                await supabase.from('restaurant_daily_summary').insert({
                    restaurant_id: restaurant.id,
                    business_date: sess.business_date,
                    total_orders: tablesServed, // Tracking enabled tables
                    total_revenue: revenue,
                    closed_at: new Date().toISOString()
                });

                // Close the session
                await supabase
                    .from('restaurant_operational_sessions')
                    .update({ status: 'closed', closed_at: new Date().toISOString() })
                    .eq('id', sess.id);
            }
        }

        // 2. Check/Create Operational Session for TODAY
        const { data: existingSess, error: sessCheckError } = await supabase
            .from('restaurant_operational_sessions')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .eq('business_date', today)
            .single();

        let operationalSessionId = existingSess?.id;

        if (!existingSess) {
            // Start fresh session for the day
            const { data: newSess, error: createError } = await supabase
                .from('restaurant_operational_sessions')
                .insert({
                    restaurant_id: restaurant.id,
                    business_date: today,
                    status: 'active'
                })
                .select('id')
                .single();

            if (createError) throw createError;
            operationalSessionId = newSess.id;
        } else if (existingSess.status === 'closed') {
            // Re-open if closed (Operational preference: Usually we just reactivate or create new if schema allowed)
            const { error: openError } = await supabase
                .from('restaurant_operational_sessions')
                .update({ status: 'active', closed_at: null })
                .eq('id', existingSess.id);

            if (openError) throw openError;
        }

        // 3. LEGACY COMPATIBILITY: Update is_system_open
        await supabase
            .from('restaurants')
            .update({ is_system_open: true })
            .eq('id', restaurant.id);

        return NextResponse.json({
            success: true,
            operationalSessionId,
            message: "Operational session started successfully"
        });
    } catch (error) {
        console.error('Start New Day error', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

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

        const { data: sessions, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map snake_case to camelCase
        const mappedSessions = sessions.map(s => ({
            ...s,
            tableId: s.table_id,
            businessDate: s.business_date,
            totalAmount: s.total_amount,
            createdAt: new Date(s.created_at).getTime(),
            paidAt: s.paid_at ? new Date(s.paid_at).getTime() : undefined,
            orderIds: [] // This would need a junction table or array field in DB
        }));

        return NextResponse.json(mappedSessions);
    } catch (error) {
        console.error('Sessions GET error', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

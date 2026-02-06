import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;
        const { isAcceptingOrders } = await request.json();

        // 1. Resolve Restaurant
        const { data: restaurant, error: resError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('slug', restaurantSlug)
            .single();

        if (resError || !restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        // 2. Toggle Order Acceptance
        const { error: updateError } = await supabase
            .from('restaurants')
            .update({ is_accepting_orders: isAcceptingOrders })
            .eq('id', restaurant.id);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, isAcceptingOrders });
    } catch (error) {
        console.error('Pause Orders error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

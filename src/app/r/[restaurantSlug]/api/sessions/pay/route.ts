import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;
        const body = await request.json();
        const { sessionId } = body;

        const { data, error } = await supabase
            .from('sessions')
            .update({
                status: 'PAID',
                paid_at: new Date().toISOString()
            })
            .eq('id', sessionId)
            .select()
            .single();

        if (error) throw error;

        // Also update associated orders to 'Paid' status
        await supabase
            .from('orders')
            .update({ status: 'Paid' })
            .eq('session_id', sessionId);

        // Emit socket events
        const io = (global as any).io;
        if (io) {
            io.to(restaurantSlug).emit('session_updated', data);
            io.to(restaurantSlug).emit('orders_refresh');
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Session pay error', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

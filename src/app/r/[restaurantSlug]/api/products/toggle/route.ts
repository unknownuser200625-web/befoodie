import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;
        const { id, available } = await request.json();

        if (!id || typeof available !== 'boolean') {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        // Update product availability
        const { data: product, error } = await supabase
            .from('products')
            .update({ available })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Emit socket event for real-time updates
        const io = (global as any).io;
        if (io) io.to(restaurantSlug).emit('products_refresh');

        return NextResponse.json(product);
    } catch (error) {
        console.error('Toggle product error', error);
        return NextResponse.json({ error: 'Failed to toggle product availability' }, { status: 500 });
    }
}

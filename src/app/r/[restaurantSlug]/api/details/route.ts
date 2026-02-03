
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    const { restaurantSlug } = await params;

    const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', restaurantSlug)
        .single();

    if (error || !restaurant) {
        return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    return NextResponse.json(restaurant);
}

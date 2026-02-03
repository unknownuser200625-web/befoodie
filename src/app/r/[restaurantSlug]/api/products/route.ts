import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;

        // Get restaurant ID first
        const { data: restaurant, error: resError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('slug', restaurantSlug)
            .single();

        if (resError || !restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        // Fetch products for this restaurant
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('restaurant_id', restaurant.id);

        if (error) throw error;

        return NextResponse.json(products);
    } catch (error) {
        console.error('Products fetch error', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;
        const body = await request.json();

        const { data: restaurant, error: resError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('slug', restaurantSlug)
            .single();

        if (resError || !restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        const { data, error } = await supabase
            .from('products')
            .insert({ ...body, restaurant_id: restaurant.id })
            .select()
            .single();

        if (error) throw error;

        const io = (global as any).io;
        if (io) io.to(restaurantSlug).emit('products_refresh');

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;
        const body = await request.json();
        const { id, ...updates } = body;

        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        const io = (global as any).io;
        if (io) io.to(restaurantSlug).emit('products_refresh');

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;

        const io = (global as any).io;
        if (io) io.to(restaurantSlug).emit('products_refresh');

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

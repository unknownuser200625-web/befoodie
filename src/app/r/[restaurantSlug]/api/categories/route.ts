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

        const { data: categories, error } = await supabase
            .from('categories')
            .select('name')
            .eq('restaurant_id', restaurant.id)
            .order('order_index', { ascending: true });

        if (error) throw error;

        // Map to string array for frontend compatibility
        return NextResponse.json(categories.map(c => c.name));
    } catch (error) {
        console.error('Categories fetch error', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;
        const { name } = await request.json();

        const { data: restaurant, error: resError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('slug', restaurantSlug)
            .single();

        if (resError || !restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        const { data, error } = await supabase
            .from('categories')
            .insert({ name, restaurant_id: restaurant.id })
            .select()
            .single();

        if (error) throw error;

        const io = (global as any).io;
        if (io) io.to(restaurantSlug).emit('category_update');

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
        const { oldName, newName } = await request.json();

        const { data: restaurant, error: resError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('slug', restaurantSlug)
            .single();

        if (resError || !restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        const { error } = await supabase
            .from('categories')
            .update({ name: newName })
            .eq('restaurant_id', restaurant.id)
            .eq('name', oldName);

        if (error) throw error;

        // Also update products with this category
        await supabase
            .from('products')
            .update({ category: newName })
            .eq('restaurant_id', restaurant.id)
            .eq('category', oldName);

        const io = (global as any).io;
        if (io) {
            io.to(restaurantSlug).emit('category_update');
            io.to(restaurantSlug).emit('products_refresh');
        }

        return NextResponse.json({ success: true });
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
        const name = searchParams.get('name');

        const { data: restaurant, error: resError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('slug', restaurantSlug)
            .single();

        if (resError || !restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('restaurant_id', restaurant.id)
            .eq('name', name);

        if (error) throw error;

        const io = (global as any).io;
        if (io) io.to(restaurantSlug).emit('category_update');

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

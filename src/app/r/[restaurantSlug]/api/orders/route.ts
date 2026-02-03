import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { OrderStatus } from "@/types";

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

        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('restaurant_id', restaurant.id)
            .order('timestamp', { ascending: false });

        if (error) throw error;

        // Map snake_case to camelCase for frontend compatibility
        const mappedOrders = orders.map(ord => ({
            ...ord,
            items: ord.order_items,
            sessionId: ord.session_id,
            tableId: ord.table_id,
            totalPrice: ord.total_price,
        }));

        return NextResponse.json(mappedOrders);
    } catch (error) {
        console.error('Orders GET error', error);
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
        const { tableId, items, totalPrice, sessionId } = body;

        const { data: restaurant, error: resError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('slug', restaurantSlug)
            .single();

        if (resError || !restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        // 1. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                restaurant_id: restaurant.id,
                session_id: sessionId || null,
                table_id: tableId,
                total_price: totalPrice,
                status: 'Pending',
                timestamp: Date.now()
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Create Order Items
        const orderItems = items.map((item: any) => ({
            order_id: order.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // Emit socket event
        const io = (global as any).io;
        if (io) {
            io.to(restaurantSlug).emit('new_order', {
                ...order,
                items,
                sessionId,
                tableId,
                totalPrice
            });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Order creation error', error);
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
        const { id, status } = body;

        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Emit socket event
        const io = (global as any).io;
        if (io) {
            io.to(restaurantSlug).emit('order_updated', data);
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

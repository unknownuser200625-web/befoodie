import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { OrderStatus } from "@/types";
import { getOrCreateTableSession } from "@/lib/services/table-session.service";

export async function GET(
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
        const today = new Date().toISOString().split('T')[0];
        const { data: opsSession, error: opsError } = await supabase
            .from('restaurant_operational_sessions')
            .select('id')
            .eq('restaurant_id', restaurant.id)
            .eq('business_date', today)
            .eq('status', 'active')
            .maybeSingle();

        if (opsError) throw opsError;

        if (!opsSession) {
            return NextResponse.json([]); // No active session, no orders to show for today
        }

        // 3. Fetch Orders linked to this operational session via table_sessions
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, order_items(*), table_sessions!inner(operational_session_id)')
            .eq('restaurant_id', restaurant.id)
            .eq('table_sessions.operational_session_id', opsSession.id)
            .order('timestamp', { ascending: false });

        if (error) throw error;

        // Map snake_case to camelCase for frontend compatibility
        const mappedOrders = orders.map(ord => ({
            ...ord,
            items: ord.order_items,
            tableSessionId: ord.table_session_id,
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
        const { tableId, items, totalPrice } = body;

        const { data: restaurant, error: resError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('slug', restaurantSlug)
            .single();

        if (resError || !restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        // 1. Resolve Table Session (Ensures active operational session exists)
        let tableSessionId;
        try {
            tableSessionId = await getOrCreateTableSession(restaurant.id, tableId);
        } catch (e: any) {
            return NextResponse.json({ error: e.message || "Session error" }, { status: 403 });
        }

        // 2. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                restaurant_id: restaurant.id,
                table_session_id: tableSessionId,
                table_id: tableId,
                total_price: totalPrice,
                status: 'Pending',
                timestamp: Date.now()
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 3. Create Order Items
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
                tableId,
                totalPrice,
                tableSessionId
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

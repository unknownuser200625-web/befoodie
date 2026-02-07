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

        // 2. Fetch Active Orders via RPC
        const { data: orders, error: rpcError } = await supabase
            .rpc('get_kitchen_orders', {
                p_restaurant_id: restaurant.id
            });

        if (rpcError) {
            console.error('[ORDERS GET] RPC Error:', rpcError);
            return NextResponse.json([]); // Return empty on error to prevent UI crash
        }

        // 3. Map to Frontend Model
        const mappedOrders = orders?.map((ord: any) => ({
            id: ord.order_id, // Map order_id -> id
            tableId: ord.table_id,
            totalPrice: ord.total_price,
            status: ord.status,
            timestamp: new Date(ord.created_at).getTime(), // Convert to timestamp
            businessDate: ord.business_date,
            items: ord.items // JSONB array is already compatible
        })) || [];

        console.log('[ORDERS GET] Fetched orders count:', mappedOrders.length);

        return NextResponse.json(mappedOrders);
    } catch (error) {
        console.error('[ORDERS GET] Critical error:', error);
        return NextResponse.json([]);
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

        console.log('[ORDER RPC] Starting order placement for table:', tableId);

        // 1. Resolve Restaurant ID
        const { data: restaurant, error: resError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('slug', restaurantSlug)
            .single();

        if (resError || !restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        // 2. Call Atomic RPC
        const { data: orderData, error: rpcError } = await supabase
            .rpc('place_restaurant_order', {
                p_restaurant_id: restaurant.id,
                p_table_id: tableId,
                p_order_items: items,
                p_total_price: totalPrice
            });

        if (rpcError) {
            console.error('[ORDER RPC] RPC Failed:', rpcError);
            // Handle specific user-facing errors from RPC triggers/exceptions
            if (rpcError.message.includes('Restaurant is closed') || rpcError.message.includes('not currently accepting')) {
                return NextResponse.json({ error: rpcError.message }, { status: 403 });
            }
            return NextResponse.json({ error: 'Order placement failed' }, { status: 500 });
        }

        console.log('[ORDER RPC] Success:', orderData);

        // 3. Emit Socket Event (Legacy support for UI updates)
        // We construct the full object because RPC returns minimal data, 
        // but UI expects full item details immediately.
        const fullOrder = {
            ...orderData,
            restaurant_id: restaurant.id,
            table_id: tableId,
            total_price: totalPrice,
            items: items, // Attach items for UI
            timestamp: Date.now()
        };

        const io = (global as any).io;
        if (io) {
            io.to(restaurantSlug).emit('new_order', {
                ...fullOrder,
                tableSessionId: null // Legacy field, not needed by UI if strictly using order data
            });
        }

        return NextResponse.json(fullOrder);

    } catch (error) {
        console.error('Order creation critical error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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

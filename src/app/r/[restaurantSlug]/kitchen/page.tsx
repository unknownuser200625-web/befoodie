'use client';

import { Header } from '@/components/ui/Header';
import { Order, OrderStatus, Restaurant } from '@/types';
import { useEffect, useState, useRef, use } from 'react';
import { Utensils, Clock, CheckCircle, Flame, Bell, BellOff, LogOut, LayoutDashboard } from 'lucide-react';
import { io } from 'socket.io-client';
import { formatOrderTime, getOrderUrgency, getUrgencyStyles } from '@/lib/timeFormatter';

export default function KitchenPage({
    params,
}: {
    params: Promise<{ restaurantSlug: string }>;
}) {
    const { restaurantSlug } = use(params);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [now, setNow] = useState<number>(Date.now());
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const alarmRef = useRef<HTMLAudioElement | null>(null);

    // Auth check
    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch(`/r/${restaurantSlug}/api/auth/status`);
            const data = await res.json();
            if (!data.authenticated) {
                window.location.href = `/r/${restaurantSlug}/admin/login`;
            } else {
                setRole(data.role);
            }
        };
        checkAuth();
    }, [restaurantSlug]);

    // Fetch Restaurant Details
    useEffect(() => {
        fetch(`/r/${restaurantSlug}/api/details`)
            .then(res => res.json())
            .then(data => setRestaurant(data))
            .catch(err => console.error('Failed to fetch restaurant', err));
    }, [restaurantSlug]);

    // Time Update Interval (every 10 seconds for urgency colors)
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 10000);
        return () => clearInterval(interval);
    }, []);

    // Fetch current session ID
    useEffect(() => {
        fetch(`/r/${restaurantSlug}/api/business-date`)
            .then(res => res.json())
            .then(data => setCurrentSessionId(data.date))
            .catch(err => console.error('Failed to fetch session ID', err));
    }, [restaurantSlug]);

    // Data & Socket logic
    useEffect(() => {
        fetch(`/r/${restaurantSlug}/api/orders`)
            .then(res => res.json())
            .then(setOrders);

        const socket = io({
            query: { restaurantSlug }
        });

        socket.on('new_order', (newOrder: Order) => {
            // Only add if it belongs to this restaurant (assuming restaurant_id is in order)
            // For now, if no restaurant_id, we assume demo
            setOrders(prev => [newOrder, ...prev]);
        });

        socket.on('day_reset', () => {
            setOrders([]);
        });

        socket.on('session_reset', () => {
            setOrders([]);
            fetch(`/r/${restaurantSlug}/api/business-date`)
                .then(res => res.json())
                .then(data => setCurrentSessionId(data.date));
        });

        socket.on('orders_refresh', () => {
            fetch(`/r/${restaurantSlug}/api/orders`).then(r => r.json()).then(setOrders);
        });

        socket.on('order_updated', (updated: Order) => {
            setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
        });

        return () => { socket.disconnect(); };
    }, [restaurantSlug]);

    // Alarm Logic
    useEffect(() => {
        const hasPending = orders.some(o => o.status === 'Pending');

        if (hasPending && audioEnabled) {
            if (!alarmRef.current) {
                alarmRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                alarmRef.current.loop = true;
            }
            alarmRef.current.play().catch(e => console.log('Audio play blocked', e));
        } else {
            if (alarmRef.current) {
                alarmRef.current.pause();
                alarmRef.current.currentTime = 0;
            }
        }
    }, [orders, audioEnabled]);

    const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await fetch(`/r/${restaurantSlug}/api/orders`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, status: newStatus })
            });
        } catch (err) {
            console.error('Update failed', err);
        }
    };

    const activeStatuses = ['Pending', 'Accepted', 'Ready'];

    const activeOrders = orders
        .filter(o => activeStatuses.includes(o.status))
        .filter(o => !currentSessionId || o.businessDate === currentSessionId)
        .sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Header restaurantName={restaurant?.name} restaurantSlug={restaurantSlug} />
            <main className="pt-24 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-4 uppercase italic">
                            <Utensils className="text-primary w-10 h-10" />
                            KITCHEN VIEW
                        </h1>
                        <span className="text-[10px] font-black bg-white/5 border border-white/10 px-2 py-1 rounded text-primary uppercase">
                            {role === 'owner' ? 'MASTER' : 'STAFF'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setAudioEnabled(!audioEnabled)}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${audioEnabled ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}
                        >
                            {audioEnabled ? <Bell className="w-5 h-5 animate-bounce" /> : <BellOff className="w-5 h-5" />}
                            {audioEnabled ? 'ALARM ON' : 'ENABLE ALARM'}
                        </button>

                        {role === 'owner' && (
                            <button
                                onClick={() => window.location.href = `/r/${restaurantSlug}/admin`}
                                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-6 py-4 rounded-2xl font-black transition-all border border-blue-500/10 text-xs flex items-center gap-2"
                            >
                                <LayoutDashboard size={16} /> ADMIN
                            </button>
                        )}

                        <button
                            onClick={async () => {
                                await fetch(`/r/${restaurantSlug}/api/auth/logout`, { method: 'POST' });
                                window.location.href = `/r/${restaurantSlug}/admin/login`;
                            }}
                            className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-6 py-4 rounded-2xl font-black transition-all border border-white/5 text-xs flex items-center gap-2"
                        >
                            <LogOut size={16} /> LOGOUT
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {activeOrders.map((order) => {
                        const urgency = getOrderUrgency(order.timestamp);
                        const urgencyStyles = order.status === 'Ready' ? 'border-gray-700 opacity-60' : getUrgencyStyles(urgency);

                        return (
                            <div
                                key={order.id}
                                className={`bg-[#181818] rounded-2xl p-6 border-2 transition-all flex flex-col ${urgencyStyles}`}
                            >
                                <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-3xl font-black tracking-tighter">TABLE {order.tableId}</h3>
                                            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${order.status === 'Pending' ? 'bg-red-500 text-white animate-pulse' : order.status === 'Ready' ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400 mt-2 font-medium">
                                            <Clock className="w-4 h-4" />
                                            {formatOrderTime(order.timestamp)}
                                            <span className="mx-2 text-white/10">|</span>
                                            <span className="text-xs uppercase opacity-50">#{order.id.slice(-4)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1 mb-8">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-start group">
                                            <div className="flex gap-4 items-start">
                                                <span className="bg-primary/20 text-primary w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0">
                                                    {item.quantity}
                                                </span>
                                                <span className="text-lg font-bold text-gray-200">
                                                    {item.name}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    {order.status === 'Pending' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'Accepted')}
                                            className="flex-1 bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                        >
                                            <Flame className="w-5 h-5" /> ACCEPT
                                        </button>
                                    )}
                                    {order.status === 'Accepted' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'Ready')}
                                            className="flex-1 bg-green-500 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                                        >
                                            <CheckCircle className="w-5 h-5" /> MARK READY
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {activeOrders.length === 0 && (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                            <Utensils className="w-20 h-20 text-white/10 mb-6" />
                            <h2 className="text-2xl font-bold text-gray-500">NO ACTIVE ORDERS</h2>
                            <p className="text-gray-600">The kitchen is all caught up!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

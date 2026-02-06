'use client';

import Link from 'next/link';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { LayoutDashboard, UtensilsCrossed, Package, Tag, Receipt, CheckCircle, Clock, X, Flame, Shield, QrCode } from 'lucide-react';
import { useEffect, useState, use } from 'react';
import { io } from 'socket.io-client';
import { TableSession, Order, Restaurant } from '@/types';
import { LiveStatus } from '@/components/ui/LiveStatus';

export default function AdminHub({
    params,
}: {
    params: Promise<{ restaurantSlug: string }>;
}) {
    const { restaurantSlug } = use(params);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [sessions, setSessions] = useState<TableSession[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<TableSession | null>(null);
    const [auth, setAuth] = useState<{ authenticated: boolean; role: string | null } | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch(`/r/${restaurantSlug}/api/auth/status`);
            const data = await res.json();
            setAuth(data);
            if (!data.authenticated || data.role !== 'owner') {
                window.location.href = `/r/${restaurantSlug}/admin/login`;
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sessRef = await fetch(`/r/${restaurantSlug}/api/sessions`);
                if (!sessRef.ok) throw new Error('Failed to fetch sessions');
                setSessions(await sessRef.json());

                const ordRef = await fetch(`/r/${restaurantSlug}/api/orders`);
                if (!ordRef.ok) throw new Error('Failed to fetch orders');
                setOrders(await ordRef.json());

                setLoading(false);
            } catch (e) {
                if (e instanceof Error) {
                    console.error('Fetch failed:', e.message);
                } else {
                    console.error('Fetch failed:', e);
                }
                setLoading(false);
            }
        };

        fetchData();

        const socket = io({
            query: { restaurantSlug }
        });
        socket.on('session_updated', (updated: TableSession) => {
            setSessions(prev => {
                const existing = prev.find(s => s.id === updated.id);
                if (existing) return prev.map(s => s.id === updated.id ? updated : s);
                return [...prev, updated];
            });
            if (selectedSession?.id === updated.id) setSelectedSession(updated);
        });

        socket.on('new_order', () => {
            fetch(`/r/${restaurantSlug}/api/sessions`).then(r => r.json()).then(setSessions);
            fetch(`/r/${restaurantSlug}/api/orders`).then(r => r.json()).then(setOrders);
        });

        socket.on('orders_refresh', () => {
            fetch(`/r/${restaurantSlug}/api/orders`).then(r => r.json()).then(setOrders);
        });

        return () => { socket.disconnect(); };
    }, [selectedSession]);

    const activeSessions = sessions.filter(s => s.status === 'OPEN');

    const markPaid = async (sessionId: string) => {
        if (!confirm('Are you sure you want to mark this table as paid and close the session?')) return;
        try {
            const res = await fetch(`/r/${restaurantSlug}/api/sessions/pay`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });
            if (res.ok) {
                setSelectedSession(null);
                fetch(`/r/${restaurantSlug}/api/sessions`).then(r => r.json()).then(setSessions);
            }
        } catch (err) {
            if (err instanceof Error) {
                console.error('Mark paid failed:', err.message);
            } else {
                console.error('Mark paid failed:', err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Header restaurantName={restaurant?.name} restaurantSlug={restaurantSlug} />
            <main className="pt-24 px-6 max-w-6xl mx-auto pb-20">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3 uppercase italic">
                        <LayoutDashboard className="text-primary w-10 h-10" />
                        ADMIN HUB
                        <span className="text-[10px] font-black bg-white/5 border border-white/10 px-2 py-1 rounded text-primary uppercase ml-2 italic">MASTER</span>
                    </h1>
                    <button
                        onClick={async () => {
                            await fetch(`/r/${restaurantSlug}/api/auth/logout`, { method: 'POST' });
                            window.location.href = `/r/${restaurantSlug}/admin/login`;
                        }}
                        className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-4 py-2 rounded-xl text-xs font-black transition-all border border-white/5 flex items-center gap-2"
                    >
                        <X size={14} /> LOGOUT
                    </button>
                </div>

                {/* Quick Navigation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <Link href={`/r/${restaurantSlug}/kitchen`} className="bg-[#181818] p-6 rounded-2xl border border-white/5 hover:border-blue-500/50 transition-all flex items-center gap-4 group">
                        <div className="p-4 bg-blue-500/20 rounded-xl text-blue-400">
                            <UtensilsCrossed size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Kitchen View</h2>
                            <p className="text-xs text-gray-500">Live order prep</p>
                        </div>
                    </Link>

                    <Link href={`/r/${restaurantSlug}/admin/products`} className="bg-[#181818] p-6 rounded-2xl border border-white/5 hover:border-purple-500/50 transition-all flex items-center gap-4 group">
                        <div className="p-4 bg-purple-500/20 rounded-xl text-purple-400">
                            <Package size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Products</h2>
                            <p className="text-xs text-gray-500">Menu & Prices</p>
                        </div>
                    </Link>

                    <Link href={`/r/${restaurantSlug}/admin/categories`} className="bg-[#181818] p-6 rounded-2xl border border-white/5 hover:border-orange-500/50 transition-all flex items-center gap-4 group">
                        <div className="p-4 bg-orange-500/20 rounded-xl text-orange-400">
                            <Tag size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Categories</h2>
                            <p className="text-xs text-gray-500">Organize menu</p>
                        </div>
                    </Link>

                    <Link href={`/r/${restaurantSlug}/admin/settings/security`} className="bg-[#181818] p-6 rounded-2xl border border-white/5 hover:border-amber-500/50 transition-all flex items-center gap-4 group">
                        <div className="p-4 bg-amber-500/20 rounded-xl text-amber-400">
                            <Shield size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Security</h2>
                            <p className="text-xs text-gray-500">Master Password & PIN</p>
                        </div>
                    </Link>

                    <Link href={`/r/${restaurantSlug}/admin/qr`} className="bg-[#181818] p-6 rounded-2xl border border-white/5 hover:border-cyan-500/50 transition-all flex items-center gap-4 group">
                        <div className="p-4 bg-cyan-500/20 rounded-xl text-cyan-400">
                            <QrCode size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">QR Codes</h2>
                            <p className="text-xs text-gray-500">Table & Menu Links</p>
                        </div>
                    </Link>
                </div>

                {/* Day Management & Hard Controls */}
                <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 mb-16">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 text-primary font-bold mb-1 uppercase tracking-widest text-xs">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                Live Business Date
                            </div>
                            <h2 className="text-4xl font-black">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
                            <p className="text-gray-500 text-sm mt-1">Sessions and orders are tracked per business day.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            {/* Pause Orders Toggle */}
                            <button
                                onClick={async () => {
                                    const nextState = !restaurant?.is_accepting_orders;
                                    const res = await fetch(`/r/${restaurantSlug}/api/admin/pause-orders`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ isAcceptingOrders: nextState })
                                    });
                                    if (res.ok) {
                                        setRestaurant(prev => prev ? { ...prev, is_accepting_orders: nextState } : null);
                                    }
                                }}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all border ${restaurant?.is_accepting_orders
                                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
                                    : 'bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/20'
                                    }`}
                            >
                                <Flame size={20} className={restaurant?.is_accepting_orders ? '' : 'animate-pulse'} />
                                {restaurant?.is_accepting_orders ? 'PAUSE ORDERS' : 'RESUME ORDERS'}
                            </button>

                            <Link href={`/r/${restaurantSlug}/admin/history`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-2xl font-bold transition-all border border-white/10">
                                <Clock size={20} /> History
                            </Link>

                            <button
                                onClick={async () => {
                                    if (confirm('CLOSE BUSINESS DAY?\n\nThis will:\n1. Settlement: Aggregates all paid orders\n2. Security: Logouts all staff devices\n3. Finality: Archive data to History\n4. NEW: Reset operational status to CLOSED\n\nARE YOU SURE?')) {
                                        const res = await fetch(`/r/${restaurantSlug}/api/admin/close-day`, { method: 'POST' });
                                        if (res.ok) {
                                            alert("Day Closed Successfully. Redirecting to History.");
                                            window.location.href = `/r/${restaurantSlug}/admin/history`;
                                        }
                                    }
                                }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-xl shadow-rose-950/20 border border-rose-500/50"
                            >
                                <CheckCircle size={20} /> CLOSE DAY
                            </button>
                        </div>
                    </div>

                    {/* Quick Warning if Paused */}
                    {!restaurant?.is_accepting_orders && (
                        <div className="mt-6 p-4 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-amber-500">
                            <Flame size={18} className="shrink-0" />
                            <p className="text-sm font-bold">ORDERS ARE CURRENTLY PAUSED. Customers will see a "Temporarily Unavailable" message on the menu.</p>
                        </div>
                    )}
                </div>

                {/* Session Dashboard */}
                <section>
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <Receipt className="text-primary" />
                        ACTIVE BILLING
                        <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-black ml-2">
                            {activeSessions.length} TABLES OPEN
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activeSessions.map((session) => (
                            <div key={session.id} className="bg-[#181818] rounded-2xl p-6 border-2 border-primary/20 shadow-xl overflow-hidden relative group transition-all hover:scale-[1.02]">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Receipt size={80} />
                                </div>

                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-3xl font-black tracking-tighter">TABLE {session.tableId}</h3>
                                        <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                                            <Clock size={14} />
                                            Active for {Math.floor((Date.now() - session.createdAt) / 60000)}m
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-primary">₹{session.totalAmount.toFixed(2)}</span>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{session.orderIds.length} Orders</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <button
                                        onClick={() => setSelectedSession(session)}
                                        className="bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/5"
                                    >
                                        <Receipt size={16} /> VIEW BILL
                                    </button>
                                    <button
                                        onClick={() => markPaid(session.id)}
                                        className="bg-green-500/10 hover:bg-green-500/20 text-green-400 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-green-500/20"
                                    >
                                        <CheckCircle size={16} /> PAID
                                    </button>
                                </div>
                            </div>
                        ))}

                        {activeSessions.length === 0 && !loading && (
                            <div className="col-span-full py-20 text-center bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                                <Receipt className="mx-auto mb-4 opacity-10" size={64} />
                                <h3 className="text-xl font-bold text-gray-500">NO BUSY TABLES</h3>
                                <p className="text-gray-600">All sessions are closed.</p>
                            </div>
                        )}

                        {loading && (
                            <div className="col-span-full py-20 text-center">
                                <p className="text-gray-500 animate-pulse">Loading active sessions...</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Bill Modal */}
                {selectedSession && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <div className="bg-white text-black w-full max-w-md rounded-3xl overflow-hidden shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200">
                            <div className="p-8 pb-4">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tighter uppercase italic">{restaurant?.name || 'BEFOODIE'}</h2>
                                        <p className="text-[10px] uppercase tracking-widest font-black opacity-40">Midnight Premium Dining</p>
                                    </div>
                                    <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="border-y border-dashed border-black/10 py-4 mb-6">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
                                        <span>Table {selectedSession.tableId}</span>
                                        <span>{new Date(selectedSession.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-[10px] font-mono opacity-40 uppercase">Session: {selectedSession.id.slice(-8)}</p>
                                </div>

                                <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar-light">
                                    {orders.filter(o => o.sessionId === selectedSession.id).map(order => (
                                        <div key={order.id} className="border-b border-black/5 pb-4 last:border-0 last:pb-0">
                                            <div className="flex justify-between font-bold text-sm mb-2">
                                                <span className="opacity-40 text-xs uppercase tracking-widest">Order #{order.id.slice(-4)}</span>
                                                <span>₹{order.totalPrice.toFixed(2)}</span>
                                            </div>
                                            <div className="space-y-1">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span>{item.quantity}x {item.name}</span>
                                                        <span className="opacity-40 font-mono">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-black/5 p-6 rounded-2xl mb-8">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-black uppercase tracking-widest opacity-40">Grand Total</span>
                                        <span className="text-4xl font-black tracking-tighter">₹{selectedSession.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => markPaid(selectedSession.id)}
                                    className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg hover:bg-gray-900 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-black/20"
                                >
                                    <CheckCircle size={24} /> SETTLE & CLOSE TABLE
                                </button>
                                <p className="text-center text-[10px] font-bold opacity-30 mt-6 uppercase tracking-[0.2em]">Thank you for dining with us</p>
                            </div>
                            <div className="h-4 bg-black/5 w-full flex overflow-hidden">
                                {Array(20).fill(0).map((_, i) => (
                                    <div key={i} className="min-w-[20px] h-full rotate-45 bg-white translate-y-2 translate-x--2" />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

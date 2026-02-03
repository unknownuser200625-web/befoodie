'use client';

import { Header } from '@/components/ui/Header';
import { DailyHistory } from '@/types';
import { ArrowLeft, Calendar, IndianRupee, ShoppingBag, Receipt, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { safeFetch } from '@/lib/api';

export default function HistoryPage() {
    const [history, setHistory] = useState<DailyHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<DailyHistory | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const result = await safeFetch('/api/auth/status');
            if (result.ok && result.data) {
                if (!result.data.authenticated || result.data.role !== 'owner') {
                    window.location.href = '/admin/login';
                }
            }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        const loadHistory = async () => {
            const result = await safeFetch('/api/history');
            if (result.ok && Array.isArray(result.data)) {
                setHistory(result.data.reverse());
            } else {
                console.error('History load failed', result.error);
            }
            setLoading(false);
        };
        loadHistory();
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Header />
            <main className="pt-24 px-6 max-w-5xl mx-auto pb-20">
                <div className="flex items-center gap-4 mb-10">
                    <Link href="/admin" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                        <ArrowLeft />
                    </Link>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <Calendar className="text-primary w-10 h-10" />
                        ORDER HISTORY
                    </h1>
                </div>

                {loading ? (
                    <div className="py-20 text-center animate-pulse text-gray-500">Loading archives...</div>
                ) : history.length === 0 ? (
                    <div className="py-20 text-center bg-white/5 rounded-3xl border-2 border-dashed border-white/10">
                        <Calendar className="mx-auto mb-4 opacity-10" size={64} />
                        <h3 className="text-xl font-bold text-gray-500">NO HISTORY YET</h3>
                        <p className="text-gray-600">Archived data will appear here after a "Start New Day" reset.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {history.map((day) => (
                            <div
                                key={day.date}
                                onClick={() => setSelectedDay(day)}
                                className="bg-[#181818] p-6 rounded-2xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-primary/10 rounded-2xl text-primary font-black text-center min-w-[100px]">
                                        <div className="text-[10px] uppercase opacity-60">Day</div>
                                        <div className="text-xl">{day.date.split('-')[2]}</div>
                                        <div className="text-[10px] uppercase opacity-60">{new Date(day.date).toLocaleString('default', { month: 'short' })}</div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{new Date(day.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <ShoppingBag size={12} /> {day.totalOrders} Orders
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <IndianRupee size={12} /> {day.totalRevenue.toFixed(0)} Revenue
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="text-gray-600 group-hover:text-primary transition-colors" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Single Day Detail Modal */}
                {selectedDay && (
                    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <div className="bg-[#121212] w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden border border-white/10 flex flex-col">
                            <div className="p-8 border-b border-white/10 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">Day Archive: {selectedDay.date}</h2>
                                    <div className="flex gap-4 mt-1 text-xs text-gray-400">
                                        <span>Total Revenue: ₹{selectedDay.totalRevenue.toFixed(2)}</span>
                                        <span>•</span>
                                        <span>Total Orders: {selectedDay.totalOrders}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 grid md:grid-cols-2 gap-8">
                                {/* Sessions Column */}
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 px-2">Finalized Sessions</h4>
                                    <div className="space-y-4">
                                        {selectedDay.sessions.map((session) => (
                                            <div key={session.id} className="bg-white/5 border border-white/5 p-5 rounded-2xl">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="text-lg font-black tracking-tight">Table {session.tableId}</span>
                                                    <span className="text-primary font-bold">₹{session.totalAmount.toFixed(2)}</span>
                                                </div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">
                                                    Session Ends: {new Date(session.paidAt!).toLocaleTimeString()}
                                                </div>
                                                <div className="space-y-1">
                                                    {selectedDay.orders.filter(o => o.sessionId === session.id).map(order => (
                                                        <div key={order.id} className="text-xs text-gray-400 flex justify-between">
                                                            <span>#{order.id.slice(-4)} • {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Summary Stats Column */}
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4 px-2">Archive Summary</h4>
                                    <div className="bg-primary/5 border border-primary/20 p-8 rounded-3xl h-full">
                                        <div className="space-y-8">
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Closed At</div>
                                                <div className="text-xl font-bold">{new Date(selectedDay.closedAt).toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Day Performance</div>
                                                <div className="text-5xl font-black text-primary tracking-tighter">₹{selectedDay.totalRevenue.toFixed(0)}</div>
                                                <p className="text-xs text-gray-400 mt-2">Calculated from all sessions closed during this business period.</p>
                                            </div>
                                            <div className="pt-8 border-t border-primary/10">
                                                <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4 text-center">Business Recap</div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-black">{selectedDay.sessions.length}</div>
                                                        <div className="text-[8px] uppercase tracking-widest opacity-40">Tables</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-black">{selectedDay.totalOrders}</div>
                                                        <div className="text-[8px] uppercase tracking-widest opacity-40">Orders</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

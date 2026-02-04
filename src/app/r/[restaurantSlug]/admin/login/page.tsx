'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Lock, ShieldCheck, User, Key, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Header } from '@/components/ui/Header';
import { safeFetch } from '@/lib/api';
import { Restaurant } from '@/types';

export default function LoginPage() {
    const params = useParams();
    const restaurantSlug = params?.restaurantSlug as string;
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [type, setType] = useState<'owner' | 'staff'>('owner');
    const [credential, setCredential] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ authenticated: boolean; role: string | null; isSystemOpen: boolean } | null>(null);
    const router = useRouter();

    // Fetch Restaurant Details
    useEffect(() => {
        fetch(`/r/${restaurantSlug}/api/details`)
            .then(res => res.json())
            .then(data => setRestaurant(data))
            .catch(err => console.error('Failed to fetch restaurant', err));
    }, [restaurantSlug]);

    useEffect(() => {
        const check = async () => {
            const result = await safeFetch(`/r/${restaurantSlug}/api/auth/status`);
            if (result.ok && result.data) {
                setStatus(result.data);
                if (result.data.authenticated) {
                    router.push(result.data.role === 'owner' ? `/r/${restaurantSlug}/admin` : `/r/${restaurantSlug}/kitchen`);
                }
            }
        };
        check();
    }, [router, restaurantSlug]);

    const handleTypeSwitch = (newType: 'owner' | 'staff') => {
        setType(newType);
        setCredential('');
        setError('');
        setShowPassword(false);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!credential) {
            setError('Please enter your credentials');
            return;
        }

        setLoading(true);
        setError('');

        if (!restaurantSlug) {
            setError('Invalid restaurant workspace');
            setLoading(false);
            return;
        }

        try {
            const body = type === 'owner'
                ? { role: 'owner', password: credential }
                : { role: 'staff', pin: credential };

            const result = await safeFetch(`/r/${restaurantSlug}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (result.ok) {
                router.push(type === 'owner' ? `/r/${restaurantSlug}/admin` : `/r/${restaurantSlug}/kitchen`);
                router.refresh();
            } else {
                setError(result.data?.error || result.error || 'Login failed');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
            <Header restaurantName={restaurant?.name} restaurantSlug={restaurantSlug} />

            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="bg-[#121212] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <div className="flex justify-center mb-8">
                                <div className="p-4 bg-primary/10 rounded-2xl">
                                    <ShieldCheck size={48} className="text-primary" />
                                </div>
                            </div>

                            <h1 className="text-3xl font-black text-center mb-2 tracking-tighter uppercase italic">{restaurant?.name || 'BEFOODIE'} SECURE</h1>
                            <p className="text-center text-gray-400 text-sm mb-10">Restricted access for authorized personnel only.</p>

                            <div className="flex bg-white/5 p-1 rounded-xl mb-8 border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => handleTypeSwitch('owner')}
                                    className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${type === 'owner' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <Lock size={16} /> OWNER
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTypeSwitch('staff')}
                                    className={`flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${type === 'staff' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <User size={16} /> STAFF
                                </button>
                            </div>

                            {type === 'staff' && status && !status.isSystemOpen && (
                                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6 flex items-start gap-3">
                                    <AlertCircle className="text-red-500 shrink-0" size={18} />
                                    <p className="text-xs text-red-200 leading-relaxed font-bold">
                                        SYSTEM CLOSED. Kitchen login is disabled until the Owner opens the restaurant for the day.
                                    </p>
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 px-1">
                                        {type === 'owner' ? 'Master Password' : 'Staff PIN'}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                                            <Key size={18} />
                                        </div>
                                        <input
                                            id={type === 'owner' ? 'owner-auth-field' : 'staff-auth-field'}
                                            name={type === 'owner' ? 'owner-auth-field' : 'staff-auth-field'}
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder={type === 'owner' ? '••••••••' : '4-Digit PIN'}
                                            value={credential}
                                            onChange={(e) => setCredential(e.target.value)}
                                            required
                                            disabled={!!(type === 'staff' && status && !status.isSystemOpen)}
                                            autoComplete="new-password"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 focus:border-primary/50 focus:outline-none transition-colors font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="text-red-500 text-xs font-bold text-center bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || !!(type === 'staff' && status && !status.isSystemOpen)}
                                    className="w-full bg-primary hover:bg-red-700 disabled:opacity-30 disabled:hover:bg-primary text-white py-4 rounded-xl font-black transition-all shadow-xl shadow-red-950/20 active:scale-95"
                                >
                                    {loading ? 'AUTHENTICATING...' : 'ACCESS DASHBOARD'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <button
                        onClick={() => router.push(`/r/${restaurantSlug}/menu/1`)}
                        className="w-full mt-8 py-4 text-xs font-black text-gray-500 hover:text-primary transition-all tracking-[0.2em]"
                    >
                        ← BACK TO PUBLIC MENU
                    </button>
                </div>
            </main>
        </div>
    );
}

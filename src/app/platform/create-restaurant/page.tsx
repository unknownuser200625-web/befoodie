'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateRestaurantPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        password: '',
        pin: '1234',
        food_policy: 'MIXED' as 'PURE_VEG' | 'PURE_NON_VEG' | 'MIXED'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Auto-generate slug from name if slug is empty
            if (name === 'name' && !prev.slug) {
                newData.slug = value.toLowerCase()
                    .replace(/[^a-z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
            }
            return newData;
        });
    };

    if (!mounted) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/platform/create-restaurant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create restaurant');
            }

            setSuccess('Restaurant created successfully! Redirecting...');
            setTimeout(() => {
                router.push(`/r/${data.restaurant.slug}/admin/login`);
            }, 2000);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-neutral-800 rounded-2xl shadow-xl p-8 border border-neutral-700">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">BeFoodie Platform</h1>
                    <p className="text-neutral-400">Create your restaurant workspace</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Restaurant Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                            placeholder="e.g. Tasty Bites"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Food Policy * <span className="text-xs text-neutral-500">(Cannot be changed later)</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, food_policy: 'PURE_VEG' })}
                                className={`p-4 border-2 rounded-xl transition-all text-center ${formData.food_policy === 'PURE_VEG'
                                        ? 'border-green-500 bg-green-500/10'
                                        : 'border-neutral-700 bg-neutral-900 hover:border-neutral-600'
                                    }`}
                            >
                                <div className="text-3xl mb-2">🟢</div>
                                <div className="text-xs font-bold text-white">Pure Veg</div>
                                <div className="text-[10px] text-neutral-400 mt-1">Only veg items</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, food_policy: 'MIXED' })}
                                className={`p-4 border-2 rounded-xl transition-all text-center ${formData.food_policy === 'MIXED'
                                        ? 'border-amber-500 bg-amber-500/10'
                                        : 'border-neutral-700 bg-neutral-900 hover:border-neutral-600'
                                    }`}
                            >
                                <div className="text-3xl mb-2">🟢🔴</div>
                                <div className="text-xs font-bold text-white">Mixed</div>
                                <div className="text-[10px] text-neutral-400 mt-1">All types</div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, food_policy: 'PURE_NON_VEG' })}
                                className={`p-4 border-2 rounded-xl transition-all text-center ${formData.food_policy === 'PURE_NON_VEG'
                                        ? 'border-red-500 bg-red-500/10'
                                        : 'border-neutral-700 bg-neutral-900 hover:border-neutral-600'
                                    }`}
                            >
                                <div className="text-3xl mb-2">🔴</div>
                                <div className="text-xs font-bold text-white">Non-Veg</div>
                                <div className="text-[10px] text-neutral-400 mt-1">All types</div>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            URL Slug (Unique ID)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-3 text-neutral-500">/r/</span>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                required
                                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                                placeholder="tasty-bites"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Owner Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Staff PIN (Default)
                        </label>
                        <input
                            type="text"
                            name="pin"
                            value={formData.pin}
                            onChange={handleChange}
                            required
                            maxLength={6}
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                            placeholder="1234"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating...' : 'Launch Restaurant'}
                    </button>
                </form>
            </div>
        </div>
    );
}

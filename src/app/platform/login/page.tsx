'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function PlatformLoginPage() {
    const [slug, setSlug] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (slug.trim()) {
            router.push(`/r/${slug.toLowerCase().trim()}/admin/login`);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 italic uppercase">
            <Link href="/" className="mb-12 text-2xl font-black text-primary tracking-tighter hover:scale-105 transition-transform">
                BEFOODIE
            </Link>

            <div className="w-full max-w-md bg-[#181818] rounded-3xl p-8 border border-white/5 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-primary/20 rounded-xl text-primary">
                        <LayoutDashboard size={24} />
                    </div>
                    <h1 className="text-2xl font-black">Admin Access</h1>
                </div>

                <p className="text-gray-500 text-xs font-bold mb-8 tracking-widest leading-loose">
                    Enter your restaurant ID (slug) to proceed to your secure dashboard.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group">
                        <label className="block text-[10px] text-gray-600 font-black mb-2 tracking-[0.2em]">
                            RESTAURANT SLUG
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold text-sm">/r/</span>
                            <input
                                required
                                type="text"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                placeholder="my-restaurant"
                                className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-10 pr-4 text-white placeholder-gray-800 outline-none focus:border-primary transition-all font-bold"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-red-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-950/20 active:scale-95"
                    >
                        CONTINUE TO LOGIN
                        <ArrowRight size={20} />
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="text-[10px] text-gray-600 font-bold mb-4 tracking-widest">Forgot your slug?</p>
                    <Link href="/platform/create-restaurant" className="text-[10px] text-primary hover:text-white font-black transition-colors tracking-[0.2em]">
                        + CREATE NEW WORKSPACE
                    </Link>
                </div>
            </div>

            <Link href="/demo" className="mt-12 text-[10px] text-gray-700 hover:text-white font-black transition-colors tracking-widest">
                BACK TO DEMO
            </Link>
        </div>
    );
}

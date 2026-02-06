'use client';

import { use } from 'react';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { QRGenerator } from '@/components/admin/QRGenerator';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Restaurant } from '@/types';

export default function QRPage({
    params,
}: {
    params: Promise<{ restaurantSlug: string }>;
}) {
    const { restaurantSlug } = use(params);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

    useEffect(() => {
        fetch(`/r/${restaurantSlug}/api/details`)
            .then(res => res.json())
            .then(data => setRestaurant(data));
    }, [restaurantSlug]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Header restaurantName={restaurant?.name} restaurantSlug={restaurantSlug} />
            <main className="pt-24 px-6 max-w-4xl mx-auto pb-20">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 uppercase italic">
                        QR GENERATOR
                    </h1>
                    <Link
                        href={`/r/${restaurantSlug}/admin`}
                        className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-black transition-all border border-white/5 flex items-center gap-2"
                    >
                        <LayoutDashboard size={14} /> ADMIN HUB
                    </Link>
                </div>

                <div className="bg-[#181818] p-8 rounded-3xl border border-white/5">
                    <p className="text-gray-400 mb-8 border-b border-white/5 pb-8">
                        Generate and download QR codes for your tables. Customers scan these to access the menu and order directly.
                    </p>
                    <QRGenerator restaurantSlug={restaurantSlug} />
                </div>
            </main>
            <Footer />
        </div>
    );
}

"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface SessionStatus {
    isOpen: boolean;
    businessDate: string | null;
    sessionId: string | null;
}

export const LiveStatus: React.FC = () => {
    const params = useParams();
    const restaurantSlug = params?.restaurantSlug as string;
    const [status, setStatus] = useState<SessionStatus | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        if (!restaurantSlug) return;
        try {
            const res = await fetch(`/r/${restaurantSlug}/api/restaurant/session-status`);
            const data = await res.json();
            setStatus(data);
        } catch (error) {
            console.error("Failed to fetch session status:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 20000); // 20s polling
        return () => clearInterval(interval);
    }, [restaurantSlug]);

    if (loading) return null;

    const isOpen = status?.isOpen;

    return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 backdrop-blur-sm border border-border shadow-sm">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)] ${isOpen ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50'}`} />
            <span className="text-[11px] font-semibold tracking-wide uppercase font-sans">
                {isOpen ? 'Restaurant Open' : 'Restaurant Closed'}
            </span>
        </div>
    );
};

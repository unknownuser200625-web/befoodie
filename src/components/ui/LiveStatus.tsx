"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface SessionStatus {
    isOpen: boolean;
    businessDate: string | null;
    sessionId: string | null;
}

export type OperationalState = 'OPEN' | 'PAUSED' | 'CLOSED' | 'ERROR';

export const LiveStatus: React.FC = () => {
    const params = useParams();
    const restaurantSlug = params?.restaurantSlug as string;
    const [status, setStatus] = useState<SessionStatus | null>(null);
    const [opState, setOpState] = useState<OperationalState>('OPEN'); // Default optimistic
    const [consecutiveFailures, setConsecutiveFailures] = useState(0);

    const fetchStatus = async () => {
        if (!restaurantSlug) return;
        try {
            const res = await fetch(`/r/${restaurantSlug}/api/restaurant/session-status`);
            if (!res.ok) throw new Error('API_UNAVAILABLE');

            const data: SessionStatus & { isAcceptingOrders: boolean } = await res.json();

            // Success logic
            setStatus(data);
            setConsecutiveFailures(0);

            if (!data.isOpen) {
                setOpState('CLOSED');
            } else if (data.isAcceptingOrders === false) {
                setOpState('PAUSED');
            } else {
                setOpState('OPEN');
            }
        } catch (error) {
            console.error("LiveStatus Poll Error:", error);
            setConsecutiveFailures(prev => prev + 1);

            // Only switch to ERROR if we fail 2+ times to prevent flicker on minor blips
            if (consecutiveFailures >= 1) {
                setOpState('ERROR');
            }
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 15000); // 15s polling
        return () => clearInterval(interval);
    }, [restaurantSlug]);

    const getStatusConfig = () => {
        switch (opState) {
            case 'OPEN': return { label: 'Restaurant Open', color: 'bg-emerald-500' };
            case 'PAUSED': return { label: 'Orders Paused', color: 'bg-amber-500' };
            case 'CLOSED': return { label: 'Restaurant Closed', color: 'bg-rose-500' };
            case 'ERROR': return { label: 'Sync Error', color: 'bg-gray-500' };
        }
    };

    const config = getStatusConfig();

    return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 backdrop-blur-sm border border-border shadow-sm transition-all duration-300">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)] ${config.color}`} />
            <span className="text-[11px] font-semibold tracking-wide uppercase font-sans">
                {config.label}
            </span>
        </div>
    );
};

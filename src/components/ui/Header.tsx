import { UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
    restaurantName?: string;
    restaurantSlug?: string;
}

export function Header({ restaurantName, restaurantSlug }: HeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/90 backdrop-blur-md border-b border-white/10 h-16 flex items-center px-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <Link href={restaurantSlug ? `/r/${restaurantSlug}` : '/'} className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
                    <UtensilsCrossed className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-xl font-black tracking-tighter text-primary">
                        BEFOODIE
                    </span>
                    {restaurantName && (
                        <>
                            <span className="text-white/30 font-thin">|</span>
                            <span className="text-lg font-bold tracking-tight text-white/90 truncate">
                                {restaurantName.toUpperCase()}
                            </span>
                        </>
                    )}
                </div>
            </Link>
        </header>
    );
}

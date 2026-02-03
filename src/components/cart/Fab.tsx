'use client';

import { useCart } from '@/context/CartContext';
import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { CartDrawer } from './CartDrawer';
import { motion, AnimatePresence } from 'framer-motion';

export function Fab({ tableId, restaurantSlug }: { tableId: string; restaurantSlug: string }) {
    const { totalItems } = useCart();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <>
            <AnimatePresence>
                {totalItems > 0 && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="fixed bottom-6 right-6 z-40"
                    >
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="bg-primary hover:bg-red-700 text-white p-4 rounded-full shadow-[0_8px_30px_rgba(211,47,47,0.4)] flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                        >
                            <ShoppingBag className="w-6 h-6" />
                            <span className="absolute -top-2 -right-2 bg-white text-primary text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#121212]">
                                {totalItems}
                            </span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <CartDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                tableId={tableId}
                restaurantSlug={restaurantSlug}
            />
        </>
    );
}

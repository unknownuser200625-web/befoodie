'use client';

import { useCart } from '@/context/CartContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { io } from 'socket.io-client';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    tableId: string;
    restaurantSlug: string;
}

export function CartDrawer({ isOpen, onClose, tableId, restaurantSlug }: CartDrawerProps) {
    const { cart, removeFromCart, addToCart, cartTotal, clearCart } = useCart();
    const [isOrdering, setIsOrdering] = useState(false);

    const handleCheckout = async () => {
        setIsOrdering(true);

        const orderData = {
            tableId,
            items: cart,
            totalPrice: cartTotal,
        };

        try {
            const res = await fetch(`/r/${restaurantSlug}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            if (!res.ok) throw new Error('Order failed');

            // Success feedback
            setTimeout(() => {
                alert(`Order placed for Table ${tableId}! Total: ₹${cartTotal.toFixed(2)}`);
                clearCart();
                setIsOrdering(false);
                onClose();
            }, 500);
        } catch (error) {
            alert('Failed to place order. Please try again.');
            setIsOrdering(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-[99]"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-[100] bg-[#1e1e1e] rounded-t-2xl border-t border-white/10 shadow-[0_-4px_30px_rgba(0,0,0,0.5)] max-h-[85vh] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">Your Order</h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {cart.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    Your cart is empty. Start adding some delicious items!
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-white">{item.name}</h4>
                                            <p className="text-sm text-primary font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-3 bg-black/20 rounded-full p-1">
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="p-1 hover:text-red-500 text-gray-400 transition-colors"
                                            >
                                                {item.quantity === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                            </button>
                                            <span className="w-4 text-center text-sm font-bold text-white">{item.quantity}</span>
                                            <button
                                                onClick={() => addToCart(item)}
                                                className="p-1 hover:text-green-500 text-gray-400 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div className="p-4 border-t border-white/10 bg-[#121212] pb-8">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-400">Total</span>
                                    <span className="text-2xl font-bold text-white">₹{cartTotal.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    disabled={isOrdering}
                                    className="w-full bg-primary hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                                >
                                    {isOrdering ? 'Placing Order...' : 'Place Order'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

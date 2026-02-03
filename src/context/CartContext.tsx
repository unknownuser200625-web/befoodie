'use client';

import { CartItem, Product } from '@/types';
import { createContext, useContext, useEffect, useState } from 'react';

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    totalItems: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
    children,
    tableId,
    restaurantSlug
}: {
    children: React.ReactNode;
    tableId: string;
    restaurantSlug: string;
}) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    const storageKey = `befoodie_cart_${restaurantSlug}_${tableId}`;

    // Load from local storage
    useEffect(() => {
        const savedCart = localStorage.getItem(storageKey);
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
        setIsInitialized(true);
    }, [storageKey]);

    // Save to local storage
    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem(storageKey, JSON.stringify(cart));
    }, [cart, storageKey, isInitialized]);

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === productId);
            if (existing && existing.quantity > 1) {
                return prev.map((item) =>
                    item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
                );
            }
            return prev.filter((item) => item.id !== productId);
        });
    };

    const clearCart = () => setCart([]);

    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

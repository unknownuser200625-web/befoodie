'use client';

import { Product, Restaurant } from '@/types';
import { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import { ProductCard } from './ProductCard';
import { Search, Tag, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { LiveStatus } from '@/components/ui/LiveStatus';
import { FoodTypeIcon } from '@/components/ui/FoodTypeIcon';

export default function MenuClient({
    tableId,
    restaurantSlug
}: {
    tableId: string;
    restaurantSlug: string;
}) {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [activeFoodType, setActiveFoodType] = useState<'All' | 'veg' | 'non-veg' | 'egg'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Safety check for context
    const cartContext = useCart();
    const { addToCart, totalItems } = cartContext;

    // Fetch Restaurant Details
    useEffect(() => {
        fetch(`/r/${restaurantSlug}/api/details`)
            .then(res => res.json())
            .then(data => setRestaurant(data))
            .catch(err => console.error('Failed to fetch restaurant', err));
    }, [restaurantSlug]);

    useEffect(() => {
        // Data Fetching
        const loadInitialData = async () => {
            try {
                const prodRef = await fetch(`/r/${restaurantSlug}/api/products`);
                const productsData = await prodRef.json();
                setProducts(productsData);

                const catRef = await fetch(`/r/${restaurantSlug}/api/categories`);
                const categoriesData = await catRef.json();
                setCategories(categoriesData);
            } catch (err) {
                if (err instanceof Error) {
                    console.error('Failed to load menu data:', err.message);
                } else {
                    console.error('Failed to load menu data:', err);
                }
            }
        };

        loadInitialData();

        // Socket Config
        const socket = io({
            query: { restaurantSlug }
        });
        socket.on('product_added', (p: Product) => setProducts(prev => [...prev, p]));
        socket.on('product_updated', (p: Product) => setProducts(prev => prev.map(old => old.id === p.id ? p : old)));
        socket.on('product_deleted', (id: string) => setProducts(prev => prev.filter(p => p.id !== id)));
        socket.on('category_update', (cats: string[]) => setCategories(cats));
        socket.on('products_refresh', () => {
            fetch(`/r/${restaurantSlug}/api/products`).then(res => res.json()).then(setProducts);
        });

        return () => { socket.disconnect(); };
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
            const matchesFoodType = activeFoodType === 'All' || product.food_type === activeFoodType;
            return matchesSearch && matchesCategory && matchesFoodType && (product.available !== false);
        });
    }, [products, searchTerm, activeCategory, activeFoodType]);

    const displayCategories = activeCategory === 'All' ? categories : [activeCategory];

    // Session Status Guard
    const [isSystemOpen, setIsSystemOpen] = useState(true);
    const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
    const [serverBusinessDate, setServerBusinessDate] = useState<string | null>(null);

    // CRITICAL: Clear stale sessions on menu load (fixes cross-device bug)
    useEffect(() => {
        const validateSession = async () => {
            try {
                const res = await fetch(`/r/${restaurantSlug}/api/restaurant/session-status`);
                if (!res.ok) throw new Error('Session status unavailable');

                const data = await res.json();
                const currentBusinessDate = data.businessDate;

                console.log('[MENU SESSION] Server business_date:', currentBusinessDate);

                // Check localStorage for stale session data
                const storedBusinessDate = localStorage.getItem(`${tableId}_business_date`);
                const storedTableSession = localStorage.getItem(`${tableId}_table_session`);

                console.log('[MENU SESSION] Stored business_date:', storedBusinessDate);

                // If dates don't match, clear stale session data
                if (storedBusinessDate && storedBusinessDate !== currentBusinessDate) {
                    console.warn('[MENU SESSION] Date mismatch! Clearing stale session data');
                    localStorage.removeItem(`${tableId}_business_date`);
                    localStorage.removeItem(`${tableId}_table_session`);
                    localStorage.removeItem(`${tableId}_device_session`);
                    // Force cart clear if context exists
                    if (cartContext?.clearCart) {
                        cartContext.clearCart();
                    }
                }

                // Store current business date
                localStorage.setItem(`${tableId}_business_date`, currentBusinessDate);
                setServerBusinessDate(currentBusinessDate);

                setIsSystemOpen(data.isOpen);
                setIsAcceptingOrders(data.isAcceptingOrders);
            } catch (e) {
                console.error('[MENU SESSION] Status fetch failed', e);
            }
        };

        validateSession();
        const interval = setInterval(validateSession, 20000);
        return () => clearInterval(interval);
    }, [restaurantSlug, tableId, cartContext]);

    const showOverlay = !isSystemOpen || !isAcceptingOrders;

    return (
        <div className="pb-32 bg-[#0a0a0a] min-h-screen text-white relative">
            <Header restaurantName={restaurant?.name} restaurantSlug={restaurantSlug} />

            {/* Global Session Guard Overlay */}
            {showOverlay && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-[#181818] border border-white/10 p-8 rounded-3xl text-center max-w-md w-full shadow-2xl">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                            <LiveStatus />
                        </div>
                        <h2 className="text-3xl font-black mb-2 uppercase italic text-white">
                            {!isSystemOpen ? 'Restaurant Closed' : 'Orders Paused'}
                        </h2>
                        <p className="text-gray-400 mb-8">
                            {!isSystemOpen
                                ? "We are currently not accepting new orders. Please check back later."
                                : "We are temporarily not accepting small orders. Kitchen is catching up!"}
                        </p>
                        <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="absolute inset-y-0 left-0 w-1/3 bg-primary/30 animate-pulse rounded-full" />
                        </div>
                    </div>
                </div>
            )}

            <div className={`transition-opacity duration-500 ${showOverlay ? 'opacity-20 pointer-events-none select-none' : ''}`}>
                <div className="pt-24 px-6 mb-8 max-w-4xl mx-auto">
                    <div className="flex justify-end mb-4">
                        <LiveStatus />
                    </div>
                    {/* ... rest of the content ... */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="What would you like to eat?"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={!isSystemOpen}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all text-lg"
                        />
                    </div>
                </div>

                {/* Food Type Filters - Only show for MIXED policy */}
                {restaurant?.food_policy === 'MIXED' && (
                    <div className="px-6 mb-6 flex gap-3 max-w-4xl mx-auto">
                        <button
                            onClick={() => setActiveFoodType('All')}
                            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeFoodType === 'All' ? 'bg-white text-black shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveFoodType('veg')}
                            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeFoodType === 'veg' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white/5 text-green-400 hover:bg-green-500/10 border border-green-500/20'}`}
                        >
                            🌱 Veg
                        </button>
                        <button
                            onClick={() => setActiveFoodType('non-veg')}
                            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeFoodType === 'non-veg' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-red-400 hover:bg-red-500/10 border border-red-500/20'}`}
                        >
                            🍗 Non-Veg
                        </button>
                        <button
                            onClick={() => setActiveFoodType('egg')}
                            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${activeFoodType === 'egg' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white/5 text-amber-400 hover:bg-amber-500/10 border border-amber-500/20'}`}
                        >
                            🥚 Egg
                        </button>
                    </div>
                )}

                {/* Category Filters with Snap Scrolling */}
                <div className="px-6 mb-10 overflow-x-auto no-scrollbar flex gap-3 max-w-4xl mx-auto scroll-smooth" style={{ scrollSnapType: 'x mandatory' }}>
                    <button
                        onClick={() => setActiveCategory('All')}
                        className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all ${activeCategory === 'All' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                        style={{ scrollSnapAlign: 'start' }}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                            style={{ scrollSnapAlign: 'start' }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="px-6 space-y-12 max-w-6xl mx-auto">
                    {displayCategories.map(cat => {
                        const catProducts = filteredProducts.filter(p => p.category === cat);
                        if (catProducts.length === 0) return null;
                        return (
                            <section key={cat}>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <Tag className="text-primary" size={20} />
                                    {cat}
                                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {catProducts.map(product => (
                                        <ProductCard key={product.id} product={product} onAdd={addToCart} />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>

            {totalItems > 0 && isSystemOpen && (
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-8 right-8 bg-primary text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 flex items-center gap-3"
                >
                    <ShoppingCart size={28} />
                    <span className="font-bold text-lg">{totalItems}</span>
                </button>
            )}

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} tableId={tableId} restaurantSlug={restaurantSlug} />
            <div className="mt-20">
                <Footer />
            </div>
        </div>
    );
}

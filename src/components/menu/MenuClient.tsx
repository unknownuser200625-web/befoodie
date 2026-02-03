'use client';

import { Product } from '@/types';
import { useEffect, useState, useMemo } from 'react';
import { io } from 'socket.io-client';
import { ProductCard } from './ProductCard';
import { Search, Tag, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';

export default function MenuClient({ tableId }: { tableId: string }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Safety check for context
    const cartContext = useCart();
    const { addToCart, totalItems } = cartContext;

    useEffect(() => {
        // Data Fetching
        const loadInitialData = async () => {
            try {
                const prodRef = await fetch('/api/products');
                const productsData = await prodRef.json();
                setProducts(productsData);

                const catRef = await fetch('/api/categories');
                const categoriesData = await catRef.json();
                setCategories(categoriesData);
            } catch (err) {
                console.error('Failed to load menu data', err);
            }
        };

        loadInitialData();

        // Socket Config
        const socket = io();
        socket.on('product_added', (p: Product) => setProducts(prev => [...prev, p]));
        socket.on('product_updated', (p: Product) => setProducts(prev => prev.map(old => old.id === p.id ? p : old)));
        socket.on('product_deleted', (id: string) => setProducts(prev => prev.filter(p => p.id !== id)));
        socket.on('category_update', (cats: string[]) => setCategories(cats));
        socket.on('products_refresh', () => {
            fetch('/api/products').then(res => res.json()).then(setProducts);
        });

        return () => { socket.disconnect(); };
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
            return matchesSearch && matchesCategory && (product.available !== false);
        });
    }, [products, searchTerm, activeCategory]);

    const displayCategories = activeCategory === 'All' ? categories : [activeCategory];

    return (
        <div className="pb-32 bg-[#0a0a0a] min-h-screen text-white">
            <div className="pt-24 px-6 mb-8 max-w-4xl mx-auto">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="What would you like to eat?"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 focus:bg-white/[0.08] transition-all text-lg"
                    />
                </div>
            </div>

            <div className="px-6 mb-10 overflow-x-auto no-scrollbar flex gap-3 max-w-4xl mx-auto">
                <button
                    onClick={() => setActiveCategory('All')}
                    className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all ${activeCategory === 'All' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
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

            {totalItems > 0 && (
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-8 right-8 bg-primary text-white p-5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 flex items-center gap-3"
                >
                    <ShoppingCart size={28} />
                    <span className="font-bold text-lg">{totalItems}</span>
                </button>
            )}

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} tableId={tableId} />
        </div>
    );
}

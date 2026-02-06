'use client';

import { Header } from '@/components/ui/Header';
import { Footer } from '@/components/ui/Footer';
import { Category, Product, Restaurant } from '@/types';
import { ArrowLeft, Search, Plus, Trash2, Edit2, X, Check, Minus, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, use } from 'react';
import { io } from 'socket.io-client';
import { ImageUpload } from '@/components/admin/ImageUpload';

export default function ProductManagerPage({
    params,
}: {
    params: Promise<{ restaurantSlug: string }>;
}) {
    const { restaurantSlug } = use(params);
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        price: 0,
        category: 'Veg Burger',
        image: '',
        available: true,
        food_type: 'veg'
    });

    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch(`/r/${restaurantSlug}/api/auth/status`);
            const data = await res.json();
            if (!data.authenticated || data.role !== 'owner') {
                window.location.href = `/r/${restaurantSlug}/admin/login`;
            }
        };
        checkAuth();
    }, [restaurantSlug]);

    // Fetch Restaurant Details
    useEffect(() => {
        fetch(`/r/${restaurantSlug}/api/details`)
            .then(res => res.json())
            .then(data => setRestaurant(data))
            .catch(err => console.error('Failed to fetch restaurant', err));
    }, [restaurantSlug]);

    useEffect(() => {
        fetch(`/r/${restaurantSlug}/api/products`)
            .then(res => res.json())
            .then(setProducts);

        fetch(`/r/${restaurantSlug}/api/categories`)
            .then(res => res.json())
            .then(cats => {
                setCategories(cats);
                if (cats.length > 0) setFormData(prev => ({ ...prev, category: cats[0] }));
            });

        const socket = io({
            query: { restaurantSlug }
        });
        socket.on('product_added', (newProd: Product) => setProducts(prev => [...prev, newProd]));
        socket.on('product_updated', (updatedProd: Product) => {
            setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
        });
        socket.on('product_deleted', (id: string) => {
            setProducts(prev => prev.filter(p => p.id !== id));
        });
        socket.on('category_update', (newCats: string[]) => setCategories(newCats));
        socket.on('products_refresh', () => {
            fetch(`/r/${restaurantSlug}/api/products`).then(res => res.json()).then(setProducts);
        });

        return () => { socket.disconnect(); }
    }, [restaurantSlug]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingId ? 'PUT' : 'POST';
        const url = `/r/${restaurantSlug}/api/products`;
        const payload = editingId ? { ...formData, id: editingId } : formData;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setIsAdding(false);
                setEditingId(null);
                setFormData({ name: '', price: 0, category: 'Veg Burger', image: '', available: true });
            }
        } catch (error) {
            alert('Failed to save product');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await fetch(`/r/${restaurantSlug}/api/products?id=${id}`, { method: 'DELETE' });
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    const toggleAvailability = async (product: Product) => {
        const previousState = product.available;
        const newState = !product.available;

        // Optimistic UI update
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, available: newState } : p));

        try {
            const res = await fetch(`/r/${restaurantSlug}/api/products/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: product.id, available: newState }),
            });

            if (!res.ok) throw new Error('Toggle failed');

            // Success notification
            const message = newState ? '✅ Product is now LIVE' : '🔴 Product hidden from menu';
            alert(message); // Using simple alert - can be replaced with a toast library
        } catch (error) {
            // Rollback on error
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, available: previousState } : p));
            alert('❌ Failed to toggle product availability. Please try again.');
            console.error('Toggle error:', error);
        }
    };

    const adjustPrice = async (product: Product, delta: number) => {
        await fetch(`/r/${restaurantSlug}/api/products`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: product.id, price: Math.max(0, product.price + delta) }),
        });
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Header restaurantName={restaurant?.name} restaurantSlug={restaurantSlug} />
            <main className="pt-24 px-6 max-w-5xl mx-auto pb-20">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href={`/r/${restaurantSlug}/admin`} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                            <ArrowLeft />
                        </Link>
                        <h1 className="text-3xl font-bold uppercase italic">{restaurant?.name || 'BEFOODIE'} | PRODUCTS</h1>
                    </div>
                    <button
                        onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', price: 0, category: 'Veg Burger', image: '', available: true }); }}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-bold transition-all"
                    >
                        <Plus size={20} /> Add Item
                    </button>
                </div>

                {/* Form Modal (Overlay) */}
                {(isAdding || editingId) && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <form onSubmit={handleSave} className="bg-[#1e1e1e] w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-gray-400 hover:text-white"><X /></button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Product Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 focus:border-primary outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Price (₹)</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 focus:border-primary outline-none"
                                        >
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <ImageUpload
                                    currentImageUrl={formData.image}
                                    onImageUrlChange={(url) => setFormData({ ...formData, image: url })}
                                    restaurantSlug={restaurantSlug}
                                />
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Dietary Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['veg', 'non-veg', 'egg'] as const).map(type => {
                                            const isLocked = restaurant?.food_policy === 'PURE_VEG' && type !== 'veg';
                                            return (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    disabled={isLocked}
                                                    onClick={() => {
                                                        if (isLocked) {
                                                            alert(`❌ Pure Veg restaurants can only add Vegetarian items.\n\nThis option is locked by your restaurant's food policy.`);
                                                            return;
                                                        }
                                                        setFormData({ ...formData, food_type: type });
                                                    }}
                                                    title={isLocked ? 'Blocked by Pure Veg policy' : `Select ${type}`}
                                                    className={`py-2 rounded-lg text-sm font-bold uppercase transition-all ${isLocked
                                                            ? 'opacity-40 cursor-not-allowed bg-white/5 text-gray-600 border border-white/5'
                                                            : formData.food_type === type
                                                                ? type === 'veg' ? 'bg-green-500/20 text-green-500 border border-green-500/50'
                                                                    : type === 'non-veg' ? 'bg-red-500/20 text-red-500 border border-red-500/50'
                                                                        : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50'
                                                                : 'bg-white/5 text-gray-500 border border-white/10 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {isLocked && '🔒 '}
                                                    {type}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 py-2">
                                    <input
                                        type="checkbox"
                                        id="available"
                                        checked={formData.available}
                                        onChange={e => setFormData({ ...formData, available: e.target.checked })}
                                        className="w-4 h-4 accent-primary"
                                    />
                                    <label htmlFor="available" className="text-sm">Available for Customers</label>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl mt-8 transition-all">
                                {editingId ? 'Update Product' : 'Create Product'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl py-4 pl-12 focus:outline-none focus:border-primary"
                    />
                </div>

                {/* List */}
                <div className="grid grid-cols-1 gap-3">
                    {filtered.map(product => (
                        <div key={product.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${product.available ? 'bg-[#1e1e1e] border-white/5' : 'bg-red-950/20 border-red-900/30 grayscale'}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#0a0a0a] rounded-lg overflow-hidden border border-white/5">
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold text-xs uppercase">No IMG</div>
                                    )}
                                </div>
                                <div>
                                    <h3 className={`font-bold ${!product.available && 'text-gray-500'}`}>{product.name}</h3>
                                    <p className="text-xs text-gray-400">{product.category}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                {/* Refined Price Controls */}
                                <div className="flex items-center gap-2 bg-[#0a0a0a] rounded-xl p-1 px-1.5 border border-white/10">
                                    <button
                                        onClick={() => adjustPrice(product, -5)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-all text-[10px] font-bold"
                                    >
                                        -5
                                    </button>
                                    <div className="flex flex-col items-center px-2 min-w-[64px]">
                                        <span className="text-[8px] text-gray-500 uppercase font-black tracking-widest leading-none mb-0.5">Price</span>
                                        <span className="font-mono font-bold text-primary text-sm">₹{product.price}</span>
                                    </div>
                                    <button
                                        onClick={() => adjustPrice(product, 5)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-green-500/20 hover:text-green-400 transition-all text-[10px] font-bold"
                                    >
                                        +5
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleAvailability(product)}
                                        className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${product.available
                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                            }`}
                                    >
                                        {product.available ? 'Live' : 'Hidden'}
                                    </button>
                                    <button
                                        onClick={() => { setEditingId(product.id); setFormData(product); }}
                                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-20 text-gray-500">No products found.</div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}

'use client';

import { Header } from '@/components/ui/Header';
import { ArrowLeft, Plus, Trash2, Edit2, X, Tag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function CategoryManagerPage() {
    const [categories, setCategories] = useState<string[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingName, setEditingName] = useState<string | null>(null);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch('/api/auth/status');
            const data = await res.json();
            if (!data.authenticated || data.role !== 'owner') {
                window.location.href = '/admin/login';
            }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(setCategories);

        const socket = io();
        socket.on('category_update', (newCats: string[]) => setCategories(newCats));

        return () => { socket.disconnect(); }
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName) return;
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName }),
            });
            if (res.ok) {
                setIsAdding(false);
                setNewName('');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to add');
            }
        } catch (error) {
            alert('Error adding category');
        }
    };

    const handleRename = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingName || !newName || editingName === newName) return;
        try {
            const res = await fetch('/api/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldName: editingName, newName }),
            });
            if (res.ok) {
                setEditingName(null);
                setNewName('');
            }
        } catch (error) {
            alert('Error renaming category');
        }
    };

    const handleDelete = async (name: string) => {
        if (!confirm(`Delete category "${name}"? Only works if category is empty.`)) return;
        try {
            const res = await fetch(`/api/categories?name=${encodeURIComponent(name)}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                alert(data.error || 'Failed to delete');
            }
        } catch (error) {
            alert('Error deleting category');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <Header />
            <main className="pt-24 px-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                            <ArrowLeft />
                        </Link>
                        <h1 className="text-3xl font-bold">Category Manager</h1>
                    </div>
                    <button
                        onClick={() => { setIsAdding(true); setEditingName(null); setNewName(''); }}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-bold transition-all"
                    >
                        <Plus size={20} /> Add Category
                    </button>
                </div>

                {/* Modals */}
                {(isAdding || editingName) && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <form onSubmit={editingName ? handleRename : handleAdd} className="bg-[#1e1e1e] w-full max-w-sm rounded-2xl border border-white/10 p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">{editingName ? 'Rename Category' : 'Add Category'}</h2>
                                <button type="button" onClick={() => { setIsAdding(false); setEditingName(null); }} className="text-gray-400 hover:text-white"><X /></button>
                            </div>

                            <input
                                autoFocus
                                required
                                type="text"
                                placeholder="Category Name"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 focus:border-primary outline-none mb-6"
                            />

                            <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all">
                                {editingName ? 'Rename' : 'Create'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="space-y-2">
                    {categories.map(cat => (
                        <div key={cat} className="flex items-center justify-between p-4 bg-[#1e1e1e] rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <Tag className="text-primary/50" size={18} />
                                <span className="font-bold text-lg">{cat}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setEditingName(cat); setNewName(cat); setIsAdding(false); }}
                                    className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(cat)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

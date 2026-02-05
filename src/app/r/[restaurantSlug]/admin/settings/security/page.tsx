'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Key, Shield, Check, AlertCircle } from 'lucide-react';

export default function SecuritySettingsPage({
    params,
}: {
    params: Promise<{ restaurantSlug: string }>;
}) {
    const { restaurantSlug } = use(params);
    const router = useRouter();

    // Password Change State
    const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passLoading, setPassLoading] = useState(false);
    const [passMsg, setPassMsg] = useState({ type: '', text: '' });

    // PIN Change State
    const [pinData, setPinData] = useState({ newPin: '' });
    const [pinLoading, setPinLoading] = useState(false);
    const [pinMsg, setPinMsg] = useState({ type: '', text: '' });

    const handlePassUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassMsg({ type: '', text: '' });

        if (passData.newPassword !== passData.confirmPassword) {
            setPassMsg({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (passData.newPassword.length < 6) {
            setPassMsg({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setPassLoading(true);
        try {
            const res = await fetch(`/r/${restaurantSlug}/api/admin/security`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'password',
                    oldPassword: passData.oldPassword,
                    newPassword: passData.newPassword
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update password');

            setPassMsg({ type: 'success', text: 'Password updated successfully' });
            setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            if (err instanceof Error) {
                setPassMsg({ type: 'error', text: err.message });
            } else {
                setPassMsg({ type: 'error', text: 'An unexpected error occurred' });
            }
        } finally {
            setPassLoading(false);
        }
    };

    const handlePinUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setPinMsg({ type: '', text: '' });

        if (pinData.newPin.length < 4) {
            setPinMsg({ type: 'error', text: 'PIN must be at least 4 digits' });
            return;
        }

        setPinLoading(true);
        try {
            const res = await fetch(`/r/${restaurantSlug}/api/admin/security`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'pin',
                    newPin: pinData.newPin
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update PIN');

            setPinMsg({ type: 'success', text: 'Staff PIN updated successfully' });
            setPinData({ newPin: '' });
        } catch (err) {
            if (err instanceof Error) {
                setPinMsg({ type: 'error', text: err.message });
            } else {
                setPinMsg({ type: 'error', text: 'An unexpected error occurred' });
            }
        } finally {
            setPinLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <Shield className="text-primary" size={32} />
                    SECURITY SETTINGS
                </h1>
                <p className="text-neutral-400 mt-2">Manage access credentials for your restaurant.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Change Owner Password */}
                <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                        <Lock className="text-amber-500" size={24} />
                        <h2 className="text-xl font-bold font-mono">OWNER PASSWORD</h2>
                    </div>

                    <form onSubmit={handlePassUpdate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Current Password</label>
                            <input
                                type="password"
                                value={passData.oldPassword}
                                onChange={e => setPassData({ ...passData, oldPassword: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-amber-500 focus:outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">New Password</label>
                            <input
                                type="password"
                                value={passData.newPassword}
                                onChange={e => setPassData({ ...passData, newPassword: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-amber-500 focus:outline-none"
                                placeholder="New secure password"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={passData.confirmPassword}
                                onChange={e => setPassData({ ...passData, confirmPassword: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-amber-500 focus:outline-none"
                                placeholder="Repeat new password"
                                required
                            />
                        </div>

                        {passMsg.text && (
                            <div className={`p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${passMsg.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {passMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                {passMsg.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={passLoading}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {passLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                        </button>
                    </form>
                </div>

                {/* Change Staff PIN */}
                <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                        <Key className="text-blue-500" size={24} />
                        <h2 className="text-xl font-bold font-mono">STAFF ACCESS PIN</h2>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-6">
                        <p className="text-sm text-blue-200">
                            This PIN is used by kitchen and wait staff to access the content management and kitchen display systems.
                        </p>
                    </div>

                    <form onSubmit={handlePinUpdate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">New Staff PIN</label>
                            <input
                                type="text"
                                value={pinData.newPin}
                                onChange={e => setPinData({ newPin: e.target.value.replace(/[^0-9]/g, '') })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none font-mono tracking-widest text-center text-xl"
                                placeholder="0000"
                                maxLength={6}
                                required
                            />
                        </div>

                        {pinMsg.text && (
                            <div className={`p-3 rounded-lg text-sm font-bold flex items-center gap-2 ${pinMsg.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {pinMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                {pinMsg.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={pinLoading}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {pinLoading ? 'UPDATING...' : 'UPDATE PIN'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="text-center mt-8">
                <button onClick={() => router.push(`/r/${restaurantSlug}/admin`)} className="text-neutral-500 hover:text-white transition-colors text-sm font-bold tracking-widest">
                    ← RETURN TO ADMIN DASHBOARD
                </button>
            </div>
        </div>
    );
}

"use client";

import React, { useState } from 'react';
import { QrCode, Download, ExternalLink } from 'lucide-react';

interface QRGeneratorProps {
    restaurantSlug: string;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ restaurantSlug }) => {
    const [tableId, setTableId] = useState('');

    // Using GoQR.me or QRServer API for simple reliable generation without deps
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const targetUrl = `${baseUrl}/r/${restaurantSlug}/menu/${tableId}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}`;

    const downloadQR = async () => {
        try {
            const response = await fetch(qrImageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `table-${tableId}-qr.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed', error);
        }
    };

    return (
        <div className="bg-[#181818] p-6 rounded-2xl border border-white/5">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <QrCode className="text-primary" /> Table QR Generator
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-2">Table Number / ID</label>
                    <input
                        type="text"
                        value={tableId}
                        onChange={(e) => setTableId(e.target.value)}
                        placeholder="e.g. 5, A1, Patio-2"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                    />
                </div>

                {tableId && (
                    <div className="bg-white/5 p-4 rounded-xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="bg-white p-2 rounded-lg">
                            <img src={qrImageUrl} alt={`QR for Table ${tableId}`} className="w-48 h-48" />
                        </div>

                        <div className="text-center">
                            <p className="text-sm font-bold text-white mb-1">Table {tableId}</p>
                            <p className="text-[10px] text-gray-500 font-mono break-all max-w-[250px]">{targetUrl}</p>
                        </div>

                        <div className="flex gap-2 w-full">
                            <button
                                onClick={downloadQR}
                                className="flex-1 bg-primary hover:bg-primary/80 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                            >
                                <Download size={16} /> Image
                            </button>
                            <a
                                href={targetUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                            >
                                <ExternalLink size={16} /> Test Link
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

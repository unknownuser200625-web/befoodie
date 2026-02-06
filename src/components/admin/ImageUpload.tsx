'use client';

import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    currentImageUrl?: string;
    onImageUrlChange: (url: string) => void;
    restaurantSlug: string;
}

export function ImageUpload({ currentImageUrl, onImageUrlChange, restaurantSlug }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentImageUrl);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
        }

        // Max 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch(`/r/${restaurantSlug}/api/products/upload-image`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            const { imageUrl } = await res.json();
            setPreviewUrl(imageUrl);
            onImageUrlChange(imageUrl);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm text-gray-400 mb-1">Product Image</label>

            {/* Preview */}
            {previewUrl && (
                <div className="relative w-full h-48 bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden group">
                    <img
                        src={previewUrl}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            setPreviewUrl(undefined);
                            onImageUrlChange('');
                        }}
                        className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-500/80 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Upload Zone */}
            {!previewUrl && (
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${dragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-white/10 hover:border-white/20 bg-white/5'
                        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                    />

                    <div className="flex flex-col items-center gap-3">
                        {uploading ? (
                            <>
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-gray-400">Uploading...</p>
                            </>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 text-gray-500" />
                                <div>
                                    <p className="text-white font-bold mb-1">Drop image here or click to upload</p>
                                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Replace Button */}
            {previewUrl && !uploading && (
                <button
                    type="button"
                    onClick={() => setPreviewUrl(undefined)}
                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-4 py-3 rounded-lg font-bold transition-all border border-white/10"
                >
                    <ImageIcon size={18} /> Replace Image
                </button>
            )}
        </div>
    );
}

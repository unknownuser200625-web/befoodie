import { Product } from '@/types';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { FoodTypeIcon } from '@/components/ui/FoodTypeIcon';

interface ProductCardProps {
    product: Product;
    onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
    return (
        <div className="bg-card rounded-xl overflow-hidden shadow-lg border border-white/5 flex flex-row h-32 md:h-auto md:flex-col group active:scale-[0.98] transition-transform duration-100">
            {/* Image Section */}
            <div className="relative w-32 h-32 md:w-full md:h-48 shrink-0">
                <Image
                    src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
                    alt={product.name}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-t md:from-black/80 md:via-transparent md:to-transparent opacity-60" />
            </div>

            {/* Content Section */}
            <div className="p-3 md:p-4 flex flex-col justify-between flex-1 relative">
                <div>
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-white text-base md:text-lg leading-tight line-clamp-1">
                            {product.name}
                        </h3>
                        <FoodTypeIcon type={product.food_type} />
                    </div>
                    <p className="text-gray-400 text-xs md:text-sm mt-1 line-clamp-2">
                        {product.description}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-2 md:mt-4">
                    <span className="text-primary font-bold text-base md:text-lg">
                        ₹{product.price.toFixed(2)}
                    </span>
                    <button
                        onClick={() => onAdd(product)}
                        className="bg-primary hover:bg-red-700 text-white p-2 rounded-full shadow-lg shadow-red-900/20 active:bg-red-800 transition-colors"
                        aria-label="Add to cart"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

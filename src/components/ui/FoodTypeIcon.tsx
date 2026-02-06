import React from 'react';

interface FoodTypeIconProps {
    type?: 'veg' | 'non-veg' | 'egg';
    size?: 'sm' | 'md' | 'lg';
}

export function FoodTypeIcon({ type = 'veg', size = 'md' }: FoodTypeIconProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const dotSizeClasses = {
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3'
    };

    const borderColors = {
        veg: 'border-green-600',
        'non-veg': 'border-red-600',
        egg: 'border-amber-600'
    };

    const dotColors = {
        veg: 'bg-green-600',
        'non-veg': 'bg-red-600',
        egg: 'bg-amber-600'
    };

    return (
        <div
            className={`inline-flex items-center justify-center ${sizeClasses[size]} border-2 ${borderColors[type]} rounded-sm shrink-0`}
            title={type === 'veg' ? 'Vegetarian' : type === 'non-veg' ? 'Non-Vegetarian' : 'Contains Egg'}
        >
            <div className={`${dotSizeClasses[size]} ${dotColors[type]} rounded-full`} />
        </div>
    );
}

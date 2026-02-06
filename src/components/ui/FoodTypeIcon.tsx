import React from 'react';

export const FoodTypeIcon = ({ type }: { type?: 'veg' | 'non-veg' | 'egg' }) => {
    if (!type) return null;

    if (type === 'veg') {
        return (
            <div className="w-4 h-4 border border-green-600 p-[2px] flex items-center justify-center rounded-[2px]" title="Vegetarian">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
            </div>
        );
    }

    if (type === 'non-veg') {
        return (
            <div className="w-4 h-4 border border-red-600 p-[2px] flex items-center justify-center rounded-[2px]" title="Non-Vegetarian">
                <div className="w-2 h-2 bg-red-600 rounded-full" />
            </div>
        );
    }

    if (type === 'egg') {
        return (
            <div className="w-4 h-4 border border-yellow-600 p-[2px] flex items-center justify-center rounded-[2px]" title="Contains Egg">
                <div className="w-2 h-2 bg-yellow-600 rounded-full" />
            </div>
        );
    }

    return null;
};

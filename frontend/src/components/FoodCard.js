'use client';

import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { useCart } from './CartContext';
import { trackClick } from '@/lib/api';

const CATEGORY_COLORS = {
  bowl: 'bg-secondary/10 text-secondary',
  taco: 'bg-primary/10 text-primary',
  side: 'bg-accent/20 text-amber-700',
  drink: 'bg-blue-50 text-blue-600',
  main: 'bg-gray-100 text-gray-600',
};

export default function FoodCard({ item }) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const inCart = items.find(i => i.id === item.id);

  const handleAdd = (e) => {
    e.stopPropagation();
    trackClick(item.id);
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleCardClick = () => {
    trackClick(item.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="card overflow-hidden group cursor-pointer animate-fade-in"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-gray-50 to-gray-100">
            🍽️
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className={`badge font-medium capitalize text-xs px-2.5 py-1 rounded-full ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.main}`}>
            {item.category}
          </span>
        </div>
        {/* Cart indicator */}
        {inCart && (
          <div className="absolute top-3 right-3 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-full">
            ×{inCart.quantity} in cart
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-dark text-base leading-snug mb-1 line-clamp-1">
          {item.name}
        </h3>
        <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-dark">
            ${item.price.toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
              added
                ? 'bg-secondary text-white'
                : 'bg-primary text-white hover:bg-primary-dark'
            }`}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" />
                Added!
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

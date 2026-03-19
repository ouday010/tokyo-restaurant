'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from './CartContext';

export default function Cart({ open, onClose }) {
  const router = useRouter();
  const { items, total, updateQty, removeItem, clearCart } = useCart();

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-lg text-dark">Your Cart</h2>
            <p className="text-xs text-muted">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-muted hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <ShoppingBag className="h-16 w-16 text-gray-200 mb-4" />
              <p className="text-dark font-semibold text-lg">Your cart is empty</p>
              <p className="text-muted text-sm mt-1">Add some delicious items from our menu!</p>
              <Link href="/menu" onClick={onClose} className="mt-6 btn-primary text-sm inline-block">
                Browse Menu
              </Link>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-bg-warm rounded-2xl p-3">
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-dark line-clamp-1">{item.name}</p>
                  <p className="text-primary font-bold text-sm mt-0.5">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="h-6 w-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-primary transition-colors shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted font-medium">Subtotal</span>
              <span className="text-2xl font-bold text-dark">${total.toFixed(2)}</span>
            </div>
            <Link href="/checkout" onClick={onClose} className="btn-primary w-full text-center block">
              Proceed to Checkout →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

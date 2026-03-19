'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import { useCart } from '@/components/CartContext';
import { createOrder, trackVisit } from '@/lib/api';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ guest_name: '', guest_phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    trackVisit('checkout');
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.guest_name.trim()) return setError('Please enter your name.');
    if (!form.guest_phone.trim()) return setError('Please enter your phone number.');
    if (items.length === 0) return setError('Your cart is empty.');

    setLoading(true);
    try {
      const res = await createOrder({
        guest_name: form.guest_name.trim(),
        guest_phone: form.guest_phone.trim(),
        items: items.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      });
      clearCart();
      router.push(`/confirmation?order=${res.order_id}`);
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-bg-warm">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <ShoppingBag className="h-20 w-20 text-gray-200 mb-6" />
          <h2 className="text-2xl font-bold text-dark mb-2">Your cart is empty</h2>
          <p className="text-muted mb-6">Add some items before checking out.</p>
          <Link href="/menu" className="btn-primary">Browse Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-warm">
      <Header />

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <Link href="/menu" className="inline-flex items-center gap-2 text-muted hover:text-dark text-sm mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to menu
        </Link>

        <h1 className="text-3xl font-black text-dark mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="card p-6">
              <h2 className="font-bold text-lg text-dark mb-5">Order Summary</h2>
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-dark line-clamp-1">{item.name}</p>
                      <p className="text-muted text-xs mt-0.5">×{item.quantity}</p>
                    </div>
                    <span className="font-bold text-sm text-dark shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-6 pt-5 flex justify-between items-center">
                <span className="font-semibold text-dark">Total</span>
                <span className="text-2xl font-black text-dark">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="card p-6">
              <h2 className="font-bold text-lg text-dark mb-2">Your Details</h2>
              <p className="text-muted text-sm mb-6">Please provide your contact information for order confirmation.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">
                    Full Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    name="guest_name"
                    value={form.guest_name}
                    onChange={handleChange}
                    placeholder="e.g. Yuki Tanaka"
                    className="input-field"
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-dark mb-1.5">
                    Phone Number <span className="text-primary">*</span>
                  </label>
                  <input
                    type="tel"
                    name="guest_phone"
                    value={form.guest_phone}
                    onChange={handleChange}
                    placeholder="+216 XX XXX XXX"
                    className="input-field"
                    disabled={loading}
                    autoComplete="tel"
                  />
                  <p className="text-xs text-muted mt-1.5">Include country code (e.g. +1, +216)</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-primary text-sm rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base rounded-2xl disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      Place Order
                    </>
                  )}
                </button>

                <p className="text-xs text-muted text-center leading-relaxed">
                  By placing your order, we'll contact you to confirm the details.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

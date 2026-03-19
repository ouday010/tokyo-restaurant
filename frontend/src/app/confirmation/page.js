'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Clock, Home, UtensilsCrossed } from 'lucide-react';
import { getOrder, trackVisit } from '@/lib/api';

const STATUS_CONFIG = {
  pending: { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending Confirmation' },
  confirmed: { color: 'text-secondary', bg: 'bg-green-50', label: 'Confirmed' },
  preparing: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Being Prepared' },
  ready: { color: 'text-purple-600', bg: 'bg-purple-50', label: 'Ready for Pickup/Delivery' },
  delivered: { color: 'text-secondary', bg: 'bg-green-50', label: 'Delivered' },
  cancelled: { color: 'text-primary', bg: 'bg-red-50', label: 'Cancelled' },
};

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    trackVisit('confirmation');
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }
    getOrder(orderId)
      .then(setOrder)
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-warm flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-bg-warm flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-dark mb-2">{error || 'Something went wrong'}</h2>
          <Link href="/" className="btn-primary mt-4 inline-block">Go Home</Link>
        </div>
      </div>
    );
  }

  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <div className="min-h-screen bg-bg-warm flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-fade-in">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-secondary" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-dark mb-2">Order Placed!</h1>
          <p className="text-muted">Thank you, <span className="font-semibold text-dark">{order.guest_name}</span>! Your order has been received.</p>
        </div>

        {/* Order card */}
        <div className="card p-6 space-y-5">
          {/* Order ID + Status */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-medium">Order ID</p>
              <p className="font-black text-dark text-lg mt-0.5">{order.order_id}</p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
              {status.label}
            </span>
          </div>

          <div className="border-t border-gray-50" />

          {/* Contact */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted text-xs mb-1">Name</p>
              <p className="font-semibold text-dark">{order.guest_name}</p>
            </div>
            <div>
              <p className="text-muted text-xs mb-1">WhatsApp</p>
              <p className="font-semibold text-dark">{order.guest_phone}</p>
            </div>
          </div>

          <div className="border-t border-gray-50" />

          {/* Items */}
          <div>
            <p className="text-xs text-muted uppercase tracking-wider font-medium mb-3">Items Ordered</p>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-dark">{item.name} <span className="text-muted">×{item.quantity}</span></span>
                  <span className="font-semibold text-dark">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <span className="font-semibold text-dark">Total</span>
            <span className="text-2xl font-black text-dark">${Number(order.total).toFixed(2)}</span>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-5 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">What happens next?</p>
            <p className="text-amber-700 text-xs mt-1 leading-relaxed">
              Our team has been notified via WhatsApp. We&apos;ll confirm your order and contact you at {order.guest_phone} shortly.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Link href="/" className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-2xl text-sm font-semibold text-dark hover:border-gray-300 transition-colors">
            <Home className="h-4 w-4" /> Home
          </Link>
          <Link href="/menu" className="flex-1 btn-primary flex items-center justify-center gap-2 rounded-2xl text-sm">
            <UtensilsCrossed className="h-4 w-4" /> Order More
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-warm flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}

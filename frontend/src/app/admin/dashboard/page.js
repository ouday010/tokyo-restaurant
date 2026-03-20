'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, TrendingUp,
  Users, DollarSign, Eye, LogOut, Package, Star, ChevronRight
} from 'lucide-react';
import { getAdminStats } from '@/lib/api';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  ready: 'bg-green-100 text-green-700',
  delivered: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

// AdminNav component removed - now handled in AdminLayout

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.replace('/admin/login'); return; }
    getAdminStats()
      .then(setStats)
      .catch(() => router.replace('/admin/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Visitors Today', value: stats?.visits_today || 0, icon: Eye, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Orders', value: stats?.total_orders || 0, icon: ShoppingBag, color: 'bg-amber-50 text-amber-600' },
    { label: 'Revenue', value: `$${(stats?.total_revenue || 0).toFixed(2)}`, icon: DollarSign, color: 'bg-green-50 text-secondary' },
    { label: 'Menu Items', value: stats?.total_menu_items || 0, icon: UtensilsCrossed, color: 'bg-red-50 text-primary' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-dark">Dashboard</h1>
          <p className="text-muted text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map(card => (
            <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className={`h-10 w-10 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
                <card.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black text-dark">{card.value}</p>
              <p className="text-muted text-sm mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Items */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-dark">Top Items</h2>
              <Star className="h-4 w-4 text-accent fill-accent" />
            </div>
            <div className="space-y-3">
              {(stats?.top_items || []).map((item, idx) => (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted w-4">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-dark line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted">{item.clicks} clicks · {item.orders_count} orders</p>
                  </div>
                  <span className="text-sm font-bold text-dark shrink-0">${item.price.toFixed(2)}</span>
                </div>
              ))}
              {(!stats?.top_items || stats.top_items.length === 0) && (
                <p className="text-muted text-sm text-center py-4">No data yet</p>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-dark">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {(stats?.recent_orders || []).map(order => (
                <div key={order.order_id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-dark">{order.guest_name}</p>
                    <p className="text-xs text-muted font-mono">{order.order_id}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold text-dark">${Number(order.total).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              {(!stats?.recent_orders || stats.recent_orders.length === 0) && (
                <p className="text-muted text-sm text-center py-4">No orders yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

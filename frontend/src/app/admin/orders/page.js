'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, LogOut, ChevronDown, Search, RefreshCw } from 'lucide-react';
import { getAllOrders, updateOrderStatus } from '@/lib/api';
import { useAdminAuth } from '@/hooks/useAdminAuth';

const STATUS_OPTIONS = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  preparing: 'bg-purple-100 text-purple-700 border-purple-200',
  ready: 'bg-green-100 text-green-700 border-green-200',
  delivered: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-100 text-red-600 border-red-200',
};

// AdminNav component removed - now handled in AdminLayout

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updating, setUpdating] = useState(null);

  // Check authentication using reusable hook
  useAdminAuth();

  const load = () => {
    setLoading(true);
    getAllOrders()
      .then(setOrders)
      .catch(() => router.replace('/admin/login'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: updated.status } : o));
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchSearch = !search || o.guest_name.toLowerCase().includes(search.toLowerCase()) || o.order_id.toLowerCase().includes(search.toLowerCase()) || o.guest_phone.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-dark">Orders</h1>
            <p className="text-muted text-sm mt-1">{orders.length} total orders</p>
          </div>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search by name, order ID, or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="input-field text-sm w-full sm:w-44"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <ShoppingBag className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-dark font-semibold">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <div key={order.order_id} className="bg-white rounded-2xl shadow-sm p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-black text-dark text-sm font-mono">{order.order_id}</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-dark">{order.guest_name}</p>
                    <p className="text-xs text-muted mt-1">{order.guest_phone} · {new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <span className="text-lg sm:text-xl font-black text-dark">${Number(order.total).toFixed(2)}</span>
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.order_id, e.target.value)}
                      disabled={updating === order.order_id}
                      className="w-full sm:w-auto text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white disabled:opacity-60"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="text-xs bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 text-dark">
                        {item.name} ×{item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

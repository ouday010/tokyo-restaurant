'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, LogOut,
  Plus, Trash2, Eye, EyeOff, Upload, X, Loader2, Image as ImageIcon
} from 'lucide-react';
import { getAllMenuItems, addMenuItem, deleteMenuItem, updateLogo, getSettings, updateMenuItem } from '@/lib/api';

const CATEGORIES = ['bowl', 'taco', 'side', 'drink', 'main'];

function AdminNav({ active }) {
  const router = useRouter();
  const links = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/menu', icon: UtensilsCrossed, label: 'Menu' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  ];
  const logout = () => { localStorage.removeItem('admin_token'); router.push('/admin/login'); };
  return (
    <aside className="w-56 bg-dark text-white flex flex-col min-h-screen shrink-0">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <UtensilsCrossed className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Tokyo H&T</p>
            <p className="text-gray-400 text-xs">Admin Panel</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(l => (
          <Link key={l.href} href={l.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active === l.label ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}>
            <l.icon className="h-4 w-4" /> {l.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-colors w-full">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );
}

function AddItemModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'bowl' });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) return setError('Name and price are required');
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      await addMenuItem(fd);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-xl text-dark">Add Menu Item</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">Photo</label>
            <div
              onClick={() => fileRef.current.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
              ) : (
                <div className="space-y-2">
                  <ImageIcon className="h-10 w-10 text-gray-300 mx-auto" />
                  <p className="text-sm text-muted">Click to upload photo</p>
                  <p className="text-xs text-gray-300">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Item Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="input-field"
              placeholder="e.g. Spicy Tuna Bowl"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="input-field resize-none"
              rows={3}
              placeholder="Describe the dish, ingredients, flavors..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                className="input-field"
                placeholder="12.99"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="input-field"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-primary text-sm rounded-xl px-4 py-3">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-gray-200 rounded-2xl text-sm font-semibold text-dark hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary py-3 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</> : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MenuManagePage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoRef = useRef();

  const load = () => {
    Promise.all([getAllMenuItems(), getSettings()])
      .then(([menuData, settingsData]) => {
        setItems(menuData);
        setSettings(settingsData);
      })
      .catch(() => router.replace('/admin/login'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { router.replace('/admin/login'); return; }
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteMenuItem(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      alert('Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailable = async (item) => {
    const fd = new FormData();
    fd.append('available', item.available ? 'false' : 'true');
    try {
      const updated = await updateMenuItem(item.id, fd);
      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
    } catch (e) {
      alert('Failed to update item');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoUploading(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const res = await updateLogo(fd);
      setSettings(prev => ({ ...prev, logo_url: res.logo_url }));
      alert('Logo updated successfully!');
    } catch (err) {
      alert('Failed to upload logo: ' + err.message);
    } finally {
      setLogoUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav active="Menu" />
      {showAddModal && <AddItemModal onClose={() => setShowAddModal(false)} onSuccess={load} />}

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-dark">Menu Management</h1>
            <p className="text-muted text-sm mt-1">{items.length} items total</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2 rounded-xl"
          >
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>

        {/* Logo section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 flex items-center gap-5">
          <div className="h-20 w-20 rounded-2xl overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <UtensilsCrossed className="h-8 w-8 text-gray-300" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-dark">Restaurant Logo</h3>
            <p className="text-muted text-sm mt-0.5">Upload a new logo (shown in header & hero)</p>
            <button
              onClick={() => logoRef.current.click()}
              disabled={logoUploading}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
            >
              {logoUploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="h-4 w-4" /> Change Logo</>
              )}
            </button>
            <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </div>
        </div>

        {/* Menu Items */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(item => (
              <div key={item.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden ${!item.available ? 'opacity-60' : ''}`}>
                <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-dark text-sm line-clamp-1">{item.name}</h3>
                    <span className="text-sm font-black text-dark ml-2 shrink-0">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted line-clamp-2 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted mb-3">
                    <span className="capitalize bg-gray-100 px-2 py-0.5 rounded-full">{item.category}</span>
                    <span>{item.clicks} clicks · {item.orders_count} orders</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleAvailable(item)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        item.available
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {item.available ? <><Eye className="h-3.5 w-3.5" /> Visible</> : <><EyeOff className="h-3.5 w-3.5" /> Hidden</>}
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 text-primary hover:bg-red-100 transition-colors disabled:opacity-60"
                    >
                      {deletingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
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

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, LogOut, Menu, X
} from 'lucide-react';

function AdminSidebar({ active, isOpen, onClose }) {
  const router = useRouter();
  const links = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/menu', icon: UtensilsCrossed, label: 'Menu' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  ];
  const logout = () => { localStorage.removeItem('admin_token'); router.push('/admin/login'); };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-dark text-white transform transition-transform duration-300 z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static md:w-56`}>
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
            <Link 
              key={l.href} 
              href={l.href} 
              onClick={() => {
                // Close sidebar on mobile when menu item is clicked
                if (window.innerWidth < 768) {
                  onClose();
                }
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active === l.label ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
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
    </>
  );
}

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('');

  useEffect(() => {
    // Determine active page from URL
    const path = window.location.pathname;
    if (path.includes('/admin/dashboard')) setActivePage('Dashboard');
    else if (path.includes('/admin/menu')) setActivePage('Menu');
    else if (path.includes('/admin/orders')) setActivePage('Orders');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar active={activePage} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-bold text-dark">Admin Panel</h1>
          <div className="w-5" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Main content */}
      <main className="md:ml-56 min-h-screen">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

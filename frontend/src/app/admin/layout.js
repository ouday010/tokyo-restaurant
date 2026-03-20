'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, LogOut, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const logout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  const links = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/menu', icon: UtensilsCrossed, label: 'Menu' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  ];

  const sidebarStyle = isMobile ? {
    position: 'fixed', top: 0, left: sidebarOpen ? 0 : '-100%',
    height: '100%', width: '240px', zIndex: 50,
    transition: 'left 0.3s ease', backgroundColor: '#1a1a2e'
  } : {
    position: 'relative', width: '220px', minHeight: '100vh',
    backgroundColor: '#1a1a2e', flexShrink: 0
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      
      {/* Overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40
        }} />
      )}

      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={{ padding: '24px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#e74c3c', borderRadius: '8px', padding: '6px' }}>
            <UtensilsCrossed size={16} color="white" />
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 'bold', fontSize: '14px', margin: 0 }}>Tokyo H&T</p>
            <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>Admin Panel</p>
          </div>
        </div>
        <nav style={{ padding: '16px' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => isMobile && setSidebarOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', color: '#d1d5db', textDecoration: 'none', fontSize: '14px', marginBottom: '4px' }}>
              <l.icon size={16} /> {l.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', position: 'absolute', bottom: 0, width: '100%' }}>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', width: '100%' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {isMobile && (
          <header style={{ position: 'sticky', top: 0, backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 30 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <Menu size={22} />
            </button>
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Admin Panel</span>
          </header>
        )}
        <main style={{ padding: isMobile ? '16px' : '32px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}


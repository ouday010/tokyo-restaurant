'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, LogOut, Menu, X
} from 'lucide-react';

function AdminSidebar({ active, isOpen, onClose }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const links = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/menu', icon: UtensilsCrossed, label: 'Menu' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  ];
  const logout = () => { localStorage.removeItem('admin_token'); router.push('/admin/login'); };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Calculate sidebar styles based on mobile/desktop
  const getSidebarStyles = () => {
    if (isMobile) {
      return {
        position: 'fixed',
        left: isOpen ? '0' : '-100%',
        top: '0',
        height: '100%',
        width: '16rem', // 64 * 4 = 256px
        backgroundColor: '#1a1a1a', // bg-dark
        color: 'white',
        transition: 'left 0.3s ease-in-out',
        zIndex: 50,
        boxShadow: isOpen ? '4px 0 20px rgba(0,0,0,0.3)' : 'none',
      };
    } else {
      return {
        position: 'static',
        left: '0',
        top: '0',
        height: '100%',
        width: '14rem', // 56 * 4 = 224px
        backgroundColor: '#1a1a1a', // bg-dark
        color: 'white',
        zIndex: 'auto',
      };
    }
  };

  // Calculate overlay styles
  const getOverlayStyles = () => {
    if (!isMobile || !isOpen) return { display: 'none' };
    return {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 40,
    };
  };

  return (
    <>
      {/* Mobile overlay */}
      <div 
        style={getOverlayStyles()}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside style={getSidebarStyles()}>
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <div style={{
              height: '2rem',
              width: '2rem',
              borderRadius: '0.5rem',
              backgroundColor: '#D73A2E', // bg-primary
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <UtensilsCrossed style={{ height: '1rem', width: '1rem', color: 'white' }} />
            </div>
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '0.875rem', lineHeight: '1.25rem', margin: 0 }}>Tokyo H&T</p>
              <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0 }}>Admin Panel</p>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '1rem' }}>
          {links.map(l => (
            <Link 
              key={l.href} 
              href={l.href} 
              onClick={() => {
                // Close sidebar on mobile when menu item is clicked
                if (isMobile) {
                  onClose();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.75rem',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                color: active === l.label ? 'white' : '#d1d5db',
                backgroundColor: active === l.label ? '#D73A2E' : 'transparent',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                if (active !== l.label) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (active !== l.label) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#d1d5db';
                }
              }}
            >
              <l.icon style={{ height: '1rem', width: '1rem' }} />
              {l.label}
            </Link>
          ))}
        </nav>
        <div style={{
          padding: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <button 
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.625rem 0.75rem',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              backgroundColor: 'transparent',
              border: 'none',
              color: '#9ca3af',
              width: '100%',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            <LogOut style={{ height: '1rem', width: '1rem' }} />
            Logout
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
      <main className="md:ml-56 min-h-screen pt-16 md:pt-0">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

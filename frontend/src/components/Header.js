'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Menu, X, UtensilsCrossed } from 'lucide-react';
import { useCart } from './CartContext';
import Cart from './Cart';

export default function Header({ logoUrl }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { itemCount } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <UtensilsCrossed className="h-5 w-5 text-white" />
                </div>
              )}
              <span className="font-bold text-lg text-dark hidden sm:block leading-tight">
                Tokyo Healthy<br />
                <span className="text-primary text-sm font-semibold">& Tacos</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${
                    pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-dark hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right: Cart + Mobile Menu */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors duration-200"
                aria-label="Open cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-dark text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce-in">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {menuOpen && (
            <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-fade-in">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-dark hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      <Cart open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

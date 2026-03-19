'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Leaf, Zap, Heart, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FoodCard from '@/components/FoodCard';
import { getMenu, getSettings, trackVisit } from '@/lib/api';

export default function HomePage() {
  const [menu, setMenu] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackVisit('home');
    Promise.all([getMenu(), getSettings()])
      .then(([menuData, settingsData]) => {
        setMenu(menuData);
        setSettings(settingsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featured = menu.slice(0, 4);

  return (
    <div className="min-h-screen bg-bg-warm">
      <Header logoUrl={settings.logo_url} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Accent circles */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
            <Star className="h-4 w-4 text-accent fill-accent" />
            <span className="text-sm font-medium">Fresh Daily • Always Healthy</span>
          </div>

          {/* Logo + Name */}
          <div className="flex justify-center mb-6">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt="Tokyo Healthy & Tacos"
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white/20"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary flex items-center justify-center ring-4 ring-white/20">
                <span className="text-4xl">🍣</span>
              </div>
            )}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-4 leading-tight tracking-tight">
            Tokyo Healthy
            <span className="block text-primary">&amp; Tacos</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            {settings.tagline || 'Where Japanese health-food culture meets the bold spirit of Mexican tacos. Fresh, vibrant, and crafted with love.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/menu" className="btn-primary flex items-center gap-2 text-base px-8 py-4 rounded-2xl">
              Order Now
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#featured"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
            >
              See our menu
              <ChevronDown className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Features bar */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: <Leaf className="h-6 w-6 text-secondary" />, title: 'Always Fresh', desc: 'Locally sourced ingredients every day' },
              { icon: <Zap className="h-6 w-6 text-primary" />, title: 'Fast Delivery', desc: 'Order via WhatsApp, delivered hot' },
              { icon: <Heart className="h-6 w-6 text-rose-500" />, title: 'Made with Love', desc: 'Every dish crafted with passion' },
            ].map((feat) => (
              <div key={feat.title} className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="font-semibold text-dark">{feat.title}</h3>
                <p className="text-sm text-muted">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section id="featured" className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">Popular Picks</p>
            <h2 className="text-3xl sm:text-4xl font-black text-dark">Featured Items</h2>
          </div>
          <Link href="/menu" className="hidden sm:flex items-center gap-1 text-primary font-semibold text-sm hover:underline">
            View full menu <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-9 bg-gray-200 rounded-xl mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(item => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/menu" className="btn-outline inline-flex items-center gap-2">
            View Full Menu <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-dark text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">🌮🍣</div>
          <h2 className="text-3xl sm:text-4xl font-black mb-4">Ready to Order?</h2>
          <p className="text-gray-300 text-lg mb-8">
            Browse our full menu, add to cart, and place your order in seconds. We&apos;ll confirm via WhatsApp!
          </p>
          <Link href="/menu" className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base">
            Browse Menu <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

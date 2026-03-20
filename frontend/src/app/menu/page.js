'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FoodCard from '@/components/FoodCard';
import { getMenu, getSettings, trackVisit } from '@/lib/api';

const CATEGORIES = ['all', 'bowl', 'taco', 'side', 'drink'];
const CATEGORY_LABELS = { all: 'All Items', bowl: 'Bowls', taco: 'Tacos', side: 'Sides', drink: 'Drinks' };

export default function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [settings, setSettings] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackVisit('menu');
    Promise.all([getMenu(), getSettings()])
      .then(([menuData, settingsData]) => {
        setMenu(menuData);
        setSettings(settingsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = menu.filter(item => {
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const categories = CATEGORIES.filter(c => c === 'all' || menu.some(i => i.category === c));

  return (
    <div className="min-h-screen bg-bg-warm">
      <Header logoUrl={settings.logo_url} />

      {/* Page Hero */}
      <div className="bg-dark text-white pt-28 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2">What we&apos;re serving</p>
          <h1 className="text-4xl sm:text-5xl font-black mb-3">Our Menu</h1>
          <p className="text-gray-300 max-w-xl">
            Fresh Japanese-inspired bowls, bold tacos, tasty sides & refreshing drinks — all made with premium ingredients.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Category tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 flex-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-dark hover:bg-gray-200'
                }`}
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-56 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-9 bg-gray-200 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-dark">No items found</h3>
            <p className="text-muted mt-2">Try a different category or search term</p>
            <button
              onClick={() => { setActiveCategory('all'); setSearch(''); }}
              className="btn-primary mt-6 text-sm"
            >
              Show all items
            </button>
          </div>
        ) : (
          <>
            <p className="text-muted text-sm mb-6">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(item => (
                <FoodCard key={item.id} item={item} />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

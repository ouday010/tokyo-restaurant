import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_FILE = join(__dirname, 'db.json');

// ─── Load from disk (sync, runs once at startup) ──────────────────────────────

function load() {
  if (!existsSync(DB_FILE)) return null;
  try {
    return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

const data = load() ?? {
  food_items: [],
  orders: [],
  visits: [],
  settings: {},
};

// ─── Ensure all collections exist (safe after deploys) ───────────────────────

data.food_items ??= [];
data.orders     ??= [];
data.visits     ??= [];
data.settings   ??= {};

const s = data.settings;
s.logo_url          ??= '';
s.logo_public_id    ??= '';
s.restaurant_name   ??= 'Tokyo Healthy & Tacos';
s.tagline           ??= 'Fresh, Healthy & Utterly Delicious';

// ─── Seed demo items on first run ────────────────────────────────────────────

if (data.food_items.length === 0) {
  const now = new Date().toISOString();
  data.food_items = [
    { id: 1,  name: 'Salmon Poke Bowl',      description: 'Fresh Atlantic salmon, creamy avocado, cucumber, edamame, and pickled ginger over seasoned sushi rice',                  price: 14.99, image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80', image_public_id: '', category: 'bowl',  clicks: 0, orders_count: 0, available: true, created_at: now },
    { id: 2,  name: 'Veggie Taco',            description: 'Roasted seasonal vegetables, black beans, pico de gallo, salsa verde, and lime crema in warm corn tortillas',             price:  8.99, image_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80', image_public_id: '', category: 'taco',  clicks: 0, orders_count: 0, available: true, created_at: now },
    { id: 3,  name: 'Chicken Teriyaki Bowl',  description: 'Grilled free-range chicken thighs glazed in house-made teriyaki, steamed broccoli, carrots, and jasmine rice',           price: 12.99, image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80', image_public_id: '', category: 'bowl',  clicks: 0, orders_count: 0, available: true, created_at: now },
    { id: 4,  name: 'Spicy Tuna Taco',        description: 'Premium spicy tuna tartare, sliced avocado, sriracha aioli, sesame seeds, and crispy wontons',                           price: 11.99, image_url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&q=80', image_public_id: '', category: 'taco',  clicks: 0, orders_count: 0, available: true, created_at: now },
    { id: 5,  name: 'Tofu Miso Bowl',         description: 'Silken tofu, wakame seaweed, shiitake mushrooms, green onions in rich miso broth over brown rice',                       price: 10.99, image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80', image_public_id: '', category: 'bowl',  clicks: 0, orders_count: 0, available: true, created_at: now },
    { id: 6,  name: 'Shrimp Taco',            description: 'Grilled tiger shrimp, mango salsa, chipotle mayo, shredded purple cabbage, and fresh cilantro',                          price: 10.99, image_url: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=600&q=80', image_public_id: '', category: 'taco',  clicks: 0, orders_count: 0, available: true, created_at: now },
    { id: 7,  name: 'Edamame',                description: 'Steamed organic edamame pods lightly salted with sea salt and a drizzle of sesame oil',                                  price:  4.99, image_url: 'https://images.unsplash.com/photo-1563699409-38a2cde648dc?w=600&q=80', image_public_id: '', category: 'side',  clicks: 0, orders_count: 0, available: true, created_at: now },
    { id: 8,  name: 'Matcha Lemonade',        description: 'Ceremonial grade matcha, fresh-squeezed lemon juice, honey syrup, and sparkling water over ice',                         price:  5.99, image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80', image_public_id: '', category: 'drink', clicks: 0, orders_count: 0, available: true, created_at: now },
    { id: 9,  name: 'Gyoza (6 pcs)',          description: 'Pan-fried pork and cabbage dumplings served with house ponzu dipping sauce',                                              price:  7.99, image_url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=80', image_public_id: '', category: 'side',  clicks: 0, orders_count: 0, available: true, created_at: now },
    { id: 10, name: 'Japanese Iced Tea',      description: 'Cold-brewed sencha green tea, yuzu juice, and a touch of honey — refreshing and antioxidant-rich',                       price:  4.49, image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80', image_public_id: '', category: 'drink', clicks: 0, orders_count: 0, available: true, created_at: now },
  ];
}

// ─── Persist initial state ────────────────────────────────────────────────────

writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// ─── db object — same API the routes already use ─────────────────────────────

const db = {
  data,
  /** Persist current in-memory state to db.json. Returns a resolved Promise
   *  so routes can still do `await db.write()` unchanged. */
  write() {
    writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
    return Promise.resolve();
  },
};

/** Returns the next integer ID for a given collection array. */
export function nextId(collection) {
  if (collection.length === 0) return 1;
  return Math.max(...collection.map(i => i.id)) + 1;
}

export default db;

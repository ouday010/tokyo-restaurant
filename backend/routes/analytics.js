import express from 'express';
import db, { nextId } from '../database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function dateStrDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// POST /api/analytics/visit — track visit (public)
router.post('/visit', async (req, res) => {
  const { page } = req.body;
  db.data.visits.push({
    id:         nextId(db.data.visits),
    page:       page || 'home',
    date:       todayStr(),
    created_at: new Date().toISOString(),
  });
  await db.write();
  res.json({ success: true });
});

// GET /api/analytics/stats — dashboard stats (admin)
router.get('/stats', authMiddleware, (req, res) => {
  const today  = todayStr();
  const cutoff = dateStrDaysAgo(6);

  const visitsToday = db.data.visits.filter(v => v.date === today).length;

  const nonCancelledOrders = db.data.orders.filter(o => o.status !== 'cancelled');
  const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + o.total, 0);

  // Top items ranked by (clicks + orders_count * 3)
  const topItems = [...db.data.food_items]
    .map(i => ({ ...i, score: i.clicks + i.orders_count * 3 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ score, ...i }) => i);

  // Recent orders (newest first, max 10)
  const recentOrders = [...db.data.orders]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 10);

  // Orders grouped by status
  const statusMap = db.data.orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const ordersByStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

  // Visits per day for last 7 days
  const dayMap = db.data.visits
    .filter(v => v.date >= cutoff)
    .reduce((acc, v) => {
      acc[v.date] = (acc[v.date] || 0) + 1;
      return acc;
    }, {});
  const visitsLast7Days = Object.entries(dayMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  res.json({
    visits_today:         visitsToday,
    total_orders:         db.data.orders.length,
    total_revenue:        totalRevenue,
    top_items:            topItems,
    recent_orders:        recentOrders,
    orders_by_status:     ordersByStatus,
    visits_last_7_days:   visitsLast7Days,
    total_menu_items:     db.data.food_items.length,
    available_menu_items: db.data.food_items.filter(i => i.available).length,
  });
});

export default router;

import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import db, { nextId } from '../database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

async function sendWhatsAppNotification(order_id, guest_name, guest_phone, items, total) {
  console.log('=== WhatsApp Notification Function Called ===');
  console.log('Order ID:', order_id);
  console.log('Customer:', guest_name);
  console.log('Phone:', guest_phone);
  console.log('Total:', total);
  
  const itemsList = items
    .map(i => `- ${i.name} x${i.quantity} = $${(i.price * i.quantity).toFixed(2)}`)
    .join('\n');

  const message =
    `New Order #${order_id}\n` +
    `Customer: ${guest_name}\n` +
    `Phone: ${guest_phone}\n` +
    `Items:\n${itemsList}\n` +
    `Total: $${total.toFixed(2)}\n`;

  console.log('Message to send:', message);

  const instanceId = process.env.ULTRAMSG_INSTANCE_ID;
  const token      = process.env.ULTRAMSG_TOKEN;
  const to         = process.env.NOTIFICATION_PHONE || '+21623442822';

  console.log('=== UltraMsg Configuration ===');
  console.log('ULTRAMSG_INSTANCE_ID:', instanceId);
  console.log('ULTRAMSG_TOKEN:', token ? 'TOKEN_SET' : 'TOKEN_NOT_SET');
  console.log('NOTIFICATION_PHONE:', to);

  if (!instanceId || !token) {
    console.warn('ULTRAMSG_INSTANCE_ID or ULTRAMSG_TOKEN not set — skipping WhatsApp notification');
    return;
  }

  const apiUrl = `https://api.ultramsg.com/${instanceId}/messages/chat`;
  const requestBody = new URLSearchParams({ token, to, body: message });

  console.log('=== UltraMsg API Call ===');
  console.log('URL:', apiUrl);
  console.log('Request Body:', requestBody.toString());
  console.log('Headers:', { 'Content-Type': 'application/x-www-form-urlencoded' });

  try {
    const response = await axios.post(
      apiUrl,
      requestBody.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000,
      }
    );
    
    console.log('=== UltraMsg Response ===');
    console.log('Status:', response.status);
    console.log('Response data:', response.data);
    console.log('WhatsApp notification sent successfully');
  } catch (error) {
    console.log('=== UltraMsg Error ===');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error config:', error.config);
    }
  }
}

// POST /api/orders — create order (public)
router.post('/', async (req, res) => {
  try {
    const { guest_name, guest_phone, items } = req.body;

    if (!guest_name || !guest_phone || !items || items.length === 0) {
      return res.status(400).json({ error: 'guest_name, guest_phone and items are required' });
    }

    const order_id = 'THT-' + uuidv4().substring(0, 8).toUpperCase();
    const total    = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = {
      id:          nextId(db.data.orders),
      order_id,
      guest_name,
      guest_phone,
      items,        // stored as native array (no JSON.stringify needed)
      total,
      status:      'pending',
      created_at:  new Date().toISOString(),
    };

    db.data.orders.push(newOrder);

    // Increment orders_count on each purchased food item
    items.forEach(ordered => {
      const foodItem = db.data.food_items.find(i => i.id === ordered.id);
      if (foodItem) foodItem.orders_count += ordered.quantity;
    });

    await db.write();

    try {
      await sendWhatsAppNotification(order_id, guest_name, guest_phone, items, total);
    } catch (whatsappError) {
      console.error('WhatsApp notification failed:', whatsappError.message);
    }

    res.status(201).json({ success: true, order_id, order: newOrder });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders — all orders (admin)
router.get('/', authMiddleware, (req, res) => {
  const orders = [...db.data.orders].sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json(orders);
});

// GET /api/orders/:order_id — single order (public, for confirmation page)
router.get('/:order_id', (req, res) => {
  const order = db.data.orders.find(o => o.order_id === req.params.order_id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// PATCH /api/orders/:order_id/status — update status (admin)
router.patch('/:order_id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

  if (!valid.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${valid.join(', ')}` });
  }

  const order = db.data.orders.find(o => o.order_id === req.params.order_id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.status = status;
  await db.write();

  res.json(order);
});

export default router;

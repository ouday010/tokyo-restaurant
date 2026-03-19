import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import db, { nextId } from '../database.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function uploadToCloudinary(buffer, options) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    }).end(buffer);
  });
}

// GET /api/menu — public
router.get('/', (req, res) => {
  const items = db.data.food_items
    .filter(i => i.available)
    .sort((a, b) => a.category.localeCompare(b.category) || b.created_at.localeCompare(a.created_at));
  res.json(items);
});

// GET /api/menu/all — admin only
router.get('/all', authMiddleware, (req, res) => {
  const items = [...db.data.food_items].sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json(items);
});

// POST /api/menu/:id/click — track click (public)
router.post('/:id/click', async (req, res) => {
  const id = parseInt(req.params.id);
  const item = db.data.food_items.find(i => i.id === id);
  if (item) {
    item.clicks++;
    await db.write();
  }
  res.json({ success: true });
});

// POST /api/menu — add new item (admin)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    let image_url = '';
    let image_public_id = '';

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'tokyo-restaurant/menu',
        transformation: [{ width: 800, height: 600, crop: 'fill', gravity: 'center' }],
      });
      image_url = result.secure_url;
      image_public_id = result.public_id;
    }

    const newItem = {
      id:             nextId(db.data.food_items),
      name,
      description:    description || '',
      price:          parseFloat(price),
      image_url,
      image_public_id,
      category:       category || 'main',
      clicks:         0,
      orders_count:   0,
      available:      true,
      created_at:     new Date().toISOString(),
    };

    db.data.food_items.push(newItem);
    await db.write();

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ error: 'Failed to add menu item' });
  }
});

// PATCH /api/menu/:id — update item (admin)
router.patch('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = db.data.food_items.find(i => i.id === id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const { name, description, price, category, available } = req.body;

    if (req.file) {
      if (item.image_public_id) {
        try { await cloudinary.uploader.destroy(item.image_public_id); } catch (e) {}
      }
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'tokyo-restaurant/menu',
        transformation: [{ width: 800, height: 600, crop: 'fill', gravity: 'center' }],
      });
      item.image_url = result.secure_url;
      item.image_public_id = result.public_id;
    }

    if (name        !== undefined) item.name        = name;
    if (description !== undefined) item.description = description;
    if (price       !== undefined) item.price       = parseFloat(price);
    if (category    !== undefined) item.category    = category;
    if (available   !== undefined) item.available   = available === 'true' || available === true;

    await db.write();
    res.json(item);
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// DELETE /api/menu/:id — admin
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = db.data.food_items.findIndex(i => i.id === id);
    if (index === -1) return res.status(404).json({ error: 'Item not found' });

    const [item] = db.data.food_items.splice(index, 1);

    if (item.image_public_id) {
      try { await cloudinary.uploader.destroy(item.image_public_id); } catch (e) {}
    }

    await db.write();
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

export default router;

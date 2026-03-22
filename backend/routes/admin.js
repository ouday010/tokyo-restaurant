import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import db from '../database.js';
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

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Read admin credentials from admin.json file
  const fs = require('fs');
  const path = require('path');
  const adminFile = path.join(__dirname, '../data/admin.json');
  
  let adminCredentials;
  try {
    adminCredentials = JSON.parse(fs.readFileSync(adminFile, 'utf-8'));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load admin credentials' });
  }

  if (username !== adminCredentials.username || password !== adminCredentials.password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { username, role: 'admin' },
    process.env.JWT_SECRET || 'fallback_secret_change_me',
    { expiresIn: '24h' }
  );

  res.json({ token, message: 'Login successful' });
});

// GET /api/admin/settings — public (needed by frontend for logo/name)
router.get('/settings', (req, res) => {
  res.json(db.data.settings);
});

// POST /api/admin/change-password — protected
router.post('/change-password', authMiddleware, async (req, res) => {
  console.log('Change password route called');
  console.log('JWT_SECRET:', process.env.JWT_SECRET || 'fallback_secret_change_me');
  console.log('Admin from token:', req.admin);
  
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  // Read admin credentials from admin.json file
  const fs = require('fs');
  const path = require('path');
  const adminFile = path.join(__dirname, '../data/admin.json');
  
  let adminCredentials;
  try {
    adminCredentials = JSON.parse(fs.readFileSync(adminFile, 'utf-8'));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load admin credentials' });
  }

  if (currentPassword !== adminCredentials.password) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  // Update the password in admin.json file
  try {
    adminCredentials.password = newPassword;
    fs.writeFileSync(adminFile, JSON.stringify(adminCredentials, null, 2));
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update password' });
  }

  res.json({ message: 'Password changed successfully' });
});

// POST /api/admin/logo — protected
router.post('/logo', authMiddleware, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Delete old logo from Cloudinary if one exists
    if (db.data.settings.logo_public_id) {
      try {
        await cloudinary.uploader.destroy(db.data.settings.logo_public_id);
      } catch (e) {
        console.error('Failed to delete old logo:', e.message);
      }
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'tokyo-restaurant/logo',
          transformation: [{ width: 400, height: 400, crop: 'fit' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    db.data.settings.logo_url       = result.secure_url;
    db.data.settings.logo_public_id = result.public_id;
    await db.write();

    res.json({ logo_url: result.secure_url, message: 'Logo updated successfully' });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

export default router;

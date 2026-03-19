# Tokyo Healthy & Tacos — Full Stack Restaurant Website

A complete restaurant website with customer ordering, WhatsApp notifications, and an admin panel.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | Next.js 14 + Tailwind CSS           |
| Backend   | Node.js + Express                   |
| Database  | SQLite (via better-sqlite3)         |
| Images    | Cloudinary (free tier)              |
| WhatsApp  | CallMeBot API (free, no account)    |
| Hosting   | Vercel (frontend) + Railway (backend) |

---

## Project Structure

```
Tokyo/
├── frontend/          # Next.js app
│   ├── src/
│   │   ├── app/       # Pages (Next.js App Router)
│   │   ├── components/
│   │   └── lib/api.js
│   ├── .env.example
│   └── package.json
├── backend/           # Express API
│   ├── routes/
│   ├── middleware/
│   ├── database.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Local Development Setup

### 1. Get API Keys (Before Starting)

#### Cloudinary (Free)
1. Sign up at https://cloudinary.com
2. Go to Dashboard → copy **Cloud Name**, **API Key**, **API Secret**

#### CallMeBot WhatsApp API (Free)
1. Add the number **+34 644 59 32 40** to your WhatsApp contacts as "CallMeBot"
2. Send this message to that contact: `I allow callmebot to send me messages`
3. You'll receive your API key by WhatsApp within ~2 minutes
4. The phone number to receive notifications is already set to `+21623442822`

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
JWT_SECRET=some_long_random_string_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tokyo2024
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CALLMEBOT_PHONE=+21623442822
CALLMEBOT_API_KEY=your_callmebot_key
FRONTEND_URL=http://localhost:3000
```

```bash
# Start development server
npm run dev

# The API will be at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy and fill in environment variables
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

---

## Admin Panel

- URL: `http://localhost:3000/admin/login`
- Default credentials: `admin` / `tokyo2024`
- **Change these** in `backend/.env` before deploying!

### Admin Features
- **Dashboard**: Visitors today, total orders, revenue, top items, recent orders
- **Menu Management**: Add/delete/hide items, upload photos to Cloudinary, change logo
- **Orders**: View all orders, update order status (pending → confirmed → preparing → ready → delivered)

---

## Deployment

### Backend → Railway

1. Push your code to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub repo
3. Select the `backend` folder (or set the root directory to `backend`)
4. Add all environment variables from `.env.example` in Railway's Variables tab
5. Set `FRONTEND_URL` to your Vercel frontend URL (you'll get this after deploying frontend)
6. Railway auto-detects Node.js and runs `npm start`
7. Copy your Railway backend URL (e.g. `https://your-app.railway.app`)

**Important**: Railway needs the `start` script. It's already set in `package.json`.

---

### Frontend → Vercel

1. Push your code to GitHub
2. Go to https://vercel.com → New Project → Import your repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = your Railway backend URL (e.g. `https://your-app.railway.app`)
5. Deploy!

**After deployment**:
- Go back to Railway → update `FRONTEND_URL` to your Vercel URL
- This fixes CORS for the deployed version

---

### Railway — Setting Root Directory

If your repo has both `frontend/` and `backend/`, configure Railway to only deploy the backend:

In Railway project settings:
- **Root Directory**: `backend`
- **Start Command**: `npm start`

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (Railway sets this automatically) |
| `JWT_SECRET` | Secret for signing admin JWT tokens |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| `CALLMEBOT_PHONE` | WhatsApp number to receive order notifications |
| `CALLMEBOT_API_KEY` | From CallMeBot (sent to you via WhatsApp) |
| `FRONTEND_URL` | Your Vercel URL (for CORS) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL |

---

## API Reference

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/menu` | Get all available menu items |
| POST | `/api/menu/:id/click` | Track item click |
| POST | `/api/orders` | Create a new order + send WhatsApp |
| GET | `/api/orders/:order_id` | Get single order (for confirmation page) |
| POST | `/api/analytics/visit` | Track page visit |
| GET | `/api/admin/settings` | Get public settings (logo URL, etc.) |

### Admin Endpoints (require Bearer token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Login, returns JWT |
| POST | `/api/admin/logo` | Upload new restaurant logo |
| GET | `/api/menu/all` | Get all items (including hidden) |
| POST | `/api/menu` | Add new menu item (multipart/form-data) |
| PATCH | `/api/menu/:id` | Update menu item |
| DELETE | `/api/menu/:id` | Delete menu item |
| GET | `/api/orders` | Get all orders |
| PATCH | `/api/orders/:id/status` | Update order status |
| GET | `/api/analytics/stats` | Dashboard statistics |

---

## Features

### Customer Side
- Beautiful homepage with hero, featured items, features section
- Full menu page with category filter tabs and search
- Cart drawer (persisted to localStorage)
- Checkout form: name + WhatsApp number
- WhatsApp notification sent to restaurant on order
- Order confirmation page with status display

### Admin Panel
- Login with JWT authentication
- Dashboard: daily visitors, total orders, revenue, top items by engagement
- Menu manager: add items with photo upload, hide/show, delete
- Logo manager: change restaurant logo (stored on Cloudinary)
- Orders view: all orders with inline status update dropdown

---

## Database Schema

SQLite tables auto-created on first run:

- **food_items**: id, name, description, price, image_url, category, clicks, orders_count, available
- **orders**: id, order_id, guest_name, guest_phone, items (JSON), total, status
- **visits**: id, page, date
- **settings**: key, value (logo_url, restaurant_name, tagline)

---

## Troubleshooting

**WhatsApp not sending?**
- Make sure you sent the activation message to CallMeBot first
- Verify `CALLMEBOT_API_KEY` and `CALLMEBOT_PHONE` in `.env`
- WhatsApp failure does NOT fail the order — it logs a warning

**Images not showing?**
- Check Cloudinary credentials in `.env`
- Ensure `next.config.mjs` has `res.cloudinary.com` in `remotePatterns`

**CORS errors in production?**
- Update `FRONTEND_URL` in Railway to your exact Vercel URL

**Admin token expired?**
- Tokens expire after 24 hours — log in again
- Check `JWT_SECRET` is set in `.env`

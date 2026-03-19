const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ─── Public API ────────────────────────────────────────────────────────────────

export async function getMenu() {
  const res = await fetch(`${BASE_URL}/api/menu`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch menu');
  return res.json();
}

export async function trackClick(id) {
  try {
    await fetch(`${BASE_URL}/api/menu/${id}/click`, { method: 'POST' });
  } catch (e) { /* silent */ }
}

export async function trackVisit(page) {
  try {
    await fetch(`${BASE_URL}/api/analytics/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page }),
    });
  } catch (e) { /* silent */ }
}

export async function createOrder(orderData) {
  console.log('Creating order with data:', orderData);
  console.log('API URL:', `${BASE_URL}/api/orders`);
  
  try {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    
    console.log('Response status:', res.status);
    console.log('Response headers:', Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Order creation failed:', err);
      throw new Error(err.error || 'Failed to create order');
    }
    
    const result = await res.json();
    console.log('Order created successfully:', result);
    return result;
  } catch (error) {
    console.error('Network error during order creation:', error);
    throw error;
  }
}

export async function getOrder(orderId) {
  const res = await fetch(`${BASE_URL}/api/orders/${orderId}`);
  if (!res.ok) throw new Error('Order not found');
  return res.json();
}

export async function getSettings() {
  const res = await fetch(`${BASE_URL}/api/admin/settings`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

// ─── Admin API ─────────────────────────────────────────────────────────────────

function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('admin_token') || '';
}

function authHeaders(json = true) {
  const h = { Authorization: `Bearer ${getToken()}` };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

export async function adminLogin(username, password) {
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Login failed');
  }
  return res.json();
}

export async function getAdminStats() {
  const res = await fetch(`${BASE_URL}/api/analytics/stats`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function getAllMenuItems() {
  const res = await fetch(`${BASE_URL}/api/menu/all`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch menu');
  return res.json();
}

export async function addMenuItem(formData) {
  const res = await fetch(`${BASE_URL}/api/menu`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to add item');
  }
  return res.json();
}

export async function updateMenuItem(id, formData) {
  const res = await fetch(`${BASE_URL}/api/menu/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to update item');
  return res.json();
}

export async function deleteMenuItem(id) {
  const res = await fetch(`${BASE_URL}/api/menu/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete item');
  return res.json();
}

export async function getAllOrders() {
  const res = await fetch(`${BASE_URL}/api/orders`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${BASE_URL}/api/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
}

export async function updateLogo(formData) {
  const res = await fetch(`${BASE_URL}/api/admin/logo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to update logo');
  return res.json();
}

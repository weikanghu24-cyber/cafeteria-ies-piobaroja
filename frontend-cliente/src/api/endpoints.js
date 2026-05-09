import { api } from './client';

// ===== AUTH =====
export const authApi = {
  register: (data) => api.post('/auth/registration/', data),
  login: (data) => api.post('/auth/login/', data),
  googleLogin: (accessToken) => api.post('/auth/google/', { access_token: accessToken }),
  logout: () => api.post('/auth/logout/'),
  me: () => api.get('/auth/user/'),
};

// ===== PRODUCTS =====
export const productsApi = {
  list: (params) => api.get('/products/', { params }),
  detail: (id) => api.get(`/products/${id}/`),
  categories: () => api.get('/products/categories/'),
};

// ===== TIMESLOTS =====
export const timeslotsApi = {
  disponibles: () => api.get('/timeslots/disponibles/'),
  list: (params) => api.get('/timeslots/', { params }),
};

// ===== ORDERS =====
export const ordersApi = {
  list: (params) => api.get('/orders/', { params }),
  detail: (id) => api.get(`/orders/${id}/`),
  create: (data) => api.post('/orders/', data),
  cancel: (id) => api.post(`/orders/${id}/cancelar/`),
  qr: (id) => api.get(`/orders/${id}/qr/`),
};

// ===== PAYMENTS =====
export const paymentsApi = {
  config: () => api.get('/payments/config/'),
  createIntent: (orderId) => api.post('/payments/create-intent/', { order_id: orderId }),
  confirm: (paymentIntentId) =>
    api.post('/payments/confirm/', { payment_intent_id: paymentIntentId }),
};

// ===== NOTIFICATIONS =====
export const notificationsApi = {
  list: (params) => api.get('/notifications/', { params }),
  unreadCount: () => api.get('/notifications/no-leidas-count/'),
  markRead: (id) => api.post(`/notifications/${id}/marcar-leida/`),
  markAllRead: () => api.post('/notifications/marcar-todas-leidas/'),
};

// ===== FAVORITES =====
export const favoritesApi = {
  list: () => api.get('/auth/favorites/'),
  toggle: (productId) => api.post(`/auth/favorites/toggle/${productId}/`),
};

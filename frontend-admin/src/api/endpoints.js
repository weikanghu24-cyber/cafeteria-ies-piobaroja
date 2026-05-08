import { api } from './client';

// ===== AUTH =====
export const authApi = {
  login: (data) => api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/'),
  me: () => api.get('/auth/user/'),
};

// ===== ADMIN ORDERS (panel principal) =====
export const adminOrdersApi = {
  list: (params) => api.get('/orders/admin/', { params }),
  detail: (id) => api.get(`/orders/admin/${id}/`),
  cambiarEstado: (id, estado) =>
    api.post(`/orders/admin/${id}/cambiar-estado/`, { estado }),
  porCodigo: (codigo) => api.get(`/orders/admin/por-codigo/${codigo}/`),
  dashboard: () => api.get('/orders/admin/dashboard/'),
};

// ===== ADMIN PRODUCTS =====
export const adminProductsApi = {
  list: (params) => api.get('/products/', { params }),
  detail: (id) => api.get(`/products/${id}/`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.patch(`/products/${id}/`, data),
  delete: (id) => api.delete(`/products/${id}/`),
  categories: () => api.get('/products/categories/'),
  createCategory: (data) => api.post('/products/categories/', data),
};

// ===== ADMIN TIMESLOTS =====
export const adminTimeslotsApi = {
  list: (params) => api.get('/timeslots/', { params }),
  detail: (id) => api.get(`/timeslots/${id}/`),
  create: (data) => api.post('/timeslots/', data),
  update: (id, data) => api.patch(`/timeslots/${id}/`, data),
  delete: (id) => api.delete(`/timeslots/${id}/`),
};

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('token', data.data.token);
          original.headers.Authorization = `Bearer ${data.data.token}`;
          return api(original);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; role: string }) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: FormData) =>
    api.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const listingsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/listings', { params }),
  getById: (id: string) =>
    api.get(`/listings/${id}`),
  create: (data: FormData) =>
    api.post('/listings', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) =>
    api.put(`/listings/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) =>
    api.delete(`/listings/${id}`),
  getMyListings: () =>
    api.get('/listings/my'),
  getFavorites: () =>
    api.get('/listings/favorites'),
  toggleFavorite: (id: string) =>
    api.post(`/listings/${id}/favorite`),
};

export const chatsApi = {
  getAll: () => api.get('/chats'),
  getById: (id: string) => api.get(`/chats/${id}`),
  startChat: (listingId: string) => api.post('/chats', { listingId }),
  getMessages: (chatId: string, page = 1) =>
    api.get(`/chats/${chatId}/messages`, { params: { page } }),
  sendMessage: (chatId: string, text: string) =>
    api.post(`/chats/${chatId}/messages`, { text }),
};

export const historyApi = {
  getAll: () => api.get('/history'),
  clear: () => api.delete('/history'),
};

export const reviewsApi = {
  getForLandlord: (landlordId: string) =>
    api.get(`/reviews/landlord/${landlordId}`),
  create: (data: { landlordId: string; listingId?: string; rating: number; comment?: string }) =>
    api.post('/reviews', data),
  delete: (id: string) =>
    api.delete(`/reviews/${id}`),
};

export default api;

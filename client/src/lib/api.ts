import axios from 'axios';
import type { User, OrderBook, Order, Trade } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser = (data: { email: string; username: string; password: string }) =>
  api.post<{ message: string }>('/api/auth/register', data);

export const loginUser = (data: { username: string; password: string }) =>
  api.post<{ message: string; token: string }>('/api/auth/login', data);

export const getMe = () =>
  api.get<User>('/api/auth/me');

// Orders
export const getOrderBook = () =>
  api.get<OrderBook>('/api/orders');

export const placeOrder = (data: { side: string; price: number; quantity: number }) =>
  api.post<{ order: Order; trade: Trade | null }>('/api/orders', data);

export const getMyOrders = () =>
  api.get<Order[]>('/api/orders/mine');

export const cancelOrder = (id: string) =>
  api.delete<{ message: string }>(`/api/orders/${id}`);

// Trades
export const getTrades = (limit = 20, offset = 0) =>
  api.get<Trade[]>(`/api/trades?limit=${limit}&offset=${offset}`);

export const getMyTrades = () =>
  api.get<Trade[]>('/api/trades/mine');

// Profile
export const getProfile = () =>
  api.get<User>('/api/profile');

export const updateProfile = (data: { displayName: string }) =>
  api.patch<User>('/api/profile', data);

export default api;

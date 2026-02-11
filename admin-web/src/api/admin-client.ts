import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1/admin';

export const adminApi = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Auth interceptor
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export async function getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<{ users: unknown[]; total: number }> {
  const { data } = await adminApi.get('/users', { params });
  return data;
}

export async function getUser(userId: string): Promise<unknown> {
  const { data } = await adminApi.get(`/users/${userId}`);
  return data;
}

export async function suspendUser(userId: string, reason: string): Promise<void> {
  await adminApi.post(`/users/${userId}/suspend`, { reason });
}

export async function getGames(params?: { page?: number; userId?: string }): Promise<{ games: unknown[]; total: number }> {
  const { data } = await adminApi.get('/games', { params });
  return data;
}

export async function getPartners(): Promise<{ partners: unknown[] }> {
  const { data } = await adminApi.get('/partners');
  return data;
}

export async function getAnalytics(period: string): Promise<unknown> {
  const { data } = await adminApi.get('/analytics', { params: { period } });
  return data;
}

export async function getAntiCheatFlags(): Promise<{ flags: unknown[] }> {
  const { data } = await adminApi.get('/anti-cheat/flags');
  return data;
}

export async function getSystemHealth(): Promise<{
  services: Array<{ name: string; status: string; latency: number }>;
  database: { status: string; connections: number };
  cache: { status: string; hitRate: number };
}> {
  const { data } = await adminApi.get('/health');
  return data;
}

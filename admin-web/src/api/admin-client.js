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
export async function getUsers(params) {
    const { data } = await adminApi.get('/users', { params });
    return data;
}
export async function getUser(userId) {
    const { data } = await adminApi.get(`/users/${userId}`);
    return data;
}
export async function suspendUser(userId, reason) {
    await adminApi.post(`/users/${userId}/suspend`, { reason });
}
export async function getGames(params) {
    const { data } = await adminApi.get('/games', { params });
    return data;
}
export async function getPartners() {
    const { data } = await adminApi.get('/partners');
    return data;
}
export async function getAnalytics(period) {
    const { data } = await adminApi.get('/analytics', { params: { period } });
    return data;
}
export async function getAntiCheatFlags() {
    const { data } = await adminApi.get('/anti-cheat/flags');
    return data;
}
export async function getSystemHealth() {
    const { data } = await adminApi.get('/health');
    return data;
}

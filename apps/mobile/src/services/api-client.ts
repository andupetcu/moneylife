import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

import type {
  GameState,
  GameAction,
  GameActionResult,
  DecisionCard,
  Transaction,
  Badge,
  RewardCatalogItem,
  AuthTokens,
} from '@moneylife/shared-types';
import type { MonthlyReport } from '@moneylife/shared-types';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

const TOKEN_KEY = 'moneylife_access_token';
const REFRESH_KEY = 'moneylife_refresh_token';

/** Offline action queue — persisted to WatermelonDB in production */
let offlineQueue: Array<{ gameId: string; action: GameAction }> = [];

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: `${API_URL}/api/v1`,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  // Auth interceptor — attach access token
  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor — handle 401 refresh
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const original = error.config;
      if (error.response?.status === 401 && original && !(original as Record<string, unknown>)._retry) {
        (original as Record<string, unknown>)._retry = true;
        try {
          const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
          if (refreshToken) {
            const { data } = await axios.post<AuthTokens>(`${API_URL}/api/v1/auth/refresh`, {
              refreshToken,
            });
            await SecureStore.setItemAsync(TOKEN_KEY, data.accessToken);
            await SecureStore.setItemAsync(REFRESH_KEY, data.refreshToken);
            if (original.headers) {
              original.headers.Authorization = `Bearer ${data.accessToken}`;
            }
            return client(original);
          }
        } catch {
          // Refresh failed — force logout
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          await SecureStore.deleteItemAsync(REFRESH_KEY);
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
}

const client = createApiClient();

// ---- Auth API ----

export async function login(email: string, password: string): Promise<{ user: Record<string, unknown>; tokens: AuthTokens }> {
  const { data } = await client.post('/auth/login', { email, password });
  await SecureStore.setItemAsync(TOKEN_KEY, data.tokens.accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, data.tokens.refreshToken);
  return data;
}

export async function register(email: string, password: string, displayName: string): Promise<{ user: Record<string, unknown>; tokens: AuthTokens }> {
  const { data } = await client.post('/auth/register', { email, password, displayName });
  await SecureStore.setItemAsync(TOKEN_KEY, data.tokens.accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, data.tokens.refreshToken);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await client.post('/auth/logout');
  } finally {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  }
}

// ---- Game API ----

export async function createGame(request: {
  persona: string;
  region: string;
  currency: string;
  difficulty: string;
}): Promise<GameState> {
  const { data } = await client.post<GameState>('/game', request);
  return data;
}

export async function getGame(gameId: string): Promise<GameState> {
  const { data } = await client.get<GameState>(`/game/${gameId}`);
  return data;
}

export async function submitAction(gameId: string, action: GameAction): Promise<GameActionResult> {
  const { data } = await client.post<GameActionResult>(`/game/${gameId}/actions`, action);
  return data;
}

export async function getPendingCards(gameId: string): Promise<DecisionCard[]> {
  const { data } = await client.get<DecisionCard[]>(`/game/${gameId}/cards`);
  return data;
}

export async function getMonthlyReport(gameId: string, year: number, month: number): Promise<MonthlyReport> {
  const { data } = await client.get<MonthlyReport>(`/game/${gameId}/reports/${year}/${month}`);
  return data;
}

export async function getTransactions(
  gameId: string,
  options?: { limit?: number; cursor?: string },
): Promise<Transaction[]> {
  const { data } = await client.get<Transaction[]>(`/game/${gameId}/transactions`, {
    params: options,
  });
  return data;
}

// ---- Rewards API ----

export async function getBadges(gameId: string): Promise<Badge[]> {
  const { data } = await client.get<Badge[]>(`/game/${gameId}/badges`);
  return data;
}

export async function getRewardCatalog(): Promise<RewardCatalogItem[]> {
  const { data } = await client.get<RewardCatalogItem[]>('/rewards/catalog');
  return data;
}

export async function redeemReward(itemId: string): Promise<{ success: boolean; message: string }> {
  const { data } = await client.post(`/rewards/redeem`, { itemId });
  return data;
}

// ---- Social API ----

export async function getLeaderboard(
  type: string,
  options?: { classroomId?: string },
): Promise<Array<{ userId: string; displayName: string; score: number; rank: number }>> {
  const { data } = await client.get(`/social/leaderboard/${type}`, { params: options });
  return data;
}

// ---- Offline Queue ----

export function queueOfflineAction(gameId: string, action: GameAction): void {
  offlineQueue.push({ gameId, action });
}

export async function flushOfflineQueue(): Promise<void> {
  const queue = [...offlineQueue];
  offlineQueue = [];
  for (const item of queue) {
    try {
      await submitAction(item.gameId, item.action);
    } catch {
      offlineQueue.push(item);
    }
  }
}

export function getOfflineQueueSize(): number {
  return offlineQueue.length;
}

export { client as apiClient };

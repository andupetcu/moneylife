const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.moneylife.app';

interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ml_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return { ok: false, error: data?.message || data?.code || `HTTP ${res.status}` };
    }
    return { ok: true, data: data as T };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export interface AuthResponse {
  userId: string;
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; displayName: string; role: string };
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export interface PendingCard {
  id: string;
  title: string;
  description: string;
  category: string;
  options: { id: string; label: string; description?: string }[];
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  accountId: string;
}

export interface GameResponse {
  id: string;
  userId: string;
  persona: string;
  difficulty: string;
  region: string;
  currency: string;
  level: number;
  xp: number;
  xpToNextLevel?: number;
  status: string;
  createdAt: string;
  currentDate?: string;
  netWorth?: number;
  monthlyIncome?: number;
  budgetScore?: number;
  creditHealthIndex?: number;
  accounts?: Account[];
  pendingCards?: PendingCard[];
}

export const api = {
  auth: {
    register: (email: string, password: string, displayName: string) =>
      request<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, displayName }),
      }),
    login: (email: string, password: string) =>
      request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<AuthResponse['user']>('/api/auth/me'),
    logout: () => request('/api/auth/logout', { method: 'POST' }),
  },
  game: {
    list: () => request<GameResponse[]>('/api/game/games'),
    create: (persona: string, difficulty: string, region: string, currencyCode: string) =>
      request<GameResponse>('/api/game/games', {
        method: 'POST',
        body: JSON.stringify({ persona, difficulty, region, currencyCode }),
      }),
    get: (id: string) => request<GameResponse>(`/api/game/games/${id}`),
    submitAction: (gameId: string, action: Record<string, unknown>) =>
      request<GameResponse>(`/api/game/games/${gameId}/actions`, {
        method: 'POST',
        body: JSON.stringify(action),
      }),
    getCards: (gameId: string) => request<PendingCard[]>(`/api/game/games/${gameId}/cards`),
    getTransactions: (gameId: string) => request<Transaction[]>(`/api/game/games/${gameId}/transactions`),
  },
};

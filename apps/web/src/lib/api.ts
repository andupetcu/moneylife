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
  interestRate?: number;
  isActive?: boolean;
}

export interface PendingCard {
  id: string;
  cardId: string;
  presentedDate?: string;
  expiresDate?: string;
  status: string;
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

// Normalize API response fields to what the UI expects
function normalizeGame(raw: Record<string, unknown>): GameResponse {
  const cd = raw.currentDate as { year?: number; month?: number; day?: number } | string | undefined;
  let dateStr: string | undefined;
  if (cd && typeof cd === 'object') {
    dateStr = `${cd.year}-${String(cd.month).padStart(2, '0')}-${String(cd.day).padStart(2, '0')}`;
  } else if (typeof cd === 'string') {
    dateStr = cd;
  }

  const chi = raw.creditHealthIndex as { overall?: number } | number | undefined;
  const chiScore = typeof chi === 'object' && chi ? chi.overall : (typeof chi === 'number' ? chi : undefined);

  return {
    id: raw.id as string,
    userId: raw.userId as string,
    persona: raw.persona as string,
    difficulty: raw.difficulty as string,
    region: raw.region as string,
    currency: (raw.currency || raw.currencyCode) as string,
    level: (raw.level ?? raw.currentLevel ?? 1) as number,
    xp: (raw.xp ?? raw.totalXp ?? 0) as number,
    xpToNextLevel: raw.xpToNextLevel as number | undefined,
    status: raw.status as string,
    createdAt: raw.createdAt as string,
    currentDate: dateStr,
    netWorth: raw.netWorth as number | undefined,
    monthlyIncome: raw.monthlyIncome as number | undefined,
    budgetScore: raw.budgetScore as number | undefined,
    creditHealthIndex: chiScore as number | undefined,
    accounts: raw.accounts as Account[] | undefined,
    pendingCards: raw.pendingCards as PendingCard[] | undefined,
  };
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
    get: async (id: string): Promise<ApiResponse<GameResponse>> => {
      const res = await request<Record<string, unknown>>(`/api/game/games/${id}`);
      if (res.ok && res.data) {
        return { ok: true, data: normalizeGame(res.data) };
      }
      return res as ApiResponse<GameResponse>;
    },
    submitAction: (gameId: string, action: Record<string, unknown>) =>
      request(`/api/game/games/${gameId}/actions`, {
        method: 'POST',
        body: JSON.stringify(action),
      }),
    getCards: (gameId: string) => request<{ cards: PendingCard[] }>(`/api/game/games/${gameId}/cards`),
    getTransactions: (gameId: string) => request<{ transactions: Transaction[] }>(`/api/game/games/${gameId}/transactions`),
  },
};

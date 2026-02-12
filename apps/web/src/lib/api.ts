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
    let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    // Auto-refresh on 401
    if (res.status === 401 && token) {
      const refreshToken = localStorage.getItem('ml_refresh');
      if (refreshToken) {
        const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          localStorage.setItem('ml_token', refreshData.accessToken);
          localStorage.setItem('ml_refresh', refreshData.refreshToken);
          // Retry original request with new token
          headers.Authorization = `Bearer ${refreshData.accessToken}`;
          res = await fetch(`${API_BASE}${path}`, { ...options, headers });
        } else {
          localStorage.removeItem('ml_token');
          localStorage.removeItem('ml_refresh');
          if (typeof window !== 'undefined') window.location.href = '/login';
          return { ok: false, error: 'Session expired' };
        }
      }
    }

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
  currency: string;
}

export interface CardOption {
  id: string;
  label: string;
  description?: string;
  effects?: { type: string; amount?: number; label?: string }[];
}

export interface PendingCard {
  id: string;
  cardId: string;
  title: string;
  description: string;
  category: string;
  options: CardOption[];
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

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  autopay: boolean;
  isPaid?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  earned: boolean;
}

export interface MonthlyReport {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  categoryBreakdown: Record<string, number>;
  creditHealthIndex: number;
  budgetAdherence: number;
  xpEarned: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  savingsRate: number;
  netWorthChange: number;
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

// ─── Social types ───────────────────────────────────────────────

export interface Friend {
  friendshipId: string;
  userId: string;
  displayName: string;
  email: string;
  friendsSince: string;
  level: number;
  xp: number;
  netWorth: number;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  displayName: string;
  email: string;
  createdAt: string;
}

export interface SearchUser {
  id: string;
  displayName: string;
  email: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  level: number;
  xp: number;
  netWorth: number;
  isMe?: boolean;
}

export interface Classroom {
  id: string;
  name: string;
  joinCode?: string;
  description: string;
  teacherName?: string;
  isTeacher?: boolean;
  status: string;
  memberCount?: number;
  createdAt: string;
  role?: string;
  members?: ClassroomMember[];
}

export interface ClassroomMember {
  userId: string;
  displayName: string;
  level: number;
  xp: number;
  netWorth: number;
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
        body: JSON.stringify({ ...action, idempotencyKey: crypto.randomUUID() }),
      }),
    getCards: async (gameId: string): Promise<ApiResponse<PendingCard[]>> => {
      const res = await request<PendingCard[] | { cards: PendingCard[] }>(`/api/game/games/${gameId}/cards`);
      if (res.ok && res.data) {
        const cards = Array.isArray(res.data) ? res.data : (res.data as any).cards || [];
        return { ok: true, data: cards };
      }
      return res as ApiResponse<PendingCard[]>;
    },
    getTransactions: (gameId: string) => request<{ transactions: Transaction[] }>(`/api/game/games/${gameId}/transactions`),
    getMonthlyReport: (gameId: string, year: number, month: number) =>
      request<MonthlyReport>(`/api/game/games/${gameId}/monthly-report/${year}/${month}`),
    getBills: async (gameId: string): Promise<ApiResponse<Bill[]>> => {
      const res = await request<Bill[]>(`/api/game/games/${gameId}/bills`);
      if (!res.ok && res.error?.includes('404')) return { ok: true, data: [] };
      return res;
    },
    getBadges: async (gameId: string): Promise<ApiResponse<Badge[]>> => {
      const res = await request<Badge[]>(`/api/game/games/${gameId}/badges`);
      if (!res.ok && res.error?.includes('404')) return { ok: true, data: [] };
      return res;
    },
  },
  social: {
    // Friends
    sendFriendRequest: (targetUserId: string) =>
      request('/api/game/friends/request', { method: 'POST', body: JSON.stringify({ targetUserId }) }),
    acceptFriendRequest: (requestId: string) =>
      request(`/api/game/friends/accept/${requestId}`, { method: 'POST' }),
    rejectFriendRequest: (requestId: string) =>
      request(`/api/game/friends/reject/${requestId}`, { method: 'POST' }),
    removeFriend: (friendshipId: string) =>
      request(`/api/game/friends/${friendshipId}`, { method: 'DELETE' }),
    listFriends: () => request<{ friends: Friend[] }>('/api/game/friends'),
    listFriendRequests: () => request<{ requests: FriendRequest[] }>('/api/game/friends/requests'),
    searchUsers: (q: string) => request<{ users: SearchUser[] }>(`/api/game/friends/search?q=${encodeURIComponent(q)}`),

    // Leaderboard
    globalLeaderboard: (limit = 50, offset = 0) =>
      request<{ entries: LeaderboardEntry[]; total: number }>(`/api/game/leaderboard/global?limit=${limit}&offset=${offset}`),
    friendsLeaderboard: () =>
      request<{ entries: LeaderboardEntry[] }>('/api/game/leaderboard/friends'),
    levelLeaderboard: (limit = 50, offset = 0) =>
      request<{ entries: LeaderboardEntry[] }>(`/api/game/leaderboard/level?limit=${limit}&offset=${offset}`),

    // Classrooms
    createClassroom: (name: string, description: string) =>
      request<Classroom>('/api/game/classrooms', { method: 'POST', body: JSON.stringify({ name, description }) }),
    joinClassroom: (joinCode: string) =>
      request<{ success: boolean; classroomId: string }>(`/api/game/classrooms/join`, { method: 'POST', body: JSON.stringify({ joinCode }) }),
    listClassrooms: () =>
      request<{ teaching: Classroom[]; enrolled: Classroom[] }>('/api/game/classrooms'),
    getClassroom: (id: string) =>
      request<Classroom>(`/api/game/classrooms/${id}`),
    classroomLeaderboard: (id: string) =>
      request<{ entries: LeaderboardEntry[] }>(`/api/game/classrooms/${id}/leaderboard`),
  },
};

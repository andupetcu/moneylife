import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import { UsersPage } from '../pages/UsersPage';
import { GamesPage } from '../pages/GamesPage';
import { PartnersPage } from '../pages/PartnersPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { AntiCheatPage } from '../pages/AntiCheatPage';
import { SystemHealthPage } from '../pages/SystemHealthPage';
// Mock the API
vi.mock('../api/admin-client', () => ({
    getUsers: vi.fn(() => Promise.resolve({ users: [], total: 0 })),
    getGames: vi.fn(() => Promise.resolve({ games: [], total: 0 })),
    getPartners: vi.fn(() => Promise.resolve({ partners: [] })),
    getAnalytics: vi.fn(() => Promise.resolve({ dau: 100, mau: 500, newUsers: 50, gamesCreated: 30, revenue: 0 })),
    getAntiCheatFlags: vi.fn(() => Promise.resolve({ flags: [] })),
    getSystemHealth: vi.fn(() => Promise.resolve({
        services: [{ name: 'auth', status: 'healthy', latency: 12 }],
        database: { status: 'healthy', connections: 5 },
        cache: { status: 'healthy', hitRate: 95 },
    })),
}));
function wrap(ui) {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(_jsx(QueryClientProvider, { client: qc, children: ui }));
}
describe('UsersPage', () => {
    it('shows loading state', () => {
        wrap(_jsx(UsersPage, {}));
        expect(screen.getByTestId('users-loading')).toBeTruthy();
    });
    it('renders search input', async () => {
        wrap(_jsx(UsersPage, {}));
        const input = await screen.findByTestId('users-search');
        expect(input).toBeTruthy();
    });
});
describe('GamesPage', () => {
    it('shows loading state', () => {
        wrap(_jsx(GamesPage, {}));
        expect(screen.getByTestId('games-loading')).toBeTruthy();
    });
});
describe('PartnersPage', () => {
    it('shows loading state', () => {
        wrap(_jsx(PartnersPage, {}));
        expect(screen.getByTestId('partners-loading')).toBeTruthy();
    });
});
describe('AnalyticsPage', () => {
    it('shows loading state', () => {
        wrap(_jsx(AnalyticsPage, {}));
        expect(screen.getByTestId('analytics-loading')).toBeTruthy();
    });
});
describe('AntiCheatPage', () => {
    it('shows loading state', () => {
        wrap(_jsx(AntiCheatPage, {}));
        expect(screen.getByTestId('anticheat-loading')).toBeTruthy();
    });
});
describe('SystemHealthPage', () => {
    it('shows loading state', () => {
        wrap(_jsx(SystemHealthPage, {}));
        expect(screen.getByTestId('health-loading')).toBeTruthy();
    });
});

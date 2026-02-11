import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from '../api/admin-client';
export function AnalyticsPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin', 'analytics', '7d'],
        queryFn: () => getAnalytics('7d'),
    });
    if (isLoading)
        return _jsx("div", { "data-testid": "analytics-loading", children: "Loading analytics\u2026" });
    if (isError)
        return _jsx("div", { "data-testid": "analytics-error", children: "Failed to load analytics" });
    const stats = data;
    return (_jsxs("div", { children: [_jsx("h2", { style: { fontSize: 24, fontWeight: 700, marginBottom: 16 }, children: "Analytics" }), stats ? (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }, "data-testid": "analytics-grid", children: [_jsx(StatCard, { label: "DAU", value: stats.dau }), _jsx(StatCard, { label: "MAU", value: stats.mau }), _jsx(StatCard, { label: "New Users (7d)", value: stats.newUsers }), _jsx(StatCard, { label: "Games Created (7d)", value: stats.gamesCreated })] })) : (_jsx("p", { "data-testid": "analytics-empty", style: { color: '#9CA3AF' }, children: "No analytics data" }))] }));
}
function StatCard({ label, value }) {
    return (_jsxs("div", { style: { padding: 20, borderRadius: 12, border: '1px solid #E5E7EB', backgroundColor: '#FFF' }, children: [_jsx("p", { style: { fontSize: 13, color: '#6B7280', marginBottom: 4 }, children: label }), _jsx("p", { style: { fontSize: 28, fontWeight: 700, color: '#111827' }, children: value.toLocaleString() })] }));
}

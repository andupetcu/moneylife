import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { getSystemHealth } from '../api/admin-client';
export function SystemHealthPage() {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['admin', 'health'],
        queryFn: getSystemHealth,
        refetchInterval: 30000,
    });
    if (isLoading)
        return _jsx("div", { "data-testid": "health-loading", children: "Loading health status\u2026" });
    if (isError)
        return _jsx("div", { "data-testid": "health-error", children: "Failed to load health status" });
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }, children: [_jsx("h2", { style: { fontSize: 24, fontWeight: 700 }, children: "System Health" }), _jsx("button", { onClick: () => refetch(), style: { padding: '6px 12px', borderRadius: 6, border: '1px solid #D1D5DB', cursor: 'pointer' }, children: "Refresh" })] }), _jsx("h3", { style: { fontSize: 18, fontWeight: 600, marginBottom: 12 }, children: "Services" }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }, "data-testid": "health-services", children: data?.services.map((svc) => (_jsxs("div", { style: { padding: 16, borderRadius: 12, border: '1px solid #E5E7EB', backgroundColor: '#FFF' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { style: { fontWeight: 600 }, children: svc.name }), _jsx("span", { style: {
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        backgroundColor: svc.status === 'healthy' ? '#10B981' : '#EF4444',
                                        display: 'inline-block',
                                    } })] }), _jsxs("p", { style: { fontSize: 13, color: '#6B7280', marginTop: 4 }, children: [svc.latency, "ms latency"] })] }, svc.name))) }), _jsx("h3", { style: { fontSize: 18, fontWeight: 600, marginBottom: 12 }, children: "Database" }), _jsxs("div", { style: { padding: 16, borderRadius: 12, border: '1px solid #E5E7EB', backgroundColor: '#FFF', marginBottom: 24 }, "data-testid": "health-db", children: [_jsxs("p", { children: ["Status: ", _jsx("strong", { children: data?.database.status })] }), _jsxs("p", { children: ["Active connections: ", _jsx("strong", { children: data?.database.connections })] })] }), _jsx("h3", { style: { fontSize: 18, fontWeight: 600, marginBottom: 12 }, children: "Cache" }), _jsxs("div", { style: { padding: 16, borderRadius: 12, border: '1px solid #E5E7EB', backgroundColor: '#FFF' }, "data-testid": "health-cache", children: [_jsxs("p", { children: ["Status: ", _jsx("strong", { children: data?.cache.status })] }), _jsxs("p", { children: ["Hit rate: ", _jsxs("strong", { children: [data?.cache.hitRate, "%"] })] })] })] }));
}

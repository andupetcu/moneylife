import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { getAntiCheatFlags } from '../api/admin-client';
export function AntiCheatPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin', 'anti-cheat'],
        queryFn: getAntiCheatFlags,
    });
    if (isLoading)
        return _jsx("div", { "data-testid": "anticheat-loading", children: "Loading flags\u2026" });
    if (isError)
        return _jsx("div", { "data-testid": "anticheat-error", children: "Failed to load flags" });
    const flags = (data?.flags ?? []);
    return (_jsxs("div", { children: [_jsx("h2", { style: { fontSize: 24, fontWeight: 700, marginBottom: 16 }, children: "Anti-Cheat" }), flags.length === 0 ? (_jsx("p", { "data-testid": "anticheat-empty", style: { color: '#9CA3AF' }, children: "No flagged accounts" })) : (_jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, "data-testid": "anticheat-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: thStyle, children: "User ID" }), _jsx("th", { style: thStyle, children: "Type" }), _jsx("th", { style: thStyle, children: "Severity" }), _jsx("th", { style: thStyle, children: "Date" }), _jsx("th", { style: thStyle, children: "Actions" })] }) }), _jsx("tbody", { children: flags.map((flag) => (_jsxs("tr", { children: [_jsx("td", { style: tdStyle, children: flag.userId }), _jsx("td", { style: tdStyle, children: flag.type }), _jsx("td", { style: tdStyle, children: _jsx("span", { style: {
                                            padding: '2px 8px',
                                            borderRadius: 12,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            backgroundColor: flag.severity === 'high' ? '#FEE2E2' : '#FEF3C7',
                                            color: flag.severity === 'high' ? '#991B1B' : '#92400E',
                                        }, children: flag.severity }) }), _jsx("td", { style: tdStyle, children: new Date(flag.createdAt).toLocaleDateString() }), _jsx("td", { style: tdStyle, children: _jsx("button", { style: { padding: '4px 8px', borderRadius: 4, border: '1px solid #D1D5DB', cursor: 'pointer', fontSize: 12 }, children: "Review" }) })] }, flag.id))) })] }))] }));
}
const thStyle = { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #E5E7EB', fontSize: 13, fontWeight: 600, color: '#6B7280' };
const tdStyle = { padding: '10px 12px', borderBottom: '1px solid #F3F4F6', fontSize: 14 };

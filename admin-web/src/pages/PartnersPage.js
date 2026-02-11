import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { getPartners } from '../api/admin-client';
export function PartnersPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin', 'partners'],
        queryFn: getPartners,
    });
    if (isLoading)
        return _jsx("div", { "data-testid": "partners-loading", children: "Loading partners\u2026" });
    if (isError)
        return _jsx("div", { "data-testid": "partners-error", children: "Failed to load partners" });
    const partners = (data?.partners ?? []);
    return (_jsxs("div", { children: [_jsx("h2", { style: { fontSize: 24, fontWeight: 700, marginBottom: 16 }, children: "Partners" }), partners.length === 0 ? (_jsx("p", { "data-testid": "partners-empty", style: { color: '#9CA3AF' }, children: "No partners found" })) : (_jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, "data-testid": "partners-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: thStyle, children: "Name" }), _jsx("th", { style: thStyle, children: "Status" }), _jsx("th", { style: thStyle, children: "Users" })] }) }), _jsx("tbody", { children: partners.map((p) => (_jsxs("tr", { children: [_jsx("td", { style: tdStyle, children: p.name }), _jsx("td", { style: tdStyle, children: p.status }), _jsx("td", { style: tdStyle, children: p.userCount })] }, p.id))) })] }))] }));
}
const thStyle = { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #E5E7EB', fontSize: 13, fontWeight: 600, color: '#6B7280' };
const tdStyle = { padding: '10px 12px', borderBottom: '1px solid #F3F4F6', fontSize: 14 };

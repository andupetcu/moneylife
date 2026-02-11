import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../api/admin-client';
export function UsersPage() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin', 'users', page, search],
        queryFn: () => getUsers({ page, limit: 20, search: search || undefined }),
    });
    if (isLoading)
        return _jsx("div", { "data-testid": "users-loading", children: "Loading users\u2026" });
    if (isError)
        return _jsx("div", { "data-testid": "users-error", children: "Failed to load users" });
    const users = (data?.users ?? []);
    return (_jsxs("div", { children: [_jsx("h2", { style: styles.title, children: "Users" }), _jsx("input", { type: "text", placeholder: "Search users\u2026", value: search, onChange: (e) => setSearch(e.target.value), style: styles.search, "data-testid": "users-search" }), users.length === 0 ? (_jsx("p", { style: styles.empty, "data-testid": "users-empty", children: "No users found" })) : (_jsxs("table", { style: styles.table, "data-testid": "users-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: styles.th, children: "Email" }), _jsx("th", { style: styles.th, children: "Name" }), _jsx("th", { style: styles.th, children: "Role" }), _jsx("th", { style: styles.th, children: "Status" }), _jsx("th", { style: styles.th, children: "Created" })] }) }), _jsx("tbody", { children: users.map((user) => (_jsxs("tr", { children: [_jsx("td", { style: styles.td, children: user.email }), _jsx("td", { style: styles.td, children: user.displayName }), _jsx("td", { style: styles.td, children: user.role }), _jsx("td", { style: styles.td, children: _jsx("span", { style: {
                                            ...styles.badge,
                                            backgroundColor: user.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                                            color: user.status === 'active' ? '#065F46' : '#991B1B',
                                        }, children: user.status }) }), _jsx("td", { style: styles.td, children: new Date(user.createdAt).toLocaleDateString() })] }, user.id))) })] })), _jsxs("div", { style: styles.pagination, children: [_jsx("button", { onClick: () => setPage((p) => Math.max(1, p - 1)), disabled: page === 1, style: styles.pageBtn, children: "Previous" }), _jsxs("span", { children: ["Page ", page] }), _jsx("button", { onClick: () => setPage((p) => p + 1), style: styles.pageBtn, children: "Next" })] })] }));
}
const styles = {
    title: { fontSize: 24, fontWeight: 700, marginBottom: 16 },
    search: { padding: 10, borderRadius: 8, border: '1px solid #D1D5DB', width: 300, marginBottom: 16 },
    empty: { color: '#9CA3AF', marginTop: 16 },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #E5E7EB', fontSize: 13, fontWeight: 600, color: '#6B7280' },
    td: { padding: '10px 12px', borderBottom: '1px solid #F3F4F6', fontSize: 14 },
    badge: { padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 },
    pagination: { display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 },
    pageBtn: { padding: '6px 12px', borderRadius: 6, border: '1px solid #D1D5DB', cursor: 'pointer', backgroundColor: '#FFF' },
};

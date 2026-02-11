import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { UsersPage } from './pages/UsersPage';
import { GamesPage } from './pages/GamesPage';
import { PartnersPage } from './pages/PartnersPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AntiCheatPage } from './pages/AntiCheatPage';
import { SystemHealthPage } from './pages/SystemHealthPage';
const NAV_ITEMS = [
    { key: 'users', label: 'Users' },
    { key: 'games', label: 'Games' },
    { key: 'partners', label: 'Partners' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'anti-cheat', label: 'Anti-Cheat' },
    { key: 'health', label: 'System Health' },
];
export function App() {
    const [currentPage, setCurrentPage] = useState('users');
    const renderPage = () => {
        switch (currentPage) {
            case 'users': return _jsx(UsersPage, {});
            case 'games': return _jsx(GamesPage, {});
            case 'partners': return _jsx(PartnersPage, {});
            case 'analytics': return _jsx(AnalyticsPage, {});
            case 'anti-cheat': return _jsx(AntiCheatPage, {});
            case 'health': return _jsx(SystemHealthPage, {});
        }
    };
    return (_jsxs("div", { style: styles.layout, children: [_jsxs("nav", { style: styles.sidebar, children: [_jsx("h1", { style: styles.logo, children: "MoneyLife Admin" }), NAV_ITEMS.map((item) => (_jsx("button", { onClick: () => setCurrentPage(item.key), style: {
                            ...styles.navButton,
                            backgroundColor: currentPage === item.key ? '#EFF6FF' : 'transparent',
                            color: currentPage === item.key ? '#2563EB' : '#374151',
                            fontWeight: currentPage === item.key ? 600 : 400,
                        }, "data-testid": `nav-${item.key}`, children: item.label }, item.key)))] }), _jsx("main", { style: styles.content, "data-testid": "main-content", children: renderPage() })] }));
}
const styles = {
    layout: { display: 'flex', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
    sidebar: { width: 240, borderRight: '1px solid #E5E7EB', padding: 16, display: 'flex', flexDirection: 'column', gap: 4 },
    logo: { fontSize: 18, fontWeight: 700, color: '#2563EB', marginBottom: 24, padding: '0 8px' },
    navButton: { display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14 },
    content: { flex: 1, padding: 32, backgroundColor: '#F9FAFB' },
};

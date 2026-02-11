import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { getGames } from '../api/admin-client';
export function GamesPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin', 'games'],
        queryFn: () => getGames({ page: 1 }),
    });
    if (isLoading)
        return _jsx("div", { "data-testid": "games-loading", children: "Loading games\u2026" });
    if (isError)
        return _jsx("div", { "data-testid": "games-error", children: "Failed to load games" });
    const games = (data?.games ?? []);
    return (_jsxs("div", { children: [_jsx("h2", { style: { fontSize: 24, fontWeight: 700, marginBottom: 16 }, children: "Games" }), games.length === 0 ? (_jsx("p", { "data-testid": "games-empty", style: { color: '#9CA3AF' }, children: "No games found" })) : (_jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, "data-testid": "games-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: thStyle, children: "Game ID" }), _jsx("th", { style: thStyle, children: "User ID" }), _jsx("th", { style: thStyle, children: "Persona" }), _jsx("th", { style: thStyle, children: "Level" }), _jsx("th", { style: thStyle, children: "Status" })] }) }), _jsx("tbody", { children: games.map((game) => (_jsxs("tr", { children: [_jsx("td", { style: tdStyle, children: game.id }), _jsx("td", { style: tdStyle, children: game.userId }), _jsx("td", { style: tdStyle, children: game.persona }), _jsx("td", { style: tdStyle, children: game.level }), _jsx("td", { style: tdStyle, children: game.status })] }, game.id))) })] }))] }));
}
const thStyle = { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #E5E7EB', fontSize: 13, fontWeight: 600, color: '#6B7280' };
const tdStyle = { padding: '10px 12px', borderBottom: '1px solid #F3F4F6', fontSize: 14 };

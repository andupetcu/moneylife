import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { getGames } from '../api/admin-client';

export function GamesPage(): React.ReactElement {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'games'],
    queryFn: () => getGames({ page: 1 }),
  });

  if (isLoading) return <div data-testid="games-loading">Loading games…</div>;
  if (isError) return <div data-testid="games-error">Failed to load games</div>;

  const games = (data?.games ?? []) as Array<{ id: string; userId: string; persona: string; level: number; status: string }>;

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Games</h2>
      {games.length === 0 ? (
        <p data-testid="games-empty" style={{ color: '#9CA3AF' }}>No games found</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }} data-testid="games-table">
          <thead>
            <tr>
              <th style={thStyle}>Game ID</th>
              <th style={thStyle}>User ID</th>
              <th style={thStyle}>Persona</th>
              <th style={thStyle}>Level</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id}>
                <td style={tdStyle}>{game.id}</td>
                <td style={tdStyle}>{game.userId}</td>
                <td style={tdStyle}>{game.persona}</td>
                <td style={tdStyle}>{game.level}</td>
                <td style={tdStyle}>{game.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', borderBottom: '2px solid #E5E7EB', fontSize: 13, fontWeight: 600, color: '#6B7280' };
const tdStyle: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid #F3F4F6', fontSize: 14 };

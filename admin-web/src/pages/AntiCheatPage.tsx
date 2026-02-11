import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { getAntiCheatFlags } from '../api/admin-client';

export function AntiCheatPage(): React.ReactElement {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'anti-cheat'],
    queryFn: getAntiCheatFlags,
  });

  if (isLoading) return <div data-testid="anticheat-loading">Loading flags…</div>;
  if (isError) return <div data-testid="anticheat-error">Failed to load flags</div>;

  const flags = (data?.flags ?? []) as Array<{ id: string; userId: string; type: string; severity: string; createdAt: string }>;

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Anti-Cheat</h2>
      {flags.length === 0 ? (
        <p data-testid="anticheat-empty" style={{ color: '#9CA3AF' }}>No flagged accounts</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }} data-testid="anticheat-table">
          <thead>
            <tr>
              <th style={thStyle}>User ID</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Severity</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => (
              <tr key={flag.id}>
                <td style={tdStyle}>{flag.userId}</td>
                <td style={tdStyle}>{flag.type}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: flag.severity === 'high' ? '#FEE2E2' : '#FEF3C7',
                    color: flag.severity === 'high' ? '#991B1B' : '#92400E',
                  }}>
                    {flag.severity}
                  </span>
                </td>
                <td style={tdStyle}>{new Date(flag.createdAt).toLocaleDateString()}</td>
                <td style={tdStyle}>
                  <button style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #D1D5DB', cursor: 'pointer', fontSize: 12 }}>
                    Review
                  </button>
                </td>
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

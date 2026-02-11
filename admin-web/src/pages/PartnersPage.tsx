import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { getPartners } from '../api/admin-client';

export function PartnersPage(): React.ReactElement {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'partners'],
    queryFn: getPartners,
  });

  if (isLoading) return <div data-testid="partners-loading">Loading partners…</div>;
  if (isError) return <div data-testid="partners-error">Failed to load partners</div>;

  const partners = (data?.partners ?? []) as Array<{ id: string; name: string; status: string; userCount: number }>;

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Partners</h2>
      {partners.length === 0 ? (
        <p data-testid="partners-empty" style={{ color: '#9CA3AF' }}>No partners found</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }} data-testid="partners-table">
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Users</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id}>
                <td style={tdStyle}>{p.name}</td>
                <td style={tdStyle}>{p.status}</td>
                <td style={tdStyle}>{p.userCount}</td>
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

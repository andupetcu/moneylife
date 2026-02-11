import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { getAnalytics } from '../api/admin-client';

export function AnalyticsPage(): React.ReactElement {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'analytics', '7d'],
    queryFn: () => getAnalytics('7d'),
  });

  if (isLoading) return <div data-testid="analytics-loading">Loading analytics…</div>;
  if (isError) return <div data-testid="analytics-error">Failed to load analytics</div>;

  const stats = data as { dau: number; mau: number; newUsers: number; gamesCreated: number; revenue: number } | null;

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Analytics</h2>
      {stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }} data-testid="analytics-grid">
          <StatCard label="DAU" value={stats.dau} />
          <StatCard label="MAU" value={stats.mau} />
          <StatCard label="New Users (7d)" value={stats.newUsers} />
          <StatCard label="Games Created (7d)" value={stats.gamesCreated} />
        </div>
      ) : (
        <p data-testid="analytics-empty" style={{ color: '#9CA3AF' }}>No analytics data</p>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }): React.ReactElement {
  return (
    <div style={{ padding: 20, borderRadius: 12, border: '1px solid #E5E7EB', backgroundColor: '#FFF' }}>
      <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{value.toLocaleString()}</p>
    </div>
  );
}

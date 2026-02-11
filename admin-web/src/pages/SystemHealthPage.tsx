import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { getSystemHealth } from '../api/admin-client';

export function SystemHealthPage(): React.ReactElement {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'health'],
    queryFn: getSystemHealth,
    refetchInterval: 30_000,
  });

  if (isLoading) return <div data-testid="health-loading">Loading health status…</div>;
  if (isError) return <div data-testid="health-error">Failed to load health status</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>System Health</h2>
        <button onClick={() => refetch()} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #D1D5DB', cursor: 'pointer' }}>
          Refresh
        </button>
      </div>

      {/* Services */}
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Services</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }} data-testid="health-services">
        {data?.services.map((svc) => (
          <div key={svc.name} style={{ padding: 16, borderRadius: 12, border: '1px solid #E5E7EB', backgroundColor: '#FFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{svc.name}</span>
              <span style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: svc.status === 'healthy' ? '#10B981' : '#EF4444',
                display: 'inline-block',
              }} />
            </div>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{svc.latency}ms latency</p>
          </div>
        ))}
      </div>

      {/* Database */}
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Database</h3>
      <div style={{ padding: 16, borderRadius: 12, border: '1px solid #E5E7EB', backgroundColor: '#FFF', marginBottom: 24 }} data-testid="health-db">
        <p>Status: <strong>{data?.database.status}</strong></p>
        <p>Active connections: <strong>{data?.database.connections}</strong></p>
      </div>

      {/* Cache */}
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Cache</h3>
      <div style={{ padding: 16, borderRadius: 12, border: '1px solid #E5E7EB', backgroundColor: '#FFF' }} data-testid="health-cache">
        <p>Status: <strong>{data?.cache.status}</strong></p>
        <p>Hit rate: <strong>{data?.cache.hitRate}%</strong></p>
      </div>
    </div>
  );
}

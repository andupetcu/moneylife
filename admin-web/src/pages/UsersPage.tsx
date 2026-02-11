import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getUsers } from '../api/admin-client';

export function UsersPage(): React.ReactElement {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users', page, search],
    queryFn: () => getUsers({ page, limit: 20, search: search || undefined }),
  });

  if (isLoading) return <div data-testid="users-loading">Loading users…</div>;
  if (isError) return <div data-testid="users-error">Failed to load users</div>;

  const users = (data?.users ?? []) as Array<{ id: string; email: string; displayName: string; role: string; status: string; createdAt: string }>;

  return (
    <div>
      <h2 style={styles.title}>Users</h2>
      <input
        type="text"
        placeholder="Search users…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.search}
        data-testid="users-search"
      />

      {users.length === 0 ? (
        <p style={styles.empty} data-testid="users-empty">No users found</p>
      ) : (
        <table style={styles.table} data-testid="users-table">
          <thead>
            <tr>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.displayName}</td>
                <td style={styles.td}>{user.role}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: user.status === 'active' ? '#D1FAE5' : '#FEE2E2',
                    color: user.status === 'active' ? '#065F46' : '#991B1B',
                  }}>
                    {user.status}
                  </span>
                </td>
                <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={styles.pagination}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={styles.pageBtn}>Previous</button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => p + 1)} style={styles.pageBtn}>Next</button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
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

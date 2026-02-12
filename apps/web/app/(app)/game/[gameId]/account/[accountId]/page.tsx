'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../../src/lib/auth-context';
import { api, type GameResponse, type Account, type Transaction } from '../../../../../../src/lib/api';

function fmt(amount: number, currency: string): string {
  return (amount / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });
}

const ACCOUNT_ICONS: Record<string, string> = {
  checking: '🏦', savings: '💰', credit_card: '💳', loan: '📋', investment: '📈',
};

export default function AccountDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const gameId = params.gameId as string;
  const accountId = params.accountId as string;

  const [game, setGame] = useState<GameResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [gameRes, txRes] = await Promise.all([
      api.game.get(gameId),
      api.game.getTransactions(gameId),
    ]);
    if (gameRes.ok && gameRes.data) setGame(gameRes.data);
    if (txRes.ok && txRes.data) {
      const all = Array.isArray(txRes.data) ? txRes.data : (txRes.data as any).transactions || [];
      setTransactions(all.filter((t: Transaction) => t.accountId === accountId));
    }
    setLoading(false);
  }, [gameId, accountId]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading, router, fetchData]);

  if (loading || authLoading) return <div style={s.container}><p style={{ color: '#9CA3AF' }}>Loading...</p></div>;

  const account = game?.accounts?.find(a => a.id === accountId);
  if (!account) return (
    <div style={s.container}>
      <p style={{ color: '#EF4444' }}>Account not found</p>
      <button onClick={() => router.push(`/game/${gameId}`)} style={s.backBtn}>← Back</button>
    </div>
  );

  const currency = game?.currency || 'USD';

  return (
    <div style={s.container}>
      <button onClick={() => router.push(`/game/${gameId}`)} style={s.backBtn}>← Back to Game</button>

      <div style={s.header}>
        <span style={{ fontSize: 48 }}>{ACCOUNT_ICONS[account.type] || '🏦'}</span>
        <div>
          <h1 style={s.title}>{account.name}</h1>
          <p style={s.muted}>{account.type}{account.interestRate ? ` · ${account.interestRate}% APR` : ''}</p>
        </div>
      </div>

      <div style={s.balanceCard}>
        <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>Current Balance</p>
        <p style={{ margin: '8px 0 0', fontSize: 36, fontWeight: 700, color: account.balance >= 0 ? '#111827' : '#EF4444' }}>
          {fmt(account.balance, currency)}
        </p>
      </div>

      <button onClick={() => router.push(`/game/${gameId}/transfer`)} style={s.transferBtn}>💸 Transfer Money</button>

      <div style={s.section}>
        <h2 style={s.sectionTitle}>Transaction History</h2>
        {transactions.length === 0 && <p style={s.muted}>No transactions yet</p>}
        {transactions.map(tx => (
          <div key={tx.id} style={s.txRow}>
            <div>
              <p style={{ margin: 0, fontWeight: 500, color: '#111827' }}>{tx.description}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>{tx.date} · {tx.category}</p>
            </div>
            <p style={{ margin: 0, fontWeight: 600, color: tx.amount >= 0 ? '#10B981' : '#EF4444' }}>
              {tx.amount >= 0 ? '+' : ''}{fmt(tx.amount, currency)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { maxWidth: 600, margin: '40px auto', padding: 24 },
  backBtn: { padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', color: '#6B7280', fontSize: 14, marginBottom: 24, display: 'inline-block', textDecoration: 'none' },
  header: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 },
  muted: { color: '#9CA3AF', margin: 0 },
  balanceCard: { padding: 24, border: '1px solid #E5E7EB', borderRadius: 16, background: '#FAFAFA', textAlign: 'center' as const, marginBottom: 20 },
  transferBtn: { width: '100%', padding: '14px 28px', borderRadius: 12, backgroundColor: '#2563EB', color: '#FFF', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer', marginBottom: 32 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 12 },
  txRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: '1px solid #F3F4F6' },
};

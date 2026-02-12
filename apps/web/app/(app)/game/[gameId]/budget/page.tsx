'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../src/lib/auth-context';
import { api, type GameResponse, type Transaction } from '../../../../../src/lib/api';

const CATEGORIES = ['Housing', 'Food', 'Transport', 'Entertainment', 'Savings', 'Other'];

function fmt(amount: number, currency: string): string {
  return (amount / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });
}

export default function BudgetPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<GameResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allocations, setAllocations] = useState<Record<string, number>>(() =>
    Object.fromEntries(CATEGORIES.map(c => [c.toLowerCase(), Math.floor(100 / CATEGORIES.length)]))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [gameRes, txRes] = await Promise.all([
      api.game.get(gameId),
      api.game.getTransactions(gameId),
    ]);
    if (gameRes.ok && gameRes.data) setGame(gameRes.data);
    if (txRes.ok && txRes.data) {
      const all = Array.isArray(txRes.data) ? txRes.data : (txRes.data as any).transactions || [];
      setTransactions(all);
    }
    setLoading(false);
  }, [gameId]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading, router, fetchData]);

  const totalPct = Object.values(allocations).reduce((a, b) => a + b, 0);

  const spendingByCategory = CATEGORIES.reduce((acc, cat) => {
    const key = cat.toLowerCase();
    acc[key] = transactions
      .filter(t => (t.category || '').toLowerCase() === key && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return acc;
  }, {} as Record<string, number>);

  const handleChange = (cat: string, val: string): void => {
    const num = parseInt(val) || 0;
    setAllocations(prev => ({ ...prev, [cat]: Math.max(0, Math.min(100, num)) }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (totalPct !== 100) { setError('Allocations must total 100%'); return; }
    setSubmitting(true);
    setError(null);
    const res = await api.game.submitAction(gameId, {
      type: 'set_budget',
      payload: { allocations },
    });
    setSubmitting(false);
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(res.error || 'Failed to set budget');
    }
  };

  if (loading || authLoading) return <div style={s.container}><p style={{ color: '#9CA3AF' }}>Loading...</p></div>;

  const currency = game?.currency || 'USD';
  const income = game?.monthlyIncome ?? 0;

  return (
    <div style={s.container}>
      <button onClick={() => router.push(`/game/${gameId}`)} style={s.backBtn}>← Back to Game</button>

      <h1 style={s.title}>📊 Monthly Budget</h1>
      {income > 0 && <p style={s.muted}>Monthly income: {fmt(income, currency)}</p>}

      <div style={s.totalBar}>
        <span>Total: {totalPct}%</span>
        <span style={{ color: totalPct === 100 ? '#10B981' : '#EF4444' }}>{totalPct === 100 ? '✓' : `${100 - totalPct}% remaining`}</span>
      </div>

      {CATEGORIES.map(cat => {
        const key = cat.toLowerCase();
        const pct = allocations[key] || 0;
        const budgeted = income > 0 ? Math.round(income * pct / 100) : 0;
        const spent = spendingByCategory[key] || 0;
        return (
          <div key={cat} style={s.catRow}>
            <div style={s.catHeader}>
              <span style={{ fontWeight: 600, color: '#111827' }}>{cat}</span>
              <span style={{ fontSize: 13, color: '#6B7280' }}>
                {income > 0 ? `${fmt(spent, currency)} / ${fmt(budgeted, currency)}` : `${pct}%`}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="range"
                min="0"
                max="100"
                value={pct}
                onChange={e => handleChange(key, e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                type="number"
                min="0"
                max="100"
                value={pct}
                onChange={e => handleChange(key, e.target.value)}
                style={s.pctInput}
              />
              <span style={{ fontSize: 13, color: '#6B7280' }}>%</span>
            </div>
            {income > 0 && spent > 0 && (
              <div style={s.progressTrack}>
                <div style={{ ...s.progressFill, width: `${Math.min(100, budgeted > 0 ? (spent / budgeted) * 100 : 0)}%`, backgroundColor: spent > budgeted ? '#EF4444' : '#10B981' }} />
              </div>
            )}
          </div>
        );
      })}

      {error && <p style={{ color: '#EF4444', margin: '12px 0' }}>{error}</p>}
      {success && <p style={{ color: '#10B981', margin: '12px 0' }}>✓ Budget saved!</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting || totalPct !== 100}
        style={{ ...s.submitBtn, opacity: submitting || totalPct !== 100 ? 0.5 : 1 }}
      >
        {submitting ? 'Saving...' : '💾 Save Budget'}
      </button>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { maxWidth: 600, margin: '40px auto', padding: 24 },
  backBtn: { padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', color: '#6B7280', fontSize: 14, marginBottom: 24, display: 'inline-block', textDecoration: 'none' },
  title: { fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 },
  muted: { color: '#9CA3AF', margin: '0 0 24px' },
  totalBar: { display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10, background: '#F9FAFB', border: '1px solid #E5E7EB', marginBottom: 20, fontSize: 14, fontWeight: 600 },
  catRow: { marginBottom: 20, padding: 16, borderRadius: 12, border: '1px solid #E5E7EB' },
  catHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
  pctInput: { width: 52, padding: '4px 8px', borderRadius: 6, border: '1px solid #D1D5DB', textAlign: 'center' as const, fontSize: 14 },
  progressTrack: { height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, transition: 'width 0.3s' },
  submitBtn: { width: '100%', padding: '14px 28px', borderRadius: 12, backgroundColor: '#2563EB', color: '#FFF', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8 },
};

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../src/lib/auth-context';
import { api, type GameResponse } from '../../../../../src/lib/api';

function fmt(amount: number, currency: string): string {
  return (amount / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });
}

export default function TransferPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<GameResponse | null>(null);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGame = useCallback(async () => {
    const res = await api.game.get(gameId);
    if (res.ok && res.data) setGame(res.data);
    setLoading(false);
  }, [gameId]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchGame();
  }, [user, authLoading, router, fetchGame]);

  const handleSubmit = async (): Promise<void> => {
    if (!fromId || !toId || !amount) return;
    if (fromId === toId) { setError('Cannot transfer to same account'); return; }
    const cents = Math.round(parseFloat(amount) * 100);
    if (isNaN(cents) || cents <= 0) { setError('Invalid amount'); return; }
    setSubmitting(true);
    setError(null);
    const res = await api.game.submitAction(gameId, {
      type: 'transfer',
      payload: { fromAccountId: fromId, toAccountId: toId, amount: cents },
    });
    setSubmitting(false);
    if (res.ok) {
      router.push(`/game/${gameId}`);
    } else {
      setError(res.error || 'Transfer failed');
    }
  };

  if (loading || authLoading) return <div style={s.container}><p style={{ color: '#9CA3AF' }}>Loading...</p></div>;

  const accounts = game?.accounts || [];
  const currency = game?.currency || 'USD';

  return (
    <div style={s.container}>
      <button onClick={() => router.push(`/game/${gameId}`)} style={s.backBtn}>← Back to Game</button>

      <h1 style={s.title}>💸 Transfer Money</h1>

      <div style={s.field}>
        <label style={s.label}>From Account</label>
        <select value={fromId} onChange={e => setFromId(e.target.value)} style={s.select}>
          <option value="">Select account...</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance, currency)})</option>
          ))}
        </select>
      </div>

      <div style={s.field}>
        <label style={s.label}>To Account</label>
        <select value={toId} onChange={e => setToId(e.target.value)} style={s.select}>
          <option value="">Select account...</option>
          {accounts.filter(a => a.id !== fromId).map(a => (
            <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance, currency)})</option>
          ))}
        </select>
      </div>

      <div style={s.field}>
        <label style={s.label}>Amount ({currency})</label>
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          style={s.input}
        />
      </div>

      {error && <p style={{ color: '#EF4444', margin: '12px 0' }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={submitting || !fromId || !toId || !amount}
        style={{ ...s.submitBtn, opacity: submitting || !fromId || !toId || !amount ? 0.5 : 1 }}
      >
        {submitting ? 'Transferring...' : '✅ Confirm Transfer'}
      </button>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { maxWidth: 500, margin: '40px auto', padding: 24 },
  backBtn: { padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', color: '#6B7280', fontSize: 14, marginBottom: 24, display: 'inline-block', textDecoration: 'none' },
  title: { fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 24 },
  field: { marginBottom: 20 },
  label: { display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 },
  select: { width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 15, color: '#111827', backgroundColor: '#FFF' },
  input: { width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid #D1D5DB', fontSize: 15, color: '#111827', boxSizing: 'border-box' as const },
  submitBtn: { width: '100%', padding: '14px 28px', borderRadius: 12, backgroundColor: '#2563EB', color: '#FFF', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8 },
};

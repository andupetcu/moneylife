'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../src/lib/auth-context';
import { api, type GameResponse, type Transaction } from '../../../../src/lib/api';

const PERSONAS: Record<string, string> = {
  teen: '🎒', student: '🎓', young_adult: '💼', parent: '👨‍👩‍👧',
};

function formatCurrency(amount: number, currency: string): string {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

function getCreditColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

export default function GamePage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<GameResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGame = useCallback(async () => {
    const [gameRes, txRes] = await Promise.all([
      api.game.get(gameId),
      api.game.getTransactions(gameId),
    ]);
    if (gameRes.ok && gameRes.data) setGame(gameRes.data);
    else setError(gameRes.error || 'Failed to load game');
    if (txRes.ok && txRes.data) {
      const txList = Array.isArray(txRes.data) ? txRes.data : (txRes.data as any).transactions || [];
      setTransactions(txList.slice(0, 10));
    }
    setLoading(false);
  }, [gameId]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchGame();
  }, [user, authLoading, router, fetchGame]);

  const handleAdvanceDay = async (): Promise<void> => {
    setAdvancing(true);
    const res = await api.game.submitAction(gameId, { type: 'advance_day' });
    setAdvancing(false);
    if (res.ok) {
      await fetchGame();
    } else {
      setError(res.error || 'Failed to advance day');
    }
  };

  if (loading || authLoading) return <div style={s.container}><p style={s.muted}>Loading...</p></div>;
  if (error && !game) return <div style={s.container}><p style={{ color: '#EF4444' }}>{error}</p></div>;
  if (!game) return <div style={s.container}><p style={s.muted}>Game not found</p></div>;

  const xpPct = game.xpToNextLevel ? Math.min(100, (game.xp / game.xpToNextLevel) * 100) : 0;
  const creditScore = game.creditHealthIndex ?? 0;

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 40 }}>{PERSONAS[game.persona] || '🎮'}</span>
          <div>
            <h1 style={s.title}>Level {game.level}</h1>
            <p style={s.muted}>{game.currentDate || 'Day 1'} · {game.difficulty}</p>
          </div>
        </div>
        <button onClick={() => router.push('/dashboard')} style={s.backBtn}>← Back</button>
      </div>

      {/* XP Bar */}
      <div style={s.xpContainer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>XP</span>
          <span style={{ fontSize: 13, color: '#6B7280' }}>{game.xp}{game.xpToNextLevel ? ` / ${game.xpToNextLevel}` : ''}</span>
        </div>
        <div style={s.xpTrack}>
          <div style={{ ...s.xpFill, width: `${xpPct}%` }} />
        </div>
      </div>

      {/* Financial Overview */}
      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <p style={s.statLabel}>Net Worth</p>
          <p style={s.statValue}>{formatCurrency(game.netWorth ?? 0, game.currency)}</p>
        </div>
        <div style={s.statCard}>
          <p style={s.statLabel}>Monthly Income</p>
          <p style={s.statValue}>{formatCurrency(game.monthlyIncome ?? 0, game.currency)}</p>
        </div>
        <div style={s.statCard}>
          <p style={s.statLabel}>Budget Score</p>
          <p style={s.statValue}>{game.budgetScore ?? 0}%</p>
        </div>
        <div style={s.statCard}>
          <p style={s.statLabel}>Credit Health</p>
          <p style={{ ...s.statValue, color: getCreditColor(creditScore) }}>{creditScore}</p>
        </div>
      </div>

      {/* Accounts */}
      {game.accounts && game.accounts.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>💰 Accounts</h2>
          {game.accounts.map(acc => (
            <div key={acc.id} style={s.accountRow}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{acc.name}</p>
                <p style={{ margin: 0, fontSize: 13, color: '#9CA3AF' }}>{acc.type}</p>
              </div>
              <p style={{ margin: 0, fontWeight: 600, color: acc.balance >= 0 ? '#111827' : '#EF4444' }}>
                {formatCurrency(acc.balance, acc.currency)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Pending Cards */}
      {game.pendingCards && game.pendingCards.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>📋 Decisions Needed</h2>
          {game.pendingCards.map(card => (
            <div key={card.id} style={s.cardRow}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{card.title}</p>
                <p style={{ margin: 0, fontSize: 13, color: '#6B7280', marginTop: 2 }}>{card.description}</p>
              </div>
              <button onClick={() => router.push(`/game/${gameId}/card/${card.id}`)} style={s.decideBtn}>
                Decide
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Advance Day */}
      <div style={{ textAlign: 'center', margin: '32px 0' }}>
        {error && <p style={{ color: '#EF4444', marginBottom: 12 }}>{error}</p>}
        <button onClick={handleAdvanceDay} disabled={advancing} style={{ ...s.advanceBtn, opacity: advancing ? 0.7 : 1 }}>
          {advancing ? '⏳ Advancing...' : '☀️ Advance Day'}
        </button>
      </div>

      {/* Transactions */}
      {transactions.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>📊 Recent Transactions</h2>
          {transactions.map(tx => (
            <div key={tx.id} style={s.txRow}>
              <div>
                <p style={{ margin: 0, fontWeight: 500, color: '#111827' }}>{tx.description}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>{tx.date} · {tx.category}</p>
              </div>
              <p style={{ margin: 0, fontWeight: 600, color: tx.amount >= 0 ? '#10B981' : '#EF4444' }}>
                {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount, game.currency)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { maxWidth: 800, margin: '40px auto', padding: 24 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 },
  muted: { color: '#9CA3AF', margin: 0 },
  backBtn: { padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', color: '#6B7280', fontSize: 14 },
  xpContainer: { marginBottom: 24 },
  xpTrack: { height: 8, borderRadius: 4, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 4, backgroundColor: '#2563EB', transition: 'width 0.3s' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32 },
  statCard: { padding: 16, border: '1px solid #E5E7EB', borderRadius: 12, background: '#FAFAFA' },
  statLabel: { margin: 0, fontSize: 13, color: '#6B7280', marginBottom: 4 },
  statValue: { margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 12 },
  accountRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, border: '1px solid #E5E7EB', borderRadius: 10, marginBottom: 8 },
  cardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, border: '2px solid #2563EB', borderRadius: 12, marginBottom: 8, background: '#EFF6FF' },
  decideBtn: { padding: '8px 20px', borderRadius: 8, backgroundColor: '#2563EB', color: '#FFF', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', flexShrink: 0 },
  advanceBtn: { padding: '14px 36px', borderRadius: 12, backgroundColor: '#2563EB', color: '#FFF', fontSize: 17, fontWeight: 700, border: 'none', cursor: 'pointer' },
  txRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: '1px solid #F3F4F6' },
};

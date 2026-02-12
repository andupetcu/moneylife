'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../src/lib/auth-context';
import { api, type GameResponse, type Transaction, type Bill } from '../../../../src/lib/api';

const PERSONAS: Record<string, string> = {
  teen: '🎒', student: '🎓', young_adult: '💼', parent: '👨‍👩‍👧',
};

const ACCOUNT_ICONS: Record<string, string> = {
  checking: '🏦', savings: '💰', credit_card: '💳', loan: '📋', investment: '📈',
};

function fmt(amount: number, currency: string): string {
  return (amount / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });
}

function getCreditColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

function isLastDay(dateStr?: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const next = new Date(d);
  next.setDate(next.getDate() + 1);
  return next.getMonth() !== d.getMonth();
}

export default function GamePage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<GameResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGame = useCallback(async () => {
    const [gameRes, txRes, billsRes] = await Promise.all([
      api.game.get(gameId),
      api.game.getTransactions(gameId),
      api.game.getBills(gameId),
    ]);
    if (gameRes.ok && gameRes.data) setGame(gameRes.data);
    else setError(gameRes.error || 'Failed to load game');
    if (txRes.ok && txRes.data) {
      const txList = Array.isArray(txRes.data) ? txRes.data : (txRes.data as any).transactions || [];
      setTransactions(txList.slice(0, 15));
    }
    if (billsRes.ok && billsRes.data) setBills(billsRes.data);
    setLoading(false);
  }, [gameId]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchGame();
  }, [user, authLoading, router, fetchGame]);

  const handleAdvanceDay = async (): Promise<void> => {
    setAdvancing(true);
    setError(null);
    const res = await api.game.submitAction(gameId, { type: 'advance_day' });
    setAdvancing(false);
    if (res.ok) {
      await fetchGame();
    } else {
      setError(res.error || 'Failed to advance day');
    }
  };

  const handleToggleAutopay = async (billId: string, current: boolean): Promise<void> => {
    await api.game.submitAction(gameId, { type: 'set_autopay', payload: { billId, autopay: !current } });
    setBills(prev => prev.map(b => b.id === billId ? { ...b, autopay: !current } : b));
  };

  if (loading || authLoading) return <div style={s.container}><p style={s.muted}>Loading...</p></div>;
  if (error && !game) return <div style={s.container}><p style={{ color: '#EF4444' }}>{error}</p></div>;
  if (!game) return <div style={s.container}><p style={s.muted}>Game not found</p></div>;

  const currency = game.currency || 'USD';
  const xpPct = game.xpToNextLevel ? Math.min(100, (game.xp / game.xpToNextLevel) * 100) : 0;
  const creditScore = game.creditHealthIndex ?? 0;
  const monthEnd = isLastDay(game.currentDate);
  const netWorth = game.netWorth ?? 0;
  const income = game.monthlyIncome ?? 0;

  // Parse current date
  const dateParts = game.currentDate?.split('-');
  const dateDisplay = game.currentDate ? new Date(game.currentDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }) : 'Day 1';

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 40 }}>{PERSONAS[game.persona] || '🎮'}</span>
          <div>
            <h1 style={s.title}>Level {game.level}</h1>
            <p style={s.muted}>{game.difficulty} mode</p>
          </div>
        </div>
        <button onClick={() => router.push('/dashboard')} style={s.backBtn}>← Back</button>
      </div>

      {/* XP Bar */}
      <div style={s.xpContainer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>⭐ XP</span>
          <span style={{ fontSize: 13, color: '#6B7280' }}>{game.xp}{game.xpToNextLevel ? ` / ${game.xpToNextLevel}` : ''}</span>
        </div>
        <div style={s.xpTrack}><div style={{ ...s.xpFill, width: `${xpPct}%` }} /></div>
      </div>

      {/* Financial Dashboard */}
      <div style={s.statsGrid}>
        <div style={s.statCard}>
          <p style={s.statLabel}>Net Worth</p>
          <p style={s.statValue}>{fmt(netWorth, currency)}</p>
          <p style={{ margin: 0, fontSize: 12, color: netWorth >= 0 ? '#10B981' : '#EF4444' }}>{netWorth >= 0 ? '↑' : '↓'}</p>
        </div>
        <div style={s.statCard}>
          <p style={s.statLabel}>Monthly Income</p>
          <p style={s.statValue}>{fmt(income, currency)}</p>
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

      {/* Quick Actions */}
      <div style={s.quickActions}>
        <Link href={`/game/${gameId}/transfer`} style={s.quickBtn}>💸 Transfer</Link>
        <Link href={`/game/${gameId}/budget`} style={s.quickBtn}>📊 Budget</Link>
        <Link href={`/game/${gameId}/rewards`} style={s.quickBtn}>🏆 Rewards</Link>
      </div>

      {/* Advance Day */}
      <div style={s.daySection}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#111827' }}>📅 {dateDisplay}</p>
          {monthEnd && <span style={s.monthEndBadge}>🎉 Month End!</span>}
        </div>
        {error && <p style={{ color: '#EF4444', textAlign: 'center', margin: '8px 0' }}>{error}</p>}
        <button onClick={handleAdvanceDay} disabled={advancing} style={{ ...s.advanceBtn, opacity: advancing ? 0.7 : 1 }}>
          {advancing ? '⏳ Advancing...' : '☀️ Advance Day'}
        </button>
      </div>

      {/* Pending Cards */}
      {game.pendingCards && game.pendingCards.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>📋 Decisions Needed</h2>
          {game.pendingCards.map(card => (
            <div key={card.id} style={s.cardRow} onClick={() => router.push(`/game/${gameId}/card/${card.id}`)}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{card.title || card.cardId}</p>
                <p style={{ margin: 0, fontSize: 13, color: '#6B7280', marginTop: 2 }}>{card.description || 'Make a decision'}</p>
              </div>
              <span style={s.decideBtn}>Decide →</span>
            </div>
          ))}
        </div>
      )}

      {/* Accounts */}
      {game.accounts && game.accounts.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>💰 Accounts</h2>
          {game.accounts.map(acc => (
            <div key={acc.id} style={s.accountRow} onClick={() => router.push(`/game/${gameId}/account/${acc.id}`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{ACCOUNT_ICONS[acc.type] || '🏦'}</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{acc.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>{acc.type}{acc.interestRate ? ` · ${acc.interestRate}% APR` : ''}</p>
                </div>
              </div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: acc.balance >= 0 ? '#111827' : '#EF4444' }}>
                {fmt(acc.balance, acc.currency || currency)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Bills */}
      {bills.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>📬 Upcoming Bills</h2>
          {bills.map(bill => (
            <div key={bill.id} style={s.billRow}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{bill.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>Due day {bill.dueDay} · {bill.category}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{fmt(bill.amount, currency)}</p>
                <button
                  onClick={() => handleToggleAutopay(bill.id, bill.autopay)}
                  style={{ ...s.autopayBtn, backgroundColor: bill.autopay ? '#D1FAE5' : '#F3F4F6', color: bill.autopay ? '#059669' : '#9CA3AF' }}
                >
                  {bill.autopay ? '✓ Auto' : 'Manual'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>📊 Recent Activity</h2>
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
      )}

      {/* Bottom Nav */}
      <div style={s.bottomNav}>
        <Link href={`/game/${gameId}`} style={s.navItem}>🏠<span>Dashboard</span></Link>
        <Link href={`/game/${gameId}/budget`} style={s.navItem}>📊<span>Budget</span></Link>
        <Link href={`/game/${gameId}/rewards`} style={s.navItem}>🏆<span>Rewards</span></Link>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { maxWidth: 800, margin: '40px auto', padding: '24px 24px 100px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 },
  muted: { color: '#9CA3AF', margin: 0 },
  backBtn: { padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', color: '#6B7280', fontSize: 14 },
  xpContainer: { marginBottom: 24 },
  xpTrack: { height: 8, borderRadius: 4, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 4, backgroundColor: '#2563EB', transition: 'width 0.3s' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 },
  statCard: { padding: 16, border: '1px solid #E5E7EB', borderRadius: 12, background: '#FAFAFA' },
  statLabel: { margin: 0, fontSize: 13, color: '#6B7280', marginBottom: 4 },
  statValue: { margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' },
  quickActions: { display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' as const },
  quickBtn: { flex: 1, padding: '12px 16px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#FFF', textAlign: 'center' as const, textDecoration: 'none', color: '#111827', fontWeight: 600, fontSize: 14, minWidth: 100 },
  daySection: { textAlign: 'center' as const, margin: '24px 0', padding: 20, border: '1px solid #E5E7EB', borderRadius: 16, background: '#FAFAFA' },
  monthEndBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: 20, backgroundColor: '#FEF3C7', color: '#92400E', fontSize: 13, fontWeight: 600 },
  advanceBtn: { marginTop: 12, padding: '14px 36px', borderRadius: 12, backgroundColor: '#2563EB', color: '#FFF', fontSize: 17, fontWeight: 700, border: 'none', cursor: 'pointer' },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 12 },
  accountRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, border: '1px solid #E5E7EB', borderRadius: 10, marginBottom: 8, cursor: 'pointer' },
  cardRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, border: '2px solid #2563EB', borderRadius: 12, marginBottom: 8, background: '#EFF6FF', cursor: 'pointer' },
  decideBtn: { padding: '8px 20px', borderRadius: 8, backgroundColor: '#2563EB', color: '#FFF', fontSize: 14, fontWeight: 600 },
  billRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, border: '1px solid #E5E7EB', borderRadius: 10, marginBottom: 8 },
  autopayBtn: { padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  txRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottom: '1px solid #F3F4F6' },
  bottomNav: { position: 'fixed' as const, bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '12px 0', background: '#FFF', borderTop: '1px solid #E5E7EB', zIndex: 50 },
  navItem: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2, textDecoration: 'none', color: '#6B7280', fontSize: 12, fontWeight: 500 },
};

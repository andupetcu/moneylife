'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../src/lib/auth-context';
import { api, type GameResponse, type Transaction, type Bill, type Badge } from '../../../../src/lib/api';
import { colors, radius, shadows } from '../../../../src/lib/design-tokens';
import Tutorial from '../../../../src/components/Tutorial';
import LevelUpModal from '../../../../src/components/LevelUpModal';
import BadgeNotification from '../../../../src/components/BadgeNotification';
import AIAdvisor from '../../../../src/components/AIAdvisor';
import { useT } from '../../../../src/lib/useT';
import LanguageSwitcher from '../../../../src/components/LanguageSwitcher';
import { useIsMobile } from '../../../../src/hooks/useIsMobile';

const PERSONAS: Record<string, string> = {
  teen: '🎒', student: '🎓', young_adult: '💼', parent: '👨‍👩‍👧',
};

const ACCOUNT_ICONS: Record<string, string> = {
  checking: '🏦', savings: '💰', credit_card: '💳', loan: '📋', investment: '📈',
};

const TX_CATEGORY_COLORS: Record<string, string> = {
  housing: '#7C3AED', food: '#EA580C', transport: '#6B7280', entertainment: '#DB2777',
  health: '#059669', savings: '#2563EB', education: '#7C3AED', income: '#10B981',
  salary: '#10B981', investment: '#059669', insurance: '#0891B2', other: '#9CA3AF',
};

function fmt(amount: number, currency: string): string {
  return (amount / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });
}

function getCreditColor(score: number): string {
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.warning;
  return colors.danger;
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
  const t = useT();
  const isMobile = useIsMobile();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<GameResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTutorial, setShowTutorial] = useState(true);
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const prevLevelRef = useRef<number | null>(null);

  const fetchGame = useCallback(async () => {
    if (!gameId) return;
    const [gameRes, txRes, billsRes] = await Promise.all([
      api.game.get(gameId),
      api.game.getTransactions(gameId),
      api.game.getBills(gameId),
    ]);
    if (gameRes.ok && gameRes.data) setGame(gameRes.data);
    else setError(gameRes.error || t('game.failedToLoad'));
    if (txRes.ok && txRes.data) {
      const txList = Array.isArray(txRes.data) ? txRes.data : (txRes.data as any).transactions || [];
      setTransactions(txList.slice(0, 15));
    }
    if (billsRes.ok && billsRes.data) setBills(billsRes.data);
    setLoading(false);
  }, [gameId, t]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchGame();
  }, [user, authLoading, router, fetchGame]);

  const handleAdvanceDay = async (): Promise<void> => {
    setAdvancing(true);
    setError(null);
    const prevLevel = game?.level ?? null;
    const res = await api.game.submitAction(gameId, { type: 'advance_day' });
    setAdvancing(false);
    if (res.ok) {
      const resData = res.data as Record<string, unknown> | undefined;
      if (resData?.newBadges && Array.isArray(resData.newBadges) && (resData.newBadges as Badge[]).length > 0) {
        setNewBadges(resData.newBadges as Badge[]);
      }
      await fetchGame();
      const updatedGame = await api.game.get(gameId);
      if (updatedGame.ok && updatedGame.data && prevLevel !== null && updatedGame.data.level > prevLevel) {
        setLevelUpLevel(updatedGame.data.level);
      }
    } else {
      setError(res.error || t('game.failedToAdvance'));
    }
  };

  const handleToggleAutopay = async (billId: string, current: boolean): Promise<void> => {
    await api.game.submitAction(gameId, { type: 'set_autopay', payload: { billId, autopay: !current } });
    setBills(prev => prev.map(b => b.id === billId ? { ...b, autopay: !current } : b));
  };

  if (loading || authLoading) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>{t('common.loading')}</p></div>;
  if (error && !game) return <div style={s.page}><p style={{ color: colors.danger, textAlign: 'center', paddingTop: 80 }}>{error}</p></div>;
  if (!game) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>{t('game.gameNotFound')}</p></div>;

  const currency = game.currency || 'USD';
  const xpPct = game.xpToNextLevel ? Math.min(100, (game.xp / game.xpToNextLevel) * 100) : 0;
  const creditScore = game.creditHealthIndex ?? 0;
  const monthEnd = isLastDay(game.currentDate);
  const netWorth = game.netWorth ?? 0;
  const income = game.monthlyIncome ?? 0;

  const dateDisplay = game.currentDate ? new Date(game.currentDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }) : 'Day 1';

  const quickActions = [
    { href: `/game/${gameId}/transfer`, icon: '💸', label: t('game.transfer') },
    { href: `/game/${gameId}/budget`, icon: '📊', label: t('game.budget') },
    { href: `/game/${gameId}/rewards`, icon: '🏆', label: t('game.rewards') },
    { href: `/banking`, icon: '🏦', label: 'Banking' },
    { href: `/game/${gameId}/mirror`, icon: '🪞', label: 'Mirror' },
    { href: `/game/${gameId}/monthly-report/${game.currentDate?.split('-')[0]}/${game.currentDate?.split('-')[1]}`, icon: '📋', label: t('game.report') },
  ];

  return (
    <div style={s.page}>
      {/* Purple Gradient Header */}
      <div style={{ ...s.header, padding: isMobile ? '16px 16px 20px' : '20px 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <button onClick={() => router.push('/dashboard')} style={s.headerBackBtn}>←</button>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <span style={{ fontSize: isMobile ? 36 : 44 }}>{PERSONAS[game.persona] || '🎮'}</span>
            <h1 style={{ margin: '8px 0 4px', fontSize: isMobile ? 18 : 22, fontWeight: 700, color: '#FFF' }}>{t('game.level', { level: game.level })}</h1>
            <span style={s.diffBadge}>{game.difficulty}</span>
          </div>
          {!isMobile && <LanguageSwitcher />}
        </div>
        {/* XP Bar in header */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>⭐ XP</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{game.xp}{game.xpToNextLevel ? ` / ${game.xpToNextLevel}` : ''}</span>
          </div>
          <div style={s.xpTrack}><div style={{ ...s.xpFill, width: `${xpPct}%` }} /></div>
        </div>
      </div>

      <div style={{ ...s.content, padding: isMobile ? '0 16px 120px' : '0 20px 120px' }}>
        {/* Bank Card - Net Worth */}
        <div style={s.bankCard}>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{t('game.totalNetWorth')}</p>
          <p style={{ margin: '8px 0 0', fontSize: isMobile ? 26 : 32, fontWeight: 700, color: '#FFF' }}>{fmt(netWorth, currency)}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: 2 }}>•••• •••• •••• {Math.abs(netWorth % 10000).toString().padStart(4, '0')}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#FFF', letterSpacing: 1 }}>VISA</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ ...s.statsGrid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)' }}>
          <div style={s.statCard}>
            <p style={s.statLabel}>{t('game.netWorth')}</p>
            <p style={{ ...s.statValue, fontSize: isMobile ? 17 : 20 }}>{fmt(netWorth, currency)}</p>
            <p style={{ margin: 0, fontSize: 12, color: netWorth >= 0 ? colors.success : colors.danger }}>{netWorth >= 0 ? `↑ ${t('game.positive')}` : `↓ ${t('game.negative')}`}</p>
          </div>
          <div style={s.statCard}>
            <p style={s.statLabel}>{t('game.monthlyIncome')}</p>
            <p style={{ ...s.statValue, fontSize: isMobile ? 17 : 20 }}>{fmt(income, currency)}</p>
          </div>
          <div style={s.statCard}>
            <p style={s.statLabel}>{t('game.budgetScore')}</p>
            <p style={{ ...s.statValue, fontSize: isMobile ? 17 : 20 }}>{game.budgetScore ?? 0}%</p>
          </div>
          <div style={s.statCard}>
            <p style={s.statLabel}>{t('game.creditHealth')}</p>
            <p style={{ ...s.statValue, fontSize: isMobile ? 17 : 20, color: getCreditColor(creditScore) }}>{creditScore}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ ...s.quickGrid, gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)' }}>
          {quickActions.map(item => (
            <Link key={item.icon + item.label} href={item.href} style={s.quickItem}>
              <div style={s.quickIcon}><span style={{ fontSize: 22 }}>{item.icon}</span></div>
              <span style={{ fontSize: 12, color: colors.textSecondary, fontWeight: 500 }}>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Date + Advance Day */}
        <div style={s.dayCard}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: isMobile ? 14 : 16, fontWeight: 600, color: colors.textPrimary }}>📅 {dateDisplay}</p>
            {monthEnd && <span style={s.monthEndBadge}>🎉 {t('game.monthEnd')}</span>}
          </div>
          {error && <p style={{ color: colors.danger, textAlign: 'center', margin: '8px 0', fontSize: 13 }}>{error}</p>}
          <button onClick={handleAdvanceDay} disabled={advancing} style={{ ...s.primaryBtn, opacity: advancing ? 0.7 : 1, marginTop: 12 }}>
            {advancing ? `⏳ ${t('game.advancing')}` : `☀️ ${t('game.advanceDay')}`}
          </button>
        </div>

        {/* Pending Cards */}
        {game.pendingCards && game.pendingCards.length > 0 && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>📋 {t('game.decisionsNeeded')}</h2>
            {game.pendingCards.map(card => (
              <div key={card.id} style={{ ...s.pendingCard, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 10 : 0, alignItems: isMobile ? 'flex-start' : 'center' }} onClick={() => router.push(`/game/${gameId}/card/${card.id}`)}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: colors.textPrimary }}>{card.title || card.cardId}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: colors.textSecondary }}>{card.description || t('game.makeDecision')}</p>
                </div>
                <span style={s.decidePill}>{t('game.decide')} →</span>
              </div>
            ))}
          </div>
        )}

        {/* Accounts */}
        {game.accounts && game.accounts.length > 0 && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>💰 {t('game.accounts')}</h2>
            {game.accounts.map(acc => (
              <div key={acc.id} style={{ ...s.accountCard, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 0, alignItems: isMobile ? 'flex-start' : 'center' }} onClick={() => router.push(`/game/${gameId}/account/${acc.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={s.accountIcon}><span style={{ fontSize: 20 }}>{ACCOUNT_ICONS[acc.type] || '🏦'}</span></div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: colors.textPrimary }}>{acc.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: colors.textMuted }}>{acc.type}{acc.interestRate ? ` · ${acc.interestRate}% APR` : ''}</p>
                  </div>
                </div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: acc.balance >= 0 ? colors.textPrimary : colors.danger }}>
                  {fmt(acc.balance, acc.currency || currency)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Bills */}
        {bills.length > 0 && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>📬 {t('game.upcomingBills')}</h2>
            {bills.map(bill => (
              <div key={bill.id} style={{ ...s.billCard, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 8 : 0, alignItems: isMobile ? 'flex-start' : 'center' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: colors.textPrimary }}>{bill.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: colors.textMuted }}>{t('game.dueDay', { day: bill.dueDay })} · {bill.category}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                  <p style={{ margin: 0, fontWeight: 600, color: colors.textPrimary }}>{fmt(bill.amount, currency)}</p>
                  <button
                    onClick={() => handleToggleAutopay(bill.id, bill.autopay)}
                    style={{ ...s.autopayBtn, backgroundColor: bill.autopay ? '#D1FAE5' : colors.borderLight, color: bill.autopay ? '#059669' : colors.textMuted, minHeight: 44, minWidth: 44 }}
                  >
                    {bill.autopay ? `✓ ${t('game.auto')}` : t('game.manual')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>📊 {t('game.recentActivity')}</h2>
            {transactions.map(tx => {
              const catColor = TX_CATEGORY_COLORS[(tx.category || '').toLowerCase()] || colors.textMuted;
              return (
                <div key={tx.id} style={s.txRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                    <div style={{ ...s.txIcon, backgroundColor: catColor + '18', color: catColor }}>
                      <span style={{ fontSize: 16 }}>{tx.amount >= 0 ? '↓' : '↑'}</span>
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 500, color: colors.textPrimary, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: colors.textMuted }}>{tx.date} · {tx.category}</p>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: tx.amount >= 0 ? colors.success : colors.danger, whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {tx.amount >= 0 ? '+' : ''}{fmt(tx.amount, currency)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* No transactions empty state */}
        {transactions.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, background: colors.surface, borderRadius: radius.lg, boxShadow: shadows.card }}>
            <span style={{ fontSize: 48 }}>📊</span>
            <p style={{ color: colors.textMuted, margin: '12px 0 0' }}>{t('accounts.noTransactions') || 'No transactions yet'}</p>
          </div>
        )}
      </div>

      {/* Tutorial overlay */}
      {showTutorial && <Tutorial gameId={gameId} onComplete={() => setShowTutorial(false)} />}

      {/* Level up celebration */}
      {levelUpLevel !== null && (
        <LevelUpModal level={levelUpLevel} onDismiss={() => setLevelUpLevel(null)} />
      )}

      {/* Badge notifications */}
      <BadgeNotification badges={newBadges} onClear={() => setNewBadges([])} />

      {/* AI Financial Advisor */}
      <AIAdvisor gameId={gameId} />

      {/* Bottom Nav */}
      <div style={{ ...s.bottomNav, paddingBottom: 'env(safe-area-inset-bottom, 14px)' }}>
        {[
          { key: 'dashboard', icon: '🏠', label: t('game.dashboard'), href: `/game/${gameId}` },
          { key: 'social', icon: '👥', label: 'Social', href: '/social' },
          { key: 'leaderboard', icon: '🏆', label: 'Ranks', href: '/leaderboard' },
          { key: 'classroom', icon: '🎓', label: 'Class', href: '/classroom' },
        ].map(tab => (
          <Link
            key={tab.key}
            href={tab.href}
            style={{ ...s.navTab, color: activeTab === tab.key ? colors.primary : colors.textMuted, minWidth: 44, minHeight: 44, justifyContent: 'center' }}
          >
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            {!isMobile && <span style={{ fontSize: 11, fontWeight: activeTab === tab.key ? 600 : 400 }}>{tab.label}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: colors.background },
  header: { background: colors.primaryGradient, padding: '20px 24px 24px', borderRadius: `0 0 ${radius.xl}px ${radius.xl}px` },
  headerBackBtn: { width: 44, height: 44, borderRadius: radius.sm, border: 'none', background: 'rgba(255,255,255,0.2)', color: '#FFF', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  diffBadge: { display: 'inline-block', padding: '3px 12px', borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFF', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' as const },
  xpTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 3, backgroundColor: '#FFF', transition: 'width 0.3s' },
  content: { padding: '0 20px 120px' },
  bankCard: { margin: '-8px 0 20px', padding: 24, borderRadius: radius.lg, background: colors.cardGradient, boxShadow: shadows.bankCard },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 },
  statCard: { padding: 16, borderRadius: radius.md, background: colors.surface, boxShadow: shadows.card },
  statLabel: { margin: 0, fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  statValue: { margin: 0, fontSize: 20, fontWeight: 700, color: colors.textPrimary },
  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
  quickItem: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, textDecoration: 'none', minHeight: 44 },
  quickIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dayCard: { padding: 20, borderRadius: radius.lg, background: colors.surface, boxShadow: shadows.card, marginBottom: 24 },
  monthEndBadge: { display: 'inline-block', marginTop: 6, padding: '4px 12px', borderRadius: radius.pill, backgroundColor: '#FEF3C7', color: '#92400E', fontSize: 12, fontWeight: 600 },
  primaryBtn: { width: '100%', padding: '14px 28px', borderRadius: radius.md, background: colors.primaryGradient, color: '#FFF', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', height: 52 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 17, fontWeight: 600, color: colors.textPrimary, marginBottom: 12 },
  pendingCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, border: `2px solid ${colors.primaryLight}`, borderRadius: radius.lg, marginBottom: 8, background: '#EEF2FF', cursor: 'pointer' },
  decidePill: { padding: '8px 18px', borderRadius: radius.pill, background: colors.primaryGradient, color: '#FFF', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' as const, minHeight: 44, display: 'inline-flex', alignItems: 'center' },
  accountCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: radius.lg, marginBottom: 8, background: colors.surface, boxShadow: shadows.card, cursor: 'pointer' },
  accountIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  billCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: radius.lg, marginBottom: 8, background: colors.surface, boxShadow: shadows.card },
  autopayBtn: { padding: '4px 12px', borderRadius: radius.sm, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  txRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${colors.borderLight}` },
  txIcon: { width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bottomNav: { position: 'fixed' as const, bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px', background: colors.surface, borderTop: `1px solid ${colors.border}`, zIndex: 50 },
  navTab: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2, textDecoration: 'none' },
};

'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../src/lib/auth-context';
import { api, type GameResponse, type Transaction, type Bill, type Badge } from '../../../../src/lib/api';
import { radius } from '../../../../src/lib/design-tokens';
import Tutorial from '../../../../src/components/Tutorial';
import LevelUpModal from '../../../../src/components/LevelUpModal';
import BadgeNotification from '../../../../src/components/BadgeNotification';
import AIAdvisor from '../../../../src/components/AIAdvisor';
import { useT } from '../../../../src/lib/useT';
import LanguageSwitcher from '../../../../src/components/LanguageSwitcher';
import { useIsMobile } from '../../../../src/hooks/useIsMobile';
import { useToast } from '../../../../src/components/Toast';

// Dark theme colors (hardcoded — chunk A may not be merged yet)
const dk = {
  background: '#0F0B1E',
  surface: '#211B3A',
  surfaceHover: '#2A2248',
  surfaceElevated: '#2D2545',
  textPrimary: '#F1F0FF',
  textSecondary: '#A5A0C8',
  textMuted: '#6B6490',
  border: '#2D2545',
  borderLight: '#1E1838',
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryGradient: 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #818CF8 100%)',
  cardGradient: 'linear-gradient(135deg, #312E81 0%, #4338CA 50%, #7C3AED 100%)',
  success: '#34D399',
  danger: '#FB7185',
  warning: '#FBBF24',
  accentCyan: '#22D3EE',
  glowPrimary: '0 0 20px rgba(99, 102, 241, 0.4)',
  glowCyan: '0 0 15px rgba(34, 211, 238, 0.3)',
  shadowCard: '0 2px 12px rgba(0, 0, 0, 0.3)',
  shadowElevated: '0 8px 32px rgba(0, 0, 0, 0.4)',
  shadowBankCard: '0 8px 32px rgba(67, 56, 202, 0.35)',
};

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

const CATEGORY_COLORS: Record<string, string> = {
  housing: '#7C3AED', food: '#EA580C', transport: '#6B7280', entertainment: '#DB2777',
  health: '#059669', education: '#7C3AED', shopping: '#EC4899', social: '#F59E0B',
  emergency: '#EF4444', savings: '#2563EB', investment: '#059669', insurance: '#0891B2',
  salary: '#10B981', income: '#10B981', other: '#9CA3AF',
};

function fmt(amount: number, currency: string): string {
  return (amount / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });
}

function getScoreColor(score: number): string {
  if (score >= 70) return dk.success;
  if (score >= 40) return dk.warning;
  return dk.danger;
}

function isLastDay(dateStr?: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const next = new Date(d);
  next.setDate(next.getDate() + 1);
  return next.getMonth() !== d.getMonth();
}

const shimmerStyle: React.CSSProperties = {
  background: `linear-gradient(90deg, ${dk.borderLight} 25%, ${dk.border} 50%, ${dk.borderLight} 75%)`,
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: radius.md,
};

function GameSkeleton() {
  return (
    <div style={s.page}>
      <div style={{ ...s.header, padding: '20px 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ width: 44, height: 44, borderRadius: radius.sm, background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: 'rgba(255,255,255,0.15)', margin: '0 auto 8px' }} />
            <div style={{ width: 100, height: 20, borderRadius: 4, background: 'rgba(255,255,255,0.15)', margin: '0 auto' }} />
          </div>
          <div style={{ width: 44 }} />
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' }} />
        </div>
      </div>
      <div style={{ padding: '0 20px 120px' }}>
        <div style={{ ...shimmerStyle, height: 100, margin: '-8px 0 20px', borderRadius: radius.lg }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ ...shimmerStyle, height: 80 }} />
          ))}
        </div>
        <div style={{ ...shimmerStyle, height: 120, marginBottom: 24 }} />
        {[1, 2, 3].map(i => (
          <div key={i} style={{ ...shimmerStyle, height: 60, marginBottom: 8 }} />
        ))}
      </div>
    </div>
  );
}

interface DaySummary {
  day: number;
  xpGained: number;
  newCards: number;
  events: string[];
}

export default function GamePage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useT();
  const isMobile = useIsMobile();
  const { showToast } = useToast();
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
  const [daySummary, setDaySummary] = useState<DaySummary | null>(null);
  const prevLevelRef = useRef<number | null>(null);
  const pendingCardsRef = useRef<HTMLDivElement>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [bankCardHover, setBankCardHover] = useState(false);

  const fetchGame = useCallback(async () => {
    if (!gameId) return;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchGame();
  }, [user, authLoading, router, fetchGame]);

  const handleAdvanceDay = async (): Promise<void> => {
    setAdvancing(true);
    setError(null);
    const prevLevel = game?.level ?? null;
    const prevXp = game?.xp ?? 0;
    const prevCardCount = game?.pendingCards?.length ?? 0;
    const res = await api.game.submitAction(gameId, { type: 'advance_day' });
    setAdvancing(false);
    if (res.ok) {
      const resData = res.data as Record<string, unknown> | undefined;
      if (resData?.newBadges && Array.isArray(resData.newBadges) && (resData.newBadges as Badge[]).length > 0) {
        setNewBadges(resData.newBadges as Badge[]);
      }
      await fetchGame();
      const updatedGame = await api.game.get(gameId);
      if (updatedGame.ok && updatedGame.data) {
        const newXp = updatedGame.data.xp ?? 0;
        const newCardCount = updatedGame.data.pendingCards?.length ?? 0;
        const dayNum = updatedGame.data.currentDate ? new Date(updatedGame.data.currentDate).getDate() : 0;

        // Build day summary
        const events: string[] = [];
        if (resData?.events && Array.isArray(resData.events)) {
          (resData.events as { type: string; description: string }[])
            .filter(e => e.type !== 'day_advanced')
            .forEach(e => events.push(e.description));
        }
        if (resData?.randomEvents && Array.isArray(resData.randomEvents)) {
          (resData.randomEvents as { description: string }[]).forEach(e => events.push(e.description));
        }
        setDaySummary({
          day: dayNum > 0 ? dayNum - 1 : 0,
          xpGained: Math.max(0, newXp - prevXp),
          newCards: Math.max(0, newCardCount - prevCardCount),
          events,
        });
        setTimeout(() => setDaySummary(null), 8000);

        if (prevLevel !== null && updatedGame.data.level > prevLevel) {
          setLevelUpLevel(updatedGame.data.level);
        }

        // Scroll to pending cards if new ones appeared
        if (newCardCount > prevCardCount && pendingCardsRef.current) {
          setTimeout(() => {
            pendingCardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 300);
        }
      }
      showToast(t('game.dayAdvanced') || 'Day advanced!', 'success');
    } else {
      setError(res.error || t('game.failedToAdvance'));
    }
  };

  const handleToggleAutopay = async (billId: string, current: boolean): Promise<void> => {
    await api.game.submitAction(gameId, { type: 'set_autopay', payload: { billId, autopay: !current } });
    setBills(prev => prev.map(b => b.id === billId ? { ...b, autopay: !current } : b));
  };

  if (loading || authLoading) return <GameSkeleton />;
  if (error && !game) return <div style={s.page}><p style={{ color: dk.danger, textAlign: 'center', paddingTop: 80 }}>{error}</p></div>;
  if (!game) return <div style={s.page}><p style={{ color: dk.textMuted, textAlign: 'center', paddingTop: 80 }}>{t('game.gameNotFound')}</p></div>;

  const currency = game.currency || 'USD';
  const xpPct = game.xpToNextLevel ? Math.min(100, (game.xp / game.xpToNextLevel) * 100) : 0;
  const creditScore = game.creditHealthIndex ?? 0;
  const budgetScore = game.budgetScore ?? 0;
  const monthEnd = isLastDay(game.currentDate);
  const netWorth = game.netWorth ?? 0;
  const income = game.monthlyIncome ?? 0;

  const gameDate = game.currentDate ? new Date(game.currentDate) : null;
  const dayNumber = gameDate ? gameDate.getDate() : 1;
  const dateDisplay = gameDate ? gameDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Day 1';

  const quickActions = [
    { href: `/game/${gameId}/transfer`, icon: '💸', label: t('game.transfer') },
    { href: `/game/${gameId}/budget`, icon: '📊', label: t('game.budget') },
    { href: `/game/${gameId}/rewards`, icon: '🏆', label: t('game.rewards') },
    { href: `/banking`, icon: '🏦', label: 'Banking' },
    { href: `/game/${gameId}/mirror`, icon: '🪞', label: 'Mirror' },
    { href: `/game/${gameId}/monthly-report/${game.currentDate?.split('-')[0]}/${game.currentDate?.split('-')[1]}`, icon: '📋', label: t('game.report') },
  ];

  // Limit transactions to 5 for the main screen
  const visibleTransactions = transactions.slice(0, 5);

  // Stat accent colors
  const statAccents = [dk.primary, dk.accentCyan, dk.success, dk.success];

  return (
    <div style={s.page}>
      {/* Dark Gradient Header */}
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
        {/* XP Bar in header — cyan glow */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>⭐ XP</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{game.xp}{game.xpToNextLevel ? ` / ${game.xpToNextLevel}` : ''}</span>
          </div>
          <div style={s.xpTrack}>
            <div style={{
              ...s.xpFill,
              width: `${xpPct}%`,
              animation: 'xpGrow 0.8s ease',
              backgroundColor: dk.accentCyan,
              boxShadow: dk.glowCyan,
            }} />
          </div>
        </div>
      </div>

      <div style={{ ...s.content, padding: isMobile ? '0 16px 120px' : '0 20px 120px' }}>
        {/* Bank Card - Net Worth with 3D tilt on hover */}
        <div
          onMouseEnter={() => setBankCardHover(true)}
          onMouseLeave={() => setBankCardHover(false)}
          style={{
            ...s.bankCard,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            transform: bankCardHover
              ? 'perspective(800px) rotateY(-3deg) rotateX(2deg) scale(1.02)'
              : 'perspective(800px) rotateY(0) rotateX(0) scale(1)',
            boxShadow: bankCardHover
              ? '0 16px 48px rgba(67, 56, 202, 0.45)'
              : dk.shadowBankCard,
          }}
        >
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{t('game.totalNetWorth')}</p>
          <p style={{ margin: '8px 0 0', fontSize: isMobile ? 26 : 32, fontWeight: 700, color: '#FFF' }}>{fmt(netWorth, currency)}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', letterSpacing: 2 }}>•••• •••• •••• {Math.abs(netWorth % 10000).toString().padStart(4, '0')}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#FFF', letterSpacing: 1 }}>VISA</span>
          </div>
        </div>

        {/* Stats Grid — dark surface, accent colors */}
        <div style={{ ...s.statsGrid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)' }}>
          {/* Net Worth */}
          <div style={{ ...s.statCard, borderTop: `3px solid ${dk.primary}` }}>
            <p style={s.statLabel}>{t('game.netWorth')}</p>
            <p style={{ ...s.statValue, fontSize: isMobile ? 17 : 20, color: dk.primary }}>{fmt(netWorth, currency)}</p>
            <p style={{ margin: 0, fontSize: 12, color: netWorth >= 0 ? dk.success : dk.danger }}>{netWorth >= 0 ? `↑ ${t('game.positive')}` : `↓ ${t('game.negative')}`}</p>
          </div>
          {/* Income */}
          <div style={{ ...s.statCard, borderTop: `3px solid ${dk.accentCyan}` }}>
            <p style={s.statLabel}>{t('game.monthlyIncome')}</p>
            <p style={{ ...s.statValue, fontSize: isMobile ? 17 : 20, color: dk.accentCyan }}>{fmt(income, currency)}</p>
          </div>
          {/* Budget */}
          <div style={{ ...s.statCard, borderTop: `3px solid ${getScoreColor(budgetScore)}` }}>
            <p style={s.statLabel}>{t('game.budgetScore')}</p>
            <p style={{ ...s.statValue, fontSize: isMobile ? 17 : 20, color: getScoreColor(budgetScore) }}>{budgetScore}%</p>
            <div style={{ marginTop: 4, height: 4, borderRadius: 2, backgroundColor: dk.borderLight, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, width: `${Math.min(100, budgetScore)}%`, backgroundColor: getScoreColor(budgetScore), transition: 'width 0.5s ease' }} />
            </div>
          </div>
          {/* Credit Health */}
          <div style={{ ...s.statCard, borderTop: `3px solid ${getScoreColor(creditScore)}` }}>
            <p style={s.statLabel}>{t('game.creditHealth')}</p>
            <p style={{ ...s.statValue, fontSize: isMobile ? 17 : 20, color: getScoreColor(creditScore) }}>{creditScore}</p>
            <div style={{ marginTop: 4, height: 4, borderRadius: 2, backgroundColor: dk.borderLight, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, width: `${Math.min(100, creditScore)}%`, backgroundColor: getScoreColor(creditScore), transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ ...s.quickGrid, gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)' }}>
          {quickActions.map(item => (
            <Link key={item.icon + item.label} href={item.href} style={s.quickItem}>
              <div style={s.quickIcon}><span style={{ fontSize: 22 }}>{item.icon}</span></div>
              <span style={{ fontSize: 12, color: dk.textSecondary, fontWeight: 500 }}>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Date + Advance Day — prominent pulsing button */}
        <div style={s.dayCard}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: isMobile ? 28 : 36, fontWeight: 800, color: dk.textPrimary, letterSpacing: '-0.5px' }}>
              DAY {dayNumber}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: dk.textSecondary }}>📅 {dateDisplay}</p>
            {monthEnd && <span style={s.monthEndBadge}>🎉 {t('game.monthEnd')}</span>}
          </div>
          {error && <p style={{ color: dk.danger, textAlign: 'center', margin: '8px 0', fontSize: 13 }}>{error}</p>}
          <button
            onClick={handleAdvanceDay}
            disabled={advancing}
            style={{
              ...s.primaryBtn,
              opacity: advancing ? 0.7 : 1,
              marginTop: 16,
              animation: !advancing ? 'glowPulse 2s ease-in-out infinite' : 'none',
              fontSize: 18,
              height: 56,
              boxShadow: dk.glowPrimary,
            }}
          >
            {advancing ? `⏳ ${t('game.advancing')}` : `☀️ ${t('game.advanceDay')}`}
          </button>
        </div>

        {/* Day Summary Feedback */}
        {daySummary && (
          <div style={{
            padding: 16, borderRadius: radius.lg,
            background: dk.surfaceElevated,
            border: `1px solid ${dk.primary}33`,
            marginBottom: 20,
            animation: 'slideUp 0.4s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>🌟</span>
              <span style={{ fontWeight: 700, color: dk.textPrimary, fontSize: 15 }}>
                Day {daySummary.day} complete!
              </span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
              {daySummary.xpGained > 0 && (
                <span style={{ fontSize: 13, color: dk.accentCyan, fontWeight: 600 }}>+{daySummary.xpGained} XP</span>
              )}
              {daySummary.newCards > 0 && (
                <span style={{ fontSize: 13, color: dk.warning, fontWeight: 600 }}>{daySummary.newCards} new decisions</span>
              )}
            </div>
            {daySummary.events.length > 0 && (
              <div style={{ marginTop: 8 }}>
                {daySummary.events.map((evt, i) => (
                  <p key={i} style={{ margin: '4px 0 0', fontSize: 13, color: dk.textSecondary }}>⚡ {evt}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pending Cards — decision cards with category-colored left borders */}
        <div ref={pendingCardsRef}>
          {game.pendingCards && game.pendingCards.length > 0 ? (
            <div style={s.section}>
              <h2 style={s.sectionTitle}>
                ⚡ {t('game.decisionsNeeded')}
                <span style={{
                  marginLeft: 8, display: 'inline-block', padding: '2px 10px',
                  borderRadius: radius.pill, background: dk.primary, color: '#FFF',
                  fontSize: 12, fontWeight: 700, verticalAlign: 'middle',
                }}>
                  {game.pendingCards.length}
                </span>
              </h2>
              {game.pendingCards.map(card => {
                const catColor = CATEGORY_COLORS[(card as any).category?.toLowerCase()] || dk.primary;
                const isHovered = hoveredCard === card.id;
                return (
                  <div
                    key={card.id}
                    onMouseEnter={() => setHoveredCard(card.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => router.push(`/game/${gameId}/card/${card.id}`)}
                    style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? 10 : 0,
                      alignItems: isMobile ? 'flex-start' : 'center',
                      justifyContent: 'space-between',
                      padding: 16,
                      borderRadius: radius.lg,
                      marginBottom: 8,
                      background: dk.surfaceElevated,
                      borderLeft: `4px solid ${catColor}`,
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: isHovered ? `0 0 16px ${catColor}33` : dk.shadowCard,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, color: dk.textPrimary }}>{card.title || card.cardId}</p>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: dk.textSecondary }}>{card.description || t('game.makeDecision')}</p>
                    </div>
                    <span style={s.decidePill}>{t('game.decide')} →</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 32, background: dk.surface, borderRadius: radius.lg, boxShadow: dk.shadowCard, marginBottom: 28, border: `1px solid ${dk.border}` }}>
              <span style={{ fontSize: 40 }}>✅</span>
              <p style={{ color: dk.textSecondary, margin: '8px 0 0', fontSize: 14 }}>All caught up! Advance to the next day for new decisions.</p>
            </div>
          )}
        </div>

        {/* Accounts — dark cards */}
        {game.accounts && game.accounts.length > 0 && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>💰 {t('game.accounts')}</h2>
            {game.accounts.map(acc => (
              <div key={acc.id} style={{
                ...s.accountCard,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 8 : 0,
                alignItems: isMobile ? 'flex-start' : 'center',
              }} onClick={() => router.push(`/game/${gameId}/account/${acc.id}`)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={s.accountIcon}><span style={{ fontSize: 20 }}>{ACCOUNT_ICONS[acc.type] || '🏦'}</span></div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: dk.textPrimary }}>{acc.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: dk.textMuted }}>{acc.type}{acc.interestRate ? ` · ${acc.interestRate}% APR` : ''}</p>
                  </div>
                </div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: acc.balance >= 0 ? dk.success : dk.danger }}>
                  {fmt(acc.balance, acc.currency || currency)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Bills — dark cards with autopay toggle */}
        {bills.length > 0 && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>📬 {t('game.upcomingBills')}</h2>
            {bills.map(bill => (
              <div key={bill.id} style={{
                ...s.billCard,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 8 : 0,
                alignItems: isMobile ? 'flex-start' : 'center',
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: dk.textPrimary }}>{bill.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: dk.textMuted }}>{t('game.dueDay', { day: bill.dueDay || (bill.dueDate ? new Date(bill.dueDate).getDate() : '?') })} · {bill.category}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                  <p style={{ margin: 0, fontWeight: 600, color: dk.textPrimary }}>{fmt(bill.amount, currency)}</p>
                  <button
                    onClick={() => handleToggleAutopay(bill.id, bill.autopay)}
                    style={{
                      padding: '6px 14px', borderRadius: radius.pill,
                      border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      minHeight: 44, minWidth: 44,
                      backgroundColor: bill.autopay ? 'rgba(52, 211, 153, 0.2)' : dk.borderLight,
                      color: bill.autopay ? dk.success : dk.textMuted,
                      transition: 'all 0.2s',
                    }}
                  >
                    {bill.autopay ? `✓ ${t('game.auto')}` : t('game.manual')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Transactions — limited to 5, category colored left borders */}
        {transactions.length > 0 ? (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>📊 {t('game.recentActivity')}</h2>
            {visibleTransactions.map(tx => {
              const catColor = TX_CATEGORY_COLORS[(tx.category || '').toLowerCase()] || dk.textMuted;
              return (
                <div key={tx.id} style={{
                  ...s.txRow,
                  borderLeft: `3px solid ${catColor}`,
                  paddingLeft: 12,
                  borderRadius: radius.sm,
                  marginBottom: 6,
                  background: dk.surface,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                    <div style={{ ...s.txIcon, backgroundColor: catColor + '18', color: catColor }}>
                      <span style={{ fontSize: 16 }}>{tx.amount >= 0 ? '↓' : '↑'}</span>
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 500, color: dk.textPrimary, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: dk.textMuted }}>{tx.date} · {tx.category}</p>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: tx.amount >= 0 ? dk.success : dk.danger, whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {tx.amount >= 0 ? '+' : ''}{fmt(tx.amount, currency)}
                  </p>
                </div>
              );
            })}
            {transactions.length > 5 && (
              <button
                onClick={() => router.push(`/game/${gameId}/transactions`)}
                style={{
                  width: '100%', padding: '10px 0', borderRadius: radius.md,
                  background: 'transparent', border: `1px solid ${dk.border}`,
                  cursor: 'pointer', fontSize: 13, fontWeight: 600, color: dk.primary,
                  marginTop: 8, transition: 'all 0.2s',
                }}
              >
                View all →
              </button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40, background: dk.surface, borderRadius: radius.lg, boxShadow: dk.shadowCard, border: `1px solid ${dk.border}` }}>
            <span style={{ fontSize: 48 }}>📭</span>
            <p style={{ color: dk.textSecondary, margin: '12px 0 0' }}>No transactions yet. Start making decisions!</p>
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

      {/* Bottom Nav — dark bg with blur */}
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
            style={{
              ...s.navTab,
              color: activeTab === tab.key ? dk.primary : dk.textMuted,
              minWidth: 44, minHeight: 44, justifyContent: 'center',
              textShadow: activeTab === tab.key ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none',
            }}
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
  page: { minHeight: '100vh', backgroundColor: dk.background },
  header: { background: dk.primaryGradient, padding: '20px 24px 24px', borderRadius: `0 0 ${radius.xl}px ${radius.xl}px` },
  headerBackBtn: { width: 44, height: 44, borderRadius: radius.sm, border: 'none', background: 'rgba(255,255,255,0.2)', color: '#FFF', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  diffBadge: { display: 'inline-block', padding: '3px 12px', borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFF', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' as const },
  xpTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s' },
  content: { padding: '0 20px 120px' },
  bankCard: { margin: '-8px 0 20px', padding: 24, borderRadius: radius.lg, background: dk.cardGradient, boxShadow: dk.shadowBankCard },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 },
  statCard: { padding: 16, borderRadius: radius.md, background: dk.surface, boxShadow: dk.shadowCard, border: `1px solid ${dk.border}` },
  statLabel: { margin: 0, fontSize: 12, color: dk.textMuted, marginBottom: 4 },
  statValue: { margin: 0, fontSize: 20, fontWeight: 700, color: dk.textPrimary },
  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
  quickItem: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, textDecoration: 'none', minHeight: 44 },
  quickIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: dk.surfaceElevated, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${dk.border}`, transition: 'all 0.2s' },
  dayCard: { padding: 24, borderRadius: radius.lg, background: dk.surface, boxShadow: dk.shadowCard, marginBottom: 24, border: `1px solid ${dk.border}` },
  monthEndBadge: { display: 'inline-block', marginTop: 6, padding: '4px 12px', borderRadius: radius.pill, backgroundColor: 'rgba(251, 191, 36, 0.15)', color: dk.warning, fontSize: 12, fontWeight: 600 },
  primaryBtn: { width: '100%', padding: '14px 28px', borderRadius: radius.md, background: dk.primaryGradient, color: '#FFF', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', height: 52, transition: 'all 0.2s' },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 17, fontWeight: 600, color: dk.textPrimary, marginBottom: 12 },
  decidePill: { padding: '8px 18px', borderRadius: radius.pill, background: dk.primaryGradient, color: '#FFF', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' as const, minHeight: 44, display: 'inline-flex', alignItems: 'center', boxShadow: dk.glowPrimary },
  accountCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: radius.lg, marginBottom: 8, background: dk.surface, boxShadow: dk.shadowCard, cursor: 'pointer', border: `1px solid ${dk.border}`, transition: 'all 0.2s' },
  accountIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: dk.surfaceElevated, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${dk.border}` },
  billCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: radius.lg, marginBottom: 8, background: dk.surface, boxShadow: dk.shadowCard, border: `1px solid ${dk.border}` },
  txRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 12px 12px 12px', borderBottom: 'none' },
  txIcon: { width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bottomNav: {
    position: 'fixed' as const, bottom: 0, left: 0, right: 0,
    display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px',
    background: 'rgba(33, 27, 58, 0.85)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderTop: `1px solid ${dk.border}`, zIndex: 50,
  },
  navTab: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2, textDecoration: 'none' },
};

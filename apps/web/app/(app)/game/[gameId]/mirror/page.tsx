'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../src/lib/auth-context';
import {
  api,
  type GameResponse,
  type MirrorComparison,
  type MirrorDashboard,
  type CategoryComparison,
  type MirrorInsight,
  type LinkedAccount,
} from '../../../../../src/lib/api';
import { colors, radius, shadows } from '../../../../../src/lib/design-tokens';
import { useIsMobile } from '../../../../../src/hooks/useIsMobile';

const CATEGORY_ICONS: Record<string, string> = {
  housing: '🏠', food: '🍕', transport: '🚗', entertainment: '🎮',
  utilities: '💡', health: '🏥', education: '📚', shopping: '🛍️', other: '📦',
};

const SEVERITY_COLORS: Record<string, string> = {
  warning: '#F59E0B',
  info: '#6366F1',
  positive: '#10B981',
};

function fmt(cents: number, currency: string): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });
}

function getScoreColor(score: number): string {
  if (score >= 75) return colors.success;
  if (score >= 50) return colors.warning;
  return colors.danger;
}

export default function MirrorPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<GameResponse | null>(null);
  const [dashboard, setDashboard] = useState<MirrorDashboard | null>(null);
  const [comparison, setComparison] = useState<MirrorComparison | null>(null);
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [viewMode, setViewMode] = useState<'dashboard' | 'month'>('dashboard');

  const currency = game?.currency || 'USD';

  const fetchData = useCallback(async () => {
    const [gameRes, acctRes] = await Promise.all([
      api.game.get(gameId),
      api.banking.listAccounts(),
    ]);
    if (gameRes.ok && gameRes.data) setGame(gameRes.data);
    if (acctRes.ok && acctRes.data) setAccounts(acctRes.data);

    // Fetch dashboard
    const dashRes = await api.banking.getMirror(gameId);
    if (dashRes.ok && dashRes.data && 'comparisons' in dashRes.data) {
      setDashboard(dashRes.data as MirrorDashboard);
    }
    setLoading(false);
  }, [gameId]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading, router, fetchData]);

  const loadMonth = async (year: number, month: number): Promise<void> => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setViewMode('month');
    const res = await api.banking.getMirror(gameId, year, month);
    if (res.ok && res.data && 'similarityScore' in res.data) {
      setComparison(res.data as MirrorComparison);
    }
  };

  if (loading || authLoading) {
    return (
      <div style={s.page}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 }}>
          <div style={{ width: 24, height: 24, border: `3px solid ${colors.borderLight}`, borderTopColor: colors.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: colors.textMuted }}>Loading Mirror Mode...</p>
        </div>
      </div>
    );
  }

  // No linked accounts — prompt to connect
  if (accounts.length === 0) {
    return (
      <div style={s.page}>
        <div style={{ ...s.header, padding: isMobile ? '16px 16px 24px' : '20px 24px 28px' }}>
          <button onClick={() => router.push(`/game/${gameId}`)} style={s.backBtn}>←</button>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <span style={{ fontSize: isMobile ? 32 : 40 }}>🪞</span>
            <h1 style={{ ...s.headerTitle, fontSize: isMobile ? 18 : 22 }}>Mirror Mode</h1>
          </div>
          <div style={{ width: 44 }} />
        </div>
        <div style={{ ...s.content, padding: isMobile ? '20px 16px 120px' : '20px 20px 120px' }}>
          <div style={s.emptyCard}>
            <span style={{ fontSize: 48 }}>🏦</span>
            <h2 style={s.emptyTitle}>Connect a Bank First</h2>
            <p style={s.emptyDesc}>Link your bank account to compare real spending with your in-game decisions.</p>
            <button onClick={() => router.push('/banking')} style={s.primaryBtn}>
              Go to Banking
            </button>
          </div>
        </div>
      </div>
    );
  }

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ ...s.header, padding: isMobile ? '16px 16px 24px' : '20px 24px 28px' }}>
        <button onClick={() => router.push(`/game/${gameId}`)} style={s.backBtn}>←</button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <span style={{ fontSize: isMobile ? 32 : 40 }}>🪞</span>
          <h1 style={{ ...s.headerTitle, fontSize: isMobile ? 18 : 22 }}>Mirror Mode</h1>
          <p style={s.headerSub}>Game vs Reality</p>
        </div>
        <div style={{ width: 44 }} />
      </div>

      <div style={{ ...s.content, padding: isMobile ? '20px 16px 120px' : '20px 20px 120px' }}>
        {/* View mode toggle */}
        <div style={s.toggleRow}>
          <button
            onClick={() => setViewMode('dashboard')}
            style={{ ...s.toggleBtn, ...(viewMode === 'dashboard' ? s.toggleActive : {}), minHeight: 44 }}
          >
            Overview
          </button>
          <button
            onClick={() => loadMonth(selectedYear, selectedMonth)}
            style={{ ...s.toggleBtn, ...(viewMode === 'month' ? s.toggleActive : {}), minHeight: 44 }}
          >
            Monthly
          </button>
        </div>

        {viewMode === 'dashboard' && dashboard && (
          <>
            {/* Overall Score */}
            <div style={s.scoreCard}>
              <p style={s.scoreLabel}>Overall Similarity</p>
              <p style={{ ...s.scoreValue, color: getScoreColor(dashboard.overallSimilarity), fontSize: isMobile ? 44 : 56 }}>
                {dashboard.overallSimilarity}%
              </p>
              <p style={s.trendBadge}>
                {dashboard.trend === 'improving' && '📈 Improving'}
                {dashboard.trend === 'stable' && '➡️ Stable'}
                {dashboard.trend === 'declining' && '📉 Declining'}
              </p>
            </div>

            {/* Top Differences */}
            {dashboard.topDifferences.length > 0 && (
              <div style={s.section}>
                <h2 style={s.sectionTitle}>Top Differences</h2>
                {dashboard.topDifferences.map(diff => (
                  <DifferenceBar key={diff.category} diff={diff} currency={currency} isMobile={isMobile} />
                ))}
              </div>
            )}

            {/* Monthly History */}
            {dashboard.comparisons.length > 0 && (
              <div style={s.section}>
                <h2 style={s.sectionTitle}>Monthly History</h2>
                {dashboard.comparisons.map(comp => {
                  const d = new Date(comp.periodStart);
                  return (
                    <div
                      key={comp.id}
                      style={{ ...s.historyCard, padding: isMobile ? 14 : 16 }}
                      onClick={() => loadMonth(d.getFullYear(), d.getMonth() + 1)}
                    >
                      <div>
                        <p style={s.historyMonth}>{MONTHS[d.getMonth()]} {d.getFullYear()}</p>
                        <p style={s.historyMeta}>{comp.categories.length} categories compared</p>
                      </div>
                      <div style={{ textAlign: 'right' as const }}>
                        <p style={{ ...s.historyScore, color: getScoreColor(comp.similarityScore), fontSize: isMobile ? 18 : 22 }}>
                          {comp.similarityScore}%
                        </p>
                        <p style={s.historyMeta}>similarity</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {dashboard.comparisons.length === 0 && (
              <div style={s.emptyCard}>
                <span style={{ fontSize: 36 }}>📊</span>
                <p style={s.emptyDesc}>No comparisons yet. Sync your bank transactions and select a month to compare.</p>
              </div>
            )}
          </>
        )}

        {viewMode === 'month' && (
          <>
            {/* Month selector */}
            <div style={s.monthSelector}>
              <button onClick={() => {
                const m = selectedMonth - 1;
                if (m < 1) loadMonth(selectedYear - 1, 12);
                else loadMonth(selectedYear, m);
              }} style={s.monthArrow}>←</button>
              <span style={s.monthLabel}>{MONTHS[selectedMonth - 1]} {selectedYear}</span>
              <button onClick={() => {
                const m = selectedMonth + 1;
                if (m > 12) loadMonth(selectedYear + 1, 1);
                else loadMonth(selectedYear, m);
              }} style={s.monthArrow}>→</button>
            </div>

            {comparison ? (
              <>
                {/* Score */}
                <div style={s.scoreCard}>
                  <p style={s.scoreLabel}>Similarity Score</p>
                  <p style={{ ...s.scoreValue, color: getScoreColor(comparison.similarityScore), fontSize: isMobile ? 44 : 56 }}>
                    {comparison.similarityScore}%
                  </p>
                </div>

                {/* Side-by-side bars */}
                <div style={s.section}>
                  <h2 style={s.sectionTitle}>Spending by Category</h2>
                  <div style={s.legendRow}>
                    <span style={s.legendGame}>■ In-Game</span>
                    <span style={s.legendReal}>■ Real (IRL)</span>
                  </div>
                  {comparison.categories.map(cat => (
                    <CategoryBar key={cat.category} cat={cat} currency={currency} isMobile={isMobile} />
                  ))}
                </div>

                {/* Insights */}
                {comparison.insights.length > 0 && (
                  <div style={s.section}>
                    <h2 style={s.sectionTitle}>Insights</h2>
                    {comparison.insights.map((insight, i) => (
                      <InsightCard key={i} insight={insight} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={s.emptyCard}>
                <span style={{ fontSize: 36 }}>📊</span>
                <p style={s.emptyDesc}>No data for this month yet. Make sure you have synced bank transactions covering this period.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ ...s.bottomNav, paddingBottom: 'env(safe-area-inset-bottom, 14px)' }}>
        <button onClick={() => router.push(`/game/${gameId}`)} style={s.navTab}>
          <span style={{ fontSize: 22 }}>🏠</span>
          {!isMobile && <span style={{ fontSize: 11 }}>Game</span>}
        </button>
        <button onClick={() => router.push('/banking')} style={s.navTab}>
          <span style={{ fontSize: 22 }}>🏦</span>
          {!isMobile && <span style={{ fontSize: 11 }}>Banking</span>}
        </button>
        <button style={{ ...s.navTab, color: '#7C3AED' }}>
          <span style={{ fontSize: 22 }}>🪞</span>
          {!isMobile && <span style={{ fontSize: 11, fontWeight: 600 }}>Mirror</span>}
        </button>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CategoryBar({ cat, currency, isMobile }: { cat: CategoryComparison; currency: string; isMobile: boolean }): React.ReactElement {
  const maxAmount = Math.max(cat.gameAmount, cat.realAmount, 1);
  const gamePct = (cat.gameAmount / maxAmount) * 100;
  const realPct = (cat.realAmount / maxAmount) * 100;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>
          {CATEGORY_ICONS[cat.category] || '📦'} {cat.category}
        </span>
        <span style={{ fontSize: 12, color: colors.textMuted }}>
          {cat.differencePercent > 0 ? '+' : ''}{cat.differencePercent}%
        </span>
      </div>
      {/* Game bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: colors.textMuted, width: 40 }}>Game</span>
        <div style={barStyles.track}>
          <div style={{ ...barStyles.fillGame, width: `${gamePct}%` }} />
        </div>
        <span style={{ fontSize: 11, color: colors.textMuted, minWidth: isMobile ? 55 : 65, textAlign: 'right' as const }}>
          {fmt(cat.gameAmount, currency)}
        </span>
      </div>
      {/* Real bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: colors.textMuted, width: 40 }}>Real</span>
        <div style={barStyles.track}>
          <div style={{ ...barStyles.fillReal, width: `${realPct}%` }} />
        </div>
        <span style={{ fontSize: 11, color: colors.textMuted, minWidth: isMobile ? 55 : 65, textAlign: 'right' as const }}>
          {fmt(cat.realAmount, currency)}
        </span>
      </div>
    </div>
  );
}

function DifferenceBar({ diff, currency, isMobile }: { diff: CategoryComparison; currency: string; isMobile: boolean }): React.ReactElement {
  const isOver = diff.differencePercent > 0;
  return (
    <div style={{ ...s.diffCard, borderLeft: `3px solid ${isOver ? colors.warning : colors.success}`, padding: isMobile ? 12 : 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>
          {CATEGORY_ICONS[diff.category] || '📦'} {diff.category}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: isOver ? colors.warning : colors.success }}>
          {isOver ? '+' : ''}{diff.differencePercent}% IRL
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 12, color: colors.textMuted }}>Game: {fmt(diff.gameAmount, currency)}</span>
        <span style={{ fontSize: 12, color: colors.textMuted }}>Real: {fmt(diff.realAmount, currency)}</span>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: MirrorInsight }): React.ReactElement {
  const iconMap: Record<string, string> = {
    overspend: '⚠️', underspend: '💚', match: '✅', missing: '❓',
  };
  return (
    <div style={{ ...s.insightCard, borderLeft: `3px solid ${SEVERITY_COLORS[insight.severity] || colors.textMuted}` }}>
      <span style={{ fontSize: 16 }}>{iconMap[insight.type] || '💡'}</span>
      <p style={{ margin: 0, fontSize: 13, color: colors.textPrimary, lineHeight: 1.5 }}>
        {insight.message}
      </p>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const purpleGradient = 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #C084FC 100%)';

const barStyles: Record<string, React.CSSProperties> = {
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.borderLight, overflow: 'hidden' },
  fillGame: { height: '100%', borderRadius: 4, backgroundColor: '#6366F1', transition: 'width 0.3s' },
  fillReal: { height: '100%', borderRadius: 4, backgroundColor: '#A855F7', transition: 'width 0.3s' },
};

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: colors.background },
  header: {
    background: purpleGradient,
    padding: '20px 24px 28px',
    borderRadius: `0 0 ${radius.xl}px ${radius.xl}px`,
    display: 'flex', alignItems: 'flex-start',
  },
  backBtn: {
    width: 44, height: 44, borderRadius: radius.sm, border: 'none',
    background: 'rgba(255,255,255,0.2)', color: '#FFF', fontSize: 16, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { margin: '8px 0 4px', fontSize: 22, fontWeight: 700, color: '#FFF' },
  headerSub: { margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  content: { padding: '20px 20px 120px' },

  toggleRow: {
    display: 'flex', gap: 8, marginBottom: 20, backgroundColor: colors.borderLight,
    borderRadius: radius.md, padding: 4,
  },
  toggleBtn: {
    flex: 1, padding: '10px 16px', borderRadius: radius.sm, border: 'none',
    background: 'transparent', fontSize: 14, fontWeight: 500, cursor: 'pointer',
    color: colors.textMuted,
  },
  toggleActive: {
    background: '#FFF', color: '#7C3AED', fontWeight: 600,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },

  scoreCard: {
    padding: 28, borderRadius: radius.lg, background: colors.surface,
    boxShadow: shadows.elevated, textAlign: 'center' as const, marginBottom: 24,
  },
  scoreLabel: { margin: 0, fontSize: 14, color: colors.textMuted, marginBottom: 4 },
  scoreValue: { margin: '8px 0', fontSize: 56, fontWeight: 800, lineHeight: 1 },
  trendBadge: {
    display: 'inline-block', marginTop: 8, padding: '4px 16px',
    borderRadius: radius.pill, backgroundColor: colors.borderLight,
    fontSize: 13, color: colors.textPrimary, fontWeight: 500,
  },

  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 17, fontWeight: 600, color: colors.textPrimary, marginBottom: 16 },

  legendRow: {
    display: 'flex', gap: 20, marginBottom: 16, fontSize: 12, color: colors.textMuted,
  },
  legendGame: { color: '#6366F1', fontWeight: 600 },
  legendReal: { color: '#A855F7', fontWeight: 600 },

  monthSelector: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, marginBottom: 20,
  },
  monthArrow: {
    width: 44, height: 44, borderRadius: 22, border: `1px solid ${colors.border}`,
    background: colors.surface, fontSize: 16, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  monthLabel: { fontSize: 18, fontWeight: 700, color: colors.textPrimary },

  diffCard: {
    padding: 14, borderRadius: radius.md, background: colors.surface,
    boxShadow: shadows.card, marginBottom: 8,
  },

  insightCard: {
    display: 'flex', gap: 10, alignItems: 'flex-start',
    padding: 14, borderRadius: radius.md, background: colors.surface,
    boxShadow: shadows.card, marginBottom: 8,
  },

  emptyCard: {
    padding: 28, borderRadius: radius.lg, background: colors.surface,
    textAlign: 'center' as const, boxShadow: shadows.card,
  },
  emptyTitle: { margin: '12px 0 8px', fontSize: 20, fontWeight: 700, color: colors.textPrimary },
  emptyDesc: { margin: '0 0 20px', fontSize: 14, color: colors.textSecondary, lineHeight: 1.5 },
  primaryBtn: {
    padding: '12px 28px', borderRadius: radius.md, background: purpleGradient,
    color: '#FFF', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
    minHeight: 52,
  },

  historyCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderRadius: radius.lg, marginBottom: 8,
    background: colors.surface, boxShadow: shadows.card, cursor: 'pointer',
    minHeight: 44,
  },
  historyMonth: { margin: 0, fontWeight: 600, fontSize: 15, color: colors.textPrimary },
  historyMeta: { margin: '2px 0 0', fontSize: 12, color: colors.textMuted },
  historyScore: { margin: 0, fontSize: 22, fontWeight: 800 },

  bottomNav: {
    position: 'fixed' as const, bottom: 0, left: 0, right: 0,
    display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px',
    background: colors.surface, borderTop: `1px solid ${colors.border}`, zIndex: 50,
  },
  navTab: {
    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2,
    background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted,
    minWidth: 44, minHeight: 44, justifyContent: 'center',
  },
};

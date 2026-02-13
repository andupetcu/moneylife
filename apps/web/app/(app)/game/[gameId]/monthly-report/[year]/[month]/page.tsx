'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../../../src/lib/auth-context';
import { api, type MonthlyReport } from '../../../../../../../src/lib/api';
import { colors, radius, shadows } from '../../../../../../../src/lib/design-tokens';
import { useT } from '../../../../../../../src/lib/useT';
import { useIsMobile } from '../../../../../../../src/hooks/useIsMobile';

function fmt(amount: number, currency: string): string {
  return (amount / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });
}

function chiColor(score: number): string {
  if (score >= 750) return colors.success;
  if (score >= 650) return '#3B82F6';
  if (score >= 500) return colors.warning;
  return colors.danger;
}

function chiLabel(score: number, t: (key: string) => string): string {
  if (score >= 750) return t('creditHealth.excellent');
  if (score >= 650) return t('creditHealth.good');
  if (score >= 500) return t('creditHealth.fair');
  return t('creditHealth.poor');
}

export default function MonthlyReportPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useT();
  const isMobile = useIsMobile();
  const gameId = params.gameId as string;
  const year = parseInt(params.year as string);
  const month = parseInt(params.month as string);

  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    const res = await api.game.getMonthlyReport(gameId, year, month);
    if (res.ok && res.data) setReport(res.data);
    else setError(res.error || t('monthlyReview.reportNotAvailable'));
    setLoading(false);
  }, [gameId, year, month, t]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchReport();
  }, [user, authLoading, router, fetchReport]);

  if (loading || authLoading) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>{t('common.loading')}</p></div>;
  if (error || !report) return (
    <div style={s.page}>
      <div style={s.headerBar}>
        <button onClick={() => router.push(`/game/${gameId}`)} style={s.headerBack}>←</button>
        <span style={s.headerTitle}>{t('monthlyReview.monthlyReport')}</span>
        <div style={{ width: 44 }} />
      </div>
      <div style={s.content}>
        <p style={{ color: colors.danger }}>{error || t('monthlyReview.noReportData')}</p>
      </div>
    </div>
  );

  const currency = 'USD';
  const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const xpPct = report.xpToNextLevel ? Math.min(100, (report.xp / report.xpToNextLevel) * 100) : 0;
  const chiPct = Math.min(100, (report.creditHealthIndex / 850) * 100);
  const maxBar = Math.max(report.totalIncome, report.totalExpenses, 1);

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.headerBar}>
        <button onClick={() => router.push(`/game/${gameId}`)} style={s.headerBack}>←</button>
        <span style={s.headerTitle}>{monthName}</span>
        <div style={{ width: 44 }} />
      </div>

      <div style={{ ...s.content, padding: isMobile ? 16 : 20 }}>
        {/* Bank Card */}
        <div style={s.bankCard}>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{t('monthlyReview.netBalance')}</p>
          <p style={{ margin: '8px 0 0', fontSize: isMobile ? 24 : 28, fontWeight: 700, color: '#FFF' }}>
            {fmt(report.totalIncome - report.totalExpenses, currency)}
          </p>
        </div>

        {/* Income vs Expenses Bars */}
        <div style={s.card}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.success }}>{t('monthlyReview.income')}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: colors.success }}>{fmt(report.totalIncome, currency)}</span>
            </div>
            <div style={s.barTrack}>
              <div style={{ height: '100%', borderRadius: 4, width: `${(report.totalIncome / maxBar) * 100}%`, backgroundColor: colors.success }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.danger }}>{t('monthlyReview.expenses')}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: colors.danger }}>{fmt(report.totalExpenses, currency)}</span>
            </div>
            <div style={s.barTrack}>
              <div style={{ height: '100%', borderRadius: 4, width: `${(report.totalExpenses / maxBar) * 100}%`, backgroundColor: colors.danger }} />
            </div>
          </div>
        </div>

        {/* Savings Rate */}
        <div style={s.card}>
          <p style={s.cardLabel}>{t('monthlyReview.savingsRate')}</p>
          <p style={{ margin: 0, fontSize: isMobile ? 28 : 32, fontWeight: 700, color: report.savingsRate >= 20 ? colors.success : report.savingsRate >= 0 ? colors.warning : colors.danger }}>
            {report.savingsRate.toFixed(1)}%
          </p>
        </div>

        {/* Category Breakdown */}
        {report.categoryBreakdown && Object.keys(report.categoryBreakdown).length > 0 && (
          <div style={{ ...s.card, overflowX: 'auto' as const }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: colors.textPrimary }}>{t('monthlyReview.categoryBreakdown')}</h2>
            {Object.entries(report.categoryBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
              <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${colors.borderLight}` }}>
                <span style={{ fontWeight: 500, color: colors.textPrimary, textTransform: 'capitalize' as const, fontSize: isMobile ? 13 : 14 }}>{cat}</span>
                <span style={{ fontWeight: 600, color: colors.textPrimary, fontSize: isMobile ? 13 : 14 }}>{fmt(amount, currency)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Credit Health */}
        <div style={s.card}>
          <p style={s.cardLabel}>{t('monthlyReview.creditHealthIndex')}</p>
          <p style={{ margin: '4px 0', fontSize: isMobile ? 28 : 32, fontWeight: 700, color: chiColor(report.creditHealthIndex) }}>{report.creditHealthIndex}</p>
          <p style={{ margin: '0 0 8px', fontSize: 13, color: chiColor(report.creditHealthIndex), fontWeight: 600 }}>{chiLabel(report.creditHealthIndex, t)}</p>
          <div style={s.gaugeTrack}>
            <div style={{ height: '100%', borderRadius: 5, width: `${chiPct}%`, backgroundColor: chiColor(report.creditHealthIndex), transition: 'width 0.5s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
            <span>0</span><span>425</span><span>850</span>
          </div>
        </div>

        {/* Budget Adherence */}
        <div style={s.card}>
          <p style={s.cardLabel}>{t('monthlyReview.budgetAdherence')}</p>
          <p style={{ margin: 0, fontSize: isMobile ? 28 : 32, fontWeight: 700, color: colors.textPrimary }}>{report.budgetAdherence}%</p>
        </div>

        {/* XP & Level */}
        <div style={s.card}>
          <p style={s.cardLabel}>{t('monthlyReview.xpEarnedThisMonth')}</p>
          <p style={{ margin: '4px 0 12px', fontSize: isMobile ? 24 : 28, fontWeight: 700, color: colors.primary }}>+{report.xpEarned} XP</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>
            <span>{t('game.level', { level: report.level })}</span>
            <span>{report.xp} / {report.xpToNextLevel} XP</span>
          </div>
          <div style={s.xpTrack}><div style={{ height: '100%', borderRadius: 4, width: `${xpPct}%`, backgroundColor: colors.primary, transition: 'width 0.3s' }} /></div>
        </div>

        <button onClick={() => router.push(`/game/${gameId}`)} style={s.primaryBtn}>
          🎮 {t('monthlyReview.continuePlaying')}
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: colors.background },
  headerBar: { background: colors.primaryGradient, padding: '16px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  headerBack: { width: 44, height: 44, borderRadius: radius.sm, border: 'none', background: 'rgba(255,255,255,0.2)', color: '#FFF', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 700, color: '#FFF' },
  content: { padding: 20 },
  bankCard: { margin: '-8px 0 20px', padding: 24, borderRadius: radius.lg, background: colors.cardGradient, boxShadow: shadows.bankCard },
  card: { padding: 20, borderRadius: radius.lg, background: colors.surface, boxShadow: shadows.card, marginBottom: 16, textAlign: 'center' as const },
  cardLabel: { margin: '0 0 4px', fontSize: 13, color: colors.textMuted },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: colors.borderLight, overflow: 'hidden' },
  gaugeTrack: { height: 10, borderRadius: 5, backgroundColor: colors.borderLight, overflow: 'hidden' },
  xpTrack: { height: 8, borderRadius: 4, backgroundColor: colors.borderLight, overflow: 'hidden' },
  primaryBtn: { width: '100%', height: 52, borderRadius: radius.md, background: colors.primaryGradient, color: '#FFF', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8 },
};

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../../../src/lib/auth-context';
import { api, type MonthlyReport } from '../../../../../../../src/lib/api';

function fmt(amount: number, currency: string): string {
  return (amount / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });
}

function chiColor(score: number): string {
  if (score >= 750) return '#10B981';
  if (score >= 650) return '#3B82F6';
  if (score >= 500) return '#F59E0B';
  return '#EF4444';
}

function chiLabel(score: number): string {
  if (score >= 750) return 'Excellent';
  if (score >= 650) return 'Good';
  if (score >= 500) return 'Fair';
  return 'Poor';
}

export default function MonthlyReportPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const gameId = params.gameId as string;
  const year = parseInt(params.year as string);
  const month = parseInt(params.month as string);

  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    const res = await api.game.getMonthlyReport(gameId, year, month);
    if (res.ok && res.data) setReport(res.data);
    else setError(res.error || 'Report not available yet');
    setLoading(false);
  }, [gameId, year, month]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchReport();
  }, [user, authLoading, router, fetchReport]);

  if (loading || authLoading) return <div style={s.container}><p style={{ color: '#9CA3AF' }}>Loading...</p></div>;
  if (error || !report) return (
    <div style={s.container}>
      <p style={{ color: '#EF4444' }}>{error || 'No report data'}</p>
      <button onClick={() => router.push(`/game/${gameId}`)} style={s.backBtn}>← Back to Game</button>
    </div>
  );

  const currency = 'USD';
  const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const xpPct = report.xpToNextLevel ? Math.min(100, (report.xp / report.xpToNextLevel) * 100) : 0;
  const chiPct = Math.min(100, (report.creditHealthIndex / 850) * 100);

  return (
    <div style={s.container}>
      <h1 style={s.title}>📊 Monthly Report</h1>
      <p style={s.subtitle}>{monthName}</p>

      {/* Income vs Expenses */}
      <div style={s.summaryGrid}>
        <div style={{ ...s.summaryCard, borderLeft: '4px solid #10B981' }}>
          <p style={s.summaryLabel}>Income</p>
          <p style={{ ...s.summaryValue, color: '#10B981' }}>{fmt(report.totalIncome, currency)}</p>
        </div>
        <div style={{ ...s.summaryCard, borderLeft: '4px solid #EF4444' }}>
          <p style={s.summaryLabel}>Expenses</p>
          <p style={{ ...s.summaryValue, color: '#EF4444' }}>{fmt(report.totalExpenses, currency)}</p>
        </div>
      </div>

      {/* Savings Rate */}
      <div style={s.card}>
        <p style={s.cardLabel}>Savings Rate</p>
        <p style={{ ...s.bigNumber, color: report.savingsRate >= 20 ? '#10B981' : report.savingsRate >= 0 ? '#F59E0B' : '#EF4444' }}>
          {report.savingsRate.toFixed(1)}%
        </p>
      </div>

      {/* Category Breakdown */}
      {report.categoryBreakdown && Object.keys(report.categoryBreakdown).length > 0 && (
        <div style={s.section}>
          <h2 style={s.sectionTitle}>Category Breakdown</h2>
          {Object.entries(report.categoryBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
            <div key={cat} style={s.catRow}>
              <span style={{ fontWeight: 500, color: '#111827', textTransform: 'capitalize' as const }}>{cat}</span>
              <span style={{ fontWeight: 600, color: '#111827' }}>{fmt(amount, currency)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Credit Health Gauge */}
      <div style={s.card}>
        <p style={s.cardLabel}>Credit Health Index</p>
        <p style={{ ...s.bigNumber, color: chiColor(report.creditHealthIndex) }}>{report.creditHealthIndex}</p>
        <p style={{ margin: '4px 0 8px', fontSize: 14, color: chiColor(report.creditHealthIndex), fontWeight: 600 }}>
          {chiLabel(report.creditHealthIndex)}
        </p>
        <div style={s.gaugeTrack}>
          <div style={{ ...s.gaugeFill, width: `${chiPct}%`, backgroundColor: chiColor(report.creditHealthIndex) }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
          <span>0</span><span>425</span><span>850</span>
        </div>
      </div>

      {/* Budget Adherence */}
      <div style={s.card}>
        <p style={s.cardLabel}>Budget Adherence</p>
        <p style={s.bigNumber}>{report.budgetAdherence}%</p>
      </div>

      {/* XP & Level */}
      <div style={s.card}>
        <p style={s.cardLabel}>XP Earned This Month</p>
        <p style={{ ...s.bigNumber, color: '#2563EB' }}>+{report.xpEarned} XP</p>
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
            <span>Level {report.level}</span>
            <span>{report.xp} / {report.xpToNextLevel} XP</span>
          </div>
          <div style={s.xpTrack}><div style={{ ...s.xpFill, width: `${xpPct}%` }} /></div>
        </div>
      </div>

      <button onClick={() => router.push(`/game/${gameId}`)} style={s.continueBtn}>
        🎮 Continue Playing
      </button>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { maxWidth: 600, margin: '40px auto', padding: 24 },
  backBtn: { padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', color: '#6B7280', fontSize: 14, display: 'inline-block', textDecoration: 'none' },
  title: { fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 4px', textAlign: 'center' as const },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center' as const, marginBottom: 28 },
  summaryGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 },
  summaryCard: { padding: 16, borderRadius: 12, background: '#FAFAFA' },
  summaryLabel: { margin: 0, fontSize: 13, color: '#6B7280' },
  summaryValue: { margin: '4px 0 0', fontSize: 24, fontWeight: 700 },
  card: { padding: 20, border: '1px solid #E5E7EB', borderRadius: 14, marginBottom: 16, textAlign: 'center' as const },
  cardLabel: { margin: '0 0 4px', fontSize: 14, color: '#6B7280' },
  bigNumber: { margin: 0, fontSize: 36, fontWeight: 700, color: '#111827' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 10 },
  catRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F4F6' },
  gaugeTrack: { height: 10, borderRadius: 5, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  gaugeFill: { height: '100%', borderRadius: 5, transition: 'width 0.5s' },
  xpTrack: { height: 8, borderRadius: 4, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 4, backgroundColor: '#2563EB', transition: 'width 0.3s' },
  continueBtn: { width: '100%', padding: '16px 28px', borderRadius: 14, backgroundColor: '#2563EB', color: '#FFF', fontSize: 18, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8 },
};

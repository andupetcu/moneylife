'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../src/lib/auth-context';
import { api, type GameResponse, type Transaction } from '../../../../../src/lib/api';
import { colors, radius, shadows } from '../../../../../src/lib/design-tokens';
import { useT } from '../../../../../src/lib/useT';
import { useIsMobile } from '../../../../../src/hooks/useIsMobile';

const CATEGORIES = ['Housing', 'Food', 'Transport', 'Entertainment', 'Savings', 'Other'];
const CAT_COLORS: Record<string, string> = {
  housing: '#7C3AED', food: '#EA580C', transport: '#6B7280',
  entertainment: '#DB2777', savings: '#059669', other: '#9CA3AF',
};

function fmt(amount: number, currency: string): string {
  return (amount / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });
}

export default function BudgetPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useT();
  const isMobile = useIsMobile();
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
      .filter(tx => (tx.category || '').toLowerCase() === key && tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    return acc;
  }, {} as Record<string, number>);

  const handleChange = (cat: string, val: string): void => {
    const num = parseInt(val) || 0;
    setAllocations(prev => ({ ...prev, [cat]: Math.max(0, Math.min(100, num)) }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (totalPct !== 100) { setError(t('budget.allocationsTotal')); return; }
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
      setError(res.error || t('budget.failedToSet'));
    }
  };

  if (loading || authLoading) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>{t('common.loading')}</p></div>;

  const currency = game?.currency || 'USD';
  const income = game?.monthlyIncome ?? 0;
  const budgetScore = game?.budgetScore ?? 0;
  const scorePct = Math.min(100, Math.max(0, budgetScore));

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.headerBar}>
        <button onClick={() => router.push(`/game/${gameId}`)} style={s.headerBack}>←</button>
        <span style={s.headerTitle}>{t('budget.title')}</span>
        <div style={{ width: 44 }} />
      </div>

      <div style={{ ...s.content, padding: isMobile ? 16 : 20 }}>
        {/* Budget Score Circle */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={s.scoreCircle}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke={colors.borderLight} strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={colors.primary} strokeWidth="8"
                strokeDasharray={`${scorePct * 3.27} 327`} strokeLinecap="round"
                transform="rotate(-90 60 60)" />
            </svg>
            <div style={s.scoreText}>
              <span style={{ fontSize: 28, fontWeight: 700, color: colors.textPrimary }}>{budgetScore}%</span>
            </div>
          </div>
          <p style={{ color: colors.textSecondary, fontSize: 14, margin: '8px 0 0' }}>{t('budget.budgetScore')}</p>
          {income > 0 && <p style={{ color: colors.textMuted, fontSize: 13, margin: '4px 0 0' }}>{t('budget.monthlyIncome')}: {fmt(income, currency)}</p>}
        </div>

        {/* Total allocation bar */}
        <div style={s.totalBar}>
          <span style={{ fontWeight: 600, color: colors.textPrimary }}>{t('budget.total')}: {totalPct}%</span>
          <span style={{ color: totalPct === 100 ? colors.success : colors.danger, fontWeight: 600, fontSize: 13 }}>
            {totalPct === 100 ? `✓ ${t('budget.balanced')}` : t('budget.percentRemaining', { percent: 100 - totalPct })}
          </span>
        </div>

        {/* Category Breakdown */}
        {CATEGORIES.map(cat => {
          const key = cat.toLowerCase();
          const pct = allocations[key] || 0;
          const budgeted = income > 0 ? Math.round(income * pct / 100) : 0;
          const spent = spendingByCategory[key] || 0;
          const catColor = CAT_COLORS[key] || colors.textMuted;
          const overBudget = budgeted > 0 && spent > budgeted;
          return (
            <div key={cat} style={s.catCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: catColor }} />
                  <span style={{ fontWeight: 600, color: colors.textPrimary, fontSize: isMobile ? 14 : 16 }}>{cat}</span>
                </div>
                <span style={{ fontSize: 13, color: colors.textSecondary }}>
                  {income > 0 ? `${fmt(spent, currency)} / ${fmt(budgeted, currency)}` : `${pct}%`}
                </span>
              </div>
              {income > 0 && spent > 0 && (
                <div style={s.progressTrack}>
                  <div style={{ height: '100%', borderRadius: 3, width: `${Math.min(100, budgeted > 0 ? (spent / budgeted) * 100 : 0)}%`, backgroundColor: overBudget ? colors.danger : catColor, transition: 'width 0.3s' }} />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <input
                  type="range" min="0" max="100" value={pct}
                  onChange={e => handleChange(key, e.target.value)}
                  style={{ flex: 1, accentColor: colors.primary, height: 44 }}
                />
                <input
                  type="number" min="0" max="100" value={pct}
                  onChange={e => handleChange(key, e.target.value)}
                  style={s.pctInput}
                />
                <span style={{ fontSize: 13, color: colors.textMuted }}>%</span>
              </div>
            </div>
          );
        })}

        {error && <p style={{ color: colors.danger, margin: '12px 0', fontSize: 14 }}>{error}</p>}
        {success && <p style={{ color: colors.success, margin: '12px 0', fontSize: 14 }}>✓ {t('budget.budgetSaved')}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting || totalPct !== 100}
          style={{ ...s.primaryBtn, opacity: submitting || totalPct !== 100 ? 0.5 : 1 }}
        >
          {submitting ? t('budget.saving') : `💾 ${t('budget.saveBudget')}`}
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
  scoreCircle: { position: 'relative' as const, display: 'inline-block', width: 120, height: 120 },
  scoreText: { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  totalBar: { display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: radius.md, background: colors.surface, boxShadow: shadows.card, marginBottom: 16 },
  catCard: { padding: 16, borderRadius: radius.md, background: colors.surface, boxShadow: shadows.card, marginBottom: 12 },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.borderLight, overflow: 'hidden' },
  pctInput: { width: 52, padding: '6px 8px', borderRadius: radius.sm, border: `1px solid ${colors.border}`, textAlign: 'center' as const, fontSize: 14, backgroundColor: colors.inputBg, height: 44 },
  primaryBtn: { width: '100%', height: 52, borderRadius: radius.md, background: colors.primaryGradient, color: '#FFF', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8 },
};

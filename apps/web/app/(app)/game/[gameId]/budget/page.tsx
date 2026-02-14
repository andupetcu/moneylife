'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../src/lib/auth-context';
import { api, type GameResponse, type Transaction } from '../../../../../src/lib/api';
import { colors, radius, shadows } from '../../../../../src/lib/design-tokens';
import { useT } from '../../../../../src/lib/useT';
import { useIsMobile } from '../../../../../src/hooks/useIsMobile';
import { useToast } from '../../../../../src/components/Toast';

const CATEGORIES = ['Housing', 'Food', 'Transport', 'Entertainment', 'Savings', 'Other'];
const CAT_COLORS: Record<string, string> = {
  housing: '#7C3AED', food: '#EA580C', transport: '#6B7280',
  entertainment: '#DB2777', savings: '#059669', other: '#9CA3AF',
};

function fmt(amount: number, currency: string): string {
  return (amount / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });
}

function getProgressColor(ratio: number): string {
  if (ratio >= 1) return '#FB7185';
  if (ratio >= 0.85) return '#FBBF24';
  return '#34D399';
}

const shimmerStyle: React.CSSProperties = {
  background: `linear-gradient(90deg, #1E1838 25%, #2D2545 50%, #1E1838 75%)`,
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: radius.md,
};

export default function BudgetPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useT();
  const isMobile = useIsMobile();
  const { showToast } = useToast();
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

  const totalSpent = Object.values(spendingByCategory).reduce((a, b) => a + b, 0);

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
      showToast(t('budget.budgetSaved') || 'Budget saved!', 'success');
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(res.error || t('budget.failedToSet'));
    }
  };

  if (loading || authLoading) return (
    <div style={s.page}>
      <div style={s.headerBar}>
        <div style={{ width: 44, height: 44, borderRadius: radius.sm, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ width: 80, height: 20, borderRadius: 4, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ width: 44 }} />
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ ...shimmerStyle, width: 120, height: 120, borderRadius: '50%', margin: '0 auto 28px' }} />
        <div style={{ ...shimmerStyle, height: 44, marginBottom: 16 }} />
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ ...shimmerStyle, height: 100, marginBottom: 12 }} />
        ))}
      </div>
    </div>
  );

  const currency = game?.currency || 'USD';
  const income = game?.monthlyIncome ?? 0;
  const budgetScore = game?.budgetScore ?? 0;
  const scorePct = Math.min(100, Math.max(0, budgetScore));
  const scoreColor = budgetScore >= 70 ? '#34D399' : budgetScore >= 40 ? '#FBBF24' : '#FB7185';

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.headerBar}>
        <button onClick={() => router.push(`/game/${gameId}`)} style={s.headerBack}>←</button>
        <span style={s.headerTitle}>{t('budget.title')}</span>
        <div style={{ width: 44 }} />
      </div>

      <div style={{ ...s.content, padding: isMobile ? 16 : 24 }}>
        {/* Budget Score Circle with glow */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            position: 'relative' as const,
            display: 'inline-block',
            width: 120,
            height: 120,
            filter: `drop-shadow(0 0 12px ${scoreColor}40)`,
          }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#2D2545" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={scoreColor} strokeWidth="8"
                strokeDasharray={`${scorePct * 3.27} 327`} strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ filter: `drop-shadow(0 0 6px ${scoreColor}60)` }}
              />
            </svg>
            <div style={{
              position: 'absolute' as const,
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: scoreColor }}>{budgetScore}%</span>
            </div>
          </div>
          <p style={{ color: '#A5A0C8', fontSize: 14, margin: '8px 0 0' }}>{t('budget.budgetScore')}</p>
        </div>

        {/* Income vs Spending Summary */}
        {income > 0 && (
          <div style={{
            padding: 14,
            borderRadius: radius.md,
            background: '#211B3A',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap' as const,
            gap: 8,
            border: '1px solid #2D2545',
          }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#6B6490' }}>Monthly Income</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#34D399' }}>{fmt(income, currency)}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#6B6490' }}>Total Spent</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: totalSpent > income ? '#FB7185' : '#F1F0FF' }}>{fmt(totalSpent, currency)}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#6B6490' }}>Remaining</p>
              <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: income - totalSpent >= 0 ? '#34D399' : '#FB7185' }}>
                {fmt(income - totalSpent, currency)}
              </p>
            </div>
          </div>
        )}

        {/* Total allocation bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderRadius: radius.md,
          background: '#211B3A',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
          marginBottom: 16,
          border: '1px solid #2D2545',
        }}>
          <span style={{ fontWeight: 600, color: '#F1F0FF' }}>{t('budget.total')}: {totalPct}%</span>
          <span style={{ color: totalPct === 100 ? '#34D399' : '#FB7185', fontWeight: 600, fontSize: 13 }}>
            {totalPct === 100 ? `✓ ${t('budget.balanced')}` : t('budget.percentRemaining', { percent: 100 - totalPct })}
          </span>
        </div>

        {/* Category Breakdown */}
        {CATEGORIES.map(cat => {
          const key = cat.toLowerCase();
          const pct = allocations[key] || 0;
          const budgeted = income > 0 ? Math.round(income * pct / 100) : 0;
          const spent = spendingByCategory[key] || 0;
          const catColor = CAT_COLORS[key] || '#6B6490';
          const ratio = budgeted > 0 ? spent / budgeted : 0;
          const progressColor = getProgressColor(ratio);
          const isOverBudget = ratio >= 1;

          return (
            <div key={cat} style={{
              padding: 16,
              borderRadius: radius.md,
              background: '#211B3A',
              boxShadow: isOverBudget
                ? '0 0 12px rgba(251, 113, 133, 0.2), 0 2px 12px rgba(0, 0, 0, 0.3)'
                : '0 2px 12px rgba(0, 0, 0, 0.3)',
              marginBottom: 12,
              border: isOverBudget ? '1px solid rgba(251, 113, 133, 0.3)' : '1px solid #2D2545',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: catColor,
                    boxShadow: `0 0 6px ${catColor}60`,
                  }} />
                  <span style={{ fontWeight: 600, color: '#F1F0FF', fontSize: isMobile ? 14 : 16 }}>{cat}</span>
                </div>
                <span style={{ fontSize: 13, color: isOverBudget ? '#FB7185' : '#A5A0C8' }}>
                  {income > 0 ? `${fmt(spent, currency)} / ${fmt(budgeted, currency)}` : `${pct}%`}
                </span>
              </div>
              {/* Progress bar */}
              <div style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#2D2545',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  borderRadius: 4,
                  width: `${Math.min(100, ratio * 100)}%`,
                  backgroundColor: progressColor,
                  transition: 'width 0.4s ease, background-color 0.3s ease',
                  boxShadow: `0 0 6px ${progressColor}40`,
                }} />
              </div>
              {isOverBudget && (
                <p style={{ margin: '4px 0 0', fontSize: 11, color: '#FB7185', fontWeight: 500 }}>
                  Over budget by {fmt(spent - budgeted, currency)}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <input
                  type="range" min="0" max="100" value={pct}
                  onChange={e => handleChange(key, e.target.value)}
                  style={{
                    flex: 1,
                    accentColor: '#6366F1',
                    height: 44,
                  }}
                />
                <input
                  type="number" min="0" max="100" value={pct}
                  onChange={e => handleChange(key, e.target.value)}
                  style={{
                    width: 52,
                    padding: '6px 8px',
                    borderRadius: radius.sm,
                    border: '1px solid #2D2545',
                    textAlign: 'center' as const,
                    fontSize: 14,
                    backgroundColor: '#1A1333',
                    color: '#F1F0FF',
                    height: 44,
                  }}
                />
                <span style={{ fontSize: 13, color: '#6B6490' }}>%</span>
              </div>
            </div>
          );
        })}

        {error && <p style={{ color: '#FB7185', margin: '12px 0', fontSize: 14 }}>{error}</p>}
        {success && <p style={{ color: '#34D399', margin: '12px 0', fontSize: 14 }}>✓ {t('budget.budgetSaved')}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting || totalPct !== 100}
          style={{
            width: '100%',
            height: 52,
            borderRadius: radius.md,
            background: submitting || totalPct !== 100
              ? '#2D2545'
              : 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #818CF8 100%)',
            color: submitting || totalPct !== 100 ? '#6B6490' : '#FFF',
            fontSize: 16,
            fontWeight: 700,
            border: 'none',
            cursor: submitting || totalPct !== 100 ? 'not-allowed' : 'pointer',
            marginTop: 8,
            transition: 'all 0.3s ease',
            boxShadow: submitting || totalPct !== 100
              ? 'none'
              : '0 0 20px rgba(99, 102, 241, 0.4), 0 8px 32px rgba(0, 0, 0, 0.3)',
            opacity: submitting || totalPct !== 100 ? 0.5 : 1,
          }}
        >
          {submitting ? t('budget.saving') : `💾 ${t('budget.saveBudget')}`}
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#0F0B1E' },
  headerBar: {
    background: '#211B3A',
    padding: '16px 20px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #2D2545',
  },
  headerBack: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    border: '1px solid #2D2545',
    background: '#2D2545',
    color: '#F1F0FF',
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: 700, color: '#F1F0FF' },
  content: { padding: 20 },
};

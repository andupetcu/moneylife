'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../src/lib/auth-context';
import { useT } from '../../../../../src/lib/useT';
import { api, type GameResponse } from '../../../../../src/lib/api';
import { colors, radius, shadows } from '../../../../../src/lib/design-tokens';
import { useIsMobile } from '../../../../../src/hooks/useIsMobile';

function fmt(amount: number, currency: string): string {
  return (amount / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });
}

export default function TransferPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useT();
  const isMobile = useIsMobile();
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
    if (fromId === toId) { setError(t('transfer.sameAccountError')); return; }
    const cents = Math.round(parseFloat(amount) * 100);
    if (isNaN(cents) || cents <= 0) { setError(t('transfer.invalidAmount')); return; }
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
      setError(res.error || t('transfer.failed'));
    }
  };

  if (loading || authLoading) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>{t('common.loading')}</p></div>;

  const accounts = game?.accounts || [];
  const currency = game?.currency || 'USD';

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.headerBar}>
        <button onClick={() => router.push(`/game/${gameId}`)} style={s.headerBack}>←</button>
        <span style={s.headerTitle}>{t('transfer.title')}</span>
        <div style={{ width: 44 }} />
      </div>

      <div style={{ ...s.content, padding: isMobile ? 16 : 20 }}>
        {/* Amount Display */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ margin: '0 0 8px', fontSize: 14, color: colors.textMuted }}>{t('transfer.amount')} ({currency})</p>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            style={{ ...s.amountInput, width: isMobile ? '100%' : 200, fontSize: isMobile ? 28 : 36 }}
          />
        </div>

        <div style={s.formCard}>
          <div style={s.field}>
            <label style={s.label}>{t('transfer.fromAccount')}</label>
            <select value={fromId} onChange={e => setFromId(e.target.value)} style={s.select}>
              <option value="">{t('transfer.selectAccount')}</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance, currency)})</option>
              ))}
            </select>
          </div>

          <div style={{ textAlign: 'center', margin: '4px 0', color: colors.textMuted, fontSize: 20 }}>↓</div>

          <div style={s.field}>
            <label style={s.label}>{t('transfer.toAccount')}</label>
            <select value={toId} onChange={e => setToId(e.target.value)} style={s.select}>
              <option value="">{t('transfer.selectAccount')}</option>
              {accounts.filter(a => a.id !== fromId).map(a => (
                <option key={a.id} value={a.id}>{a.name} ({fmt(a.balance, currency)})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Empty state for no accounts */}
        {accounts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, background: colors.surface, borderRadius: radius.lg, boxShadow: shadows.card, marginBottom: 24 }}>
            <span style={{ fontSize: 48 }}>🏦</span>
            <p style={{ color: colors.textMuted, margin: '12px 0 0' }}>No accounts available for transfer</p>
          </div>
        )}

        {error && <p style={{ color: colors.danger, margin: '12px 0', fontSize: 14 }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting || !fromId || !toId || !amount}
          style={{ ...s.primaryBtn, opacity: submitting || !fromId || !toId || !amount ? 0.5 : 1 }}
        >
          {submitting ? t('transfer.transferring') : `✅ ${t('transfer.confirmTransfer')}`}
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
  amountInput: { width: 200, fontSize: 36, fontWeight: 700, textAlign: 'center' as const, color: colors.textPrimary, border: 'none', borderBottom: `2px solid ${colors.primary}`, background: 'transparent', outline: 'none', padding: '8px 0' },
  formCard: { padding: 20, borderRadius: radius.lg, background: colors.surface, boxShadow: shadows.card, marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: colors.textSecondary, marginBottom: 6 },
  select: { width: '100%', padding: '14px 16px', borderRadius: radius.md, border: `1px solid ${colors.border}`, fontSize: 15, color: colors.textPrimary, backgroundColor: colors.inputBg, height: 52 },
  primaryBtn: { width: '100%', height: 52, borderRadius: radius.md, background: colors.primaryGradient, color: '#FFF', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer' },
};

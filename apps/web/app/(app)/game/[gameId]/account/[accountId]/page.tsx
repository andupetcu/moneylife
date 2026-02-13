'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../../../src/lib/auth-context';
import { api, type GameResponse, type Account, type Transaction } from '../../../../../../src/lib/api';
import { colors, radius, shadows } from '../../../../../../src/lib/design-tokens';
import { useIsMobile } from '../../../../../../src/hooks/useIsMobile';

function fmt(amount: number, currency: string): string {
  return (amount / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });
}

const ACCOUNT_ICONS: Record<string, string> = {
  checking: '🏦', savings: '💰', credit_card: '💳', loan: '📋', investment: '📈',
};

export default function AccountDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const gameId = params.gameId as string;
  const accountId = params.accountId as string;

  const [game, setGame] = useState<GameResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [gameRes, txRes] = await Promise.all([
      api.game.get(gameId),
      api.game.getTransactions(gameId),
    ]);
    if (gameRes.ok && gameRes.data) setGame(gameRes.data);
    if (txRes.ok && txRes.data) {
      const all = Array.isArray(txRes.data) ? txRes.data : (txRes.data as any).transactions || [];
      setTransactions(all.filter((tx: Transaction) => tx.accountId === accountId));
    }
    setLoading(false);
  }, [gameId, accountId]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading, router, fetchData]);

  if (loading || authLoading) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>{t('common.loading')}</p></div>;

  const account = game?.accounts?.find(a => a.id === accountId);
  if (!account) return (
    <div style={s.page}>
      <div style={s.headerBar}>
        <button onClick={() => router.push(`/game/${gameId}`)} style={s.headerBack}>←</button>
        <span style={s.headerTitle}>{t('accounts.account')}</span>
        <div style={{ width: 44 }} />
      </div>
      <div style={s.content}><p style={{ color: colors.danger }}>{t('accounts.accountNotFound')}</p></div>
    </div>
  );

  const currency = game?.currency || 'USD';

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.headerBar}>
        <button onClick={() => router.push(`/game/${gameId}`)} style={s.headerBack}>←</button>
        <span style={{ ...s.headerTitle, fontSize: isMobile ? 16 : 18 }}>{account.name}</span>
        <div style={{ width: 44 }} />
      </div>

      <div style={{ ...s.content, padding: isMobile ? 16 : 20 }}>
        {/* Balance Card */}
        <div style={s.balanceCard}>
          <span style={{ fontSize: isMobile ? 32 : 40 }}>{ACCOUNT_ICONS[account.type] || '🏦'}</span>
          <p style={{ margin: '12px 0 4px', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{t('accounts.currentBalance')}</p>
          <p style={{ margin: 0, fontSize: isMobile ? 26 : 32, fontWeight: 700, color: '#FFF' }}>
            {fmt(account.balance, currency)}
          </p>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            {account.type}{account.interestRate ? ` · ${account.interestRate}% APR` : ''}
          </p>
        </div>

        {/* Transfer Button */}
        <button onClick={() => router.push(`/game/${gameId}/transfer`)} style={s.primaryBtn}>
          💸 {t('accounts.transferMoney')}
        </button>

        {/* Transactions */}
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: colors.textPrimary, marginBottom: 12 }}>{t('accounts.transactionHistory')}</h2>
          {transactions.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, background: colors.surface, borderRadius: radius.lg, boxShadow: shadows.card }}>
              <span style={{ fontSize: 48 }}>📊</span>
              <p style={{ color: colors.textMuted, fontSize: 14, margin: '12px 0 0' }}>{t('accounts.noTransactions')}</p>
            </div>
          )}
          {transactions.map(tx => (
            <div key={tx.id} style={s.txRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                <div style={s.txIcon}>
                  <span style={{ fontSize: 14 }}>{tx.amount >= 0 ? '↓' : '↑'}</span>
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
          ))}
        </div>
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
  balanceCard: { margin: '-8px 0 20px', padding: 24, borderRadius: radius.lg, background: colors.cardGradient, boxShadow: shadows.bankCard, textAlign: 'center' as const },
  primaryBtn: { width: '100%', height: 52, borderRadius: radius.md, background: colors.primaryGradient, color: '#FFF', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer' },
  txRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${colors.borderLight}` },
  txIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary, flexShrink: 0 },
};

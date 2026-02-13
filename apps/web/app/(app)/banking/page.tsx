'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/lib/auth-context';
import {
  api,
  type LinkedAccount,
  type BankTransaction,
  type GameResponse,
} from '../../../src/lib/api';
import { colors, radius, shadows } from '../../../src/lib/design-tokens';
import { useIsMobile } from '../../../src/hooks/useIsMobile';

export default function BankingPage(): React.ReactElement {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();

  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [games, setGames] = useState<GameResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [unlinkConfirm, setUnlinkConfirm] = useState<string | null>(null);
  const [providerUnavailable, setProviderUnavailable] = useState(false);

  const userRegion = games[0]?.region || 'ro';

  const fetchData = useCallback(async () => {
    const [acctRes, txRes, gamesRes] = await Promise.all([
      api.banking.listAccounts(),
      api.banking.getTransactions(),
      api.game.list(),
    ]);
    if (acctRes.ok && acctRes.data) setAccounts(acctRes.data);
    if (txRes.ok && txRes.data) setTransactions((txRes.data as { transactions: BankTransaction[] }).transactions || []);
    if (gamesRes.ok && gamesRes.data) setGames(Array.isArray(gamesRes.data) ? gamesRes.data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading, router, fetchData]);

  // Handle OAuth callback (code in URL)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      (async () => {
        const res = await api.banking.callback(code, userRegion);
        if (res.ok) {
          setSuccess('Bank account linked successfully!');
          fetchData();
        } else {
          setError(res.error || 'Failed to link account');
        }
        // Clean URL
        window.history.replaceState({}, '', '/banking');
      })();
    }
  }, [userRegion, fetchData]);

  const handleLink = async (): Promise<void> => {
    setLinking(true);
    setError(null);
    const res = await api.banking.link(userRegion, `${window.location.origin}/banking`);
    setLinking(false);

    if (!res.ok) {
      if (res.error?.includes('not yet available') || res.error?.includes('PROVIDER_NOT_CONFIGURED')) {
        setProviderUnavailable(true);
      } else {
        setError(res.error || 'Failed to initiate linking');
      }
      return;
    }

    const data = res.data!;
    if (data.linkType === 'auth_url') {
      window.location.href = data.linkValue;
    } else {
      setSuccess(`Plaid Link token received. In production, Plaid Link UI would open. Token: ${data.linkValue.slice(0, 20)}...`);
    }
  };

  const handleSync = async (): Promise<void> => {
    setSyncing(true);
    setError(null);
    const res = await api.banking.sync();
    setSyncing(false);
    if (res.ok && res.data) {
      const d = res.data;
      setSuccess(`Synced ${d.synced} transactions from ${d.accounts} account(s)`);
      fetchData();
    } else {
      setError(res.error || 'Sync failed');
    }
  };

  const handleUnlink = async (id: string): Promise<void> => {
    const res = await api.banking.unlinkAccount(id);
    setUnlinkConfirm(null);
    if (res.ok) {
      setSuccess('Account unlinked. All synced data has been deleted.');
      setAccounts(prev => prev.filter(a => a.id !== id));
    } else {
      setError(res.error || 'Failed to unlink');
    }
  };

  if (loading || authLoading) {
    return (
      <div style={s.page}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 }}>
          <div style={{ width: 24, height: 24, border: `3px solid ${colors.borderLight}`, borderTopColor: colors.primary, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: colors.textMuted }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ ...s.header, padding: isMobile ? '16px 16px 24px' : '20px 24px 28px' }}>
        <button onClick={() => router.push('/dashboard')} style={s.backBtn}>←</button>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <span style={{ fontSize: isMobile ? 32 : 40 }}>🏦</span>
          <h1 style={{ ...s.headerTitle, fontSize: isMobile ? 18 : 22 }}>Banking</h1>
          <p style={s.headerSub}>Connect your real bank to compare with in-game spending</p>
        </div>
        <div style={{ width: 44 }} />
      </div>

      <div style={{ ...s.content, padding: isMobile ? '20px 16px 120px' : '20px 20px 120px' }}>
        {/* Messages */}
        {error && (
          <div style={s.errorBanner}>
            <span style={{ flex: 1 }}>{error}</span>
            <button onClick={() => setError(null)} style={s.dismissBtn}>×</button>
          </div>
        )}
        {success && (
          <div style={s.successBanner}>
            <span style={{ flex: 1 }}>{success}</span>
            <button onClick={() => setSuccess(null)} style={s.dismissBtn}>×</button>
          </div>
        )}

        {/* Connect CTA */}
        {accounts.length === 0 && !providerUnavailable && (
          <div style={s.ctaCard}>
            <span style={{ fontSize: 48 }}>🔗</span>
            <h2 style={s.ctaTitle}>Connect Your Bank</h2>
            <p style={s.ctaDesc}>
              Link your real bank account to unlock Mirror Mode — see how your real spending
              compares to your in-game decisions.
            </p>
            <ul style={s.ctaList}>
              <li>Compare real vs game spending by category</li>
              <li>Get personalized insights</li>
              <li>Track your financial awareness over time</li>
            </ul>
            <p style={s.ctaPrivacy}>
              Your data is encrypted and never shared. You can unlink at any time.
            </p>
            <button onClick={handleLink} disabled={linking} style={{ ...s.primaryBtn, opacity: linking ? 0.7 : 1 }}>
              {linking ? '⏳ Connecting...' : '🔗 Connect Bank Account'}
            </button>
          </div>
        )}

        {/* Coming Soon fallback */}
        {providerUnavailable && accounts.length === 0 && (
          <div style={s.comingSoonCard}>
            <span style={{ fontSize: 48 }}>🚧</span>
            <h2 style={s.ctaTitle}>Coming Soon</h2>
            <p style={s.ctaDesc}>
              Banking integration is not yet available for your region. We&apos;re working on it!
            </p>
          </div>
        )}

        {/* Linked Accounts */}
        {accounts.length > 0 && (
          <div style={s.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={s.sectionTitle}>Linked Accounts</h2>
              <button onClick={handleLink} disabled={linking} style={s.addBtn}>
                {linking ? '...' : '+ Add'}
              </button>
            </div>

            {accounts.map(acct => (
              <div key={acct.id} style={{ ...s.accountCard, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? 12 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                  <div style={s.bankIcon}>
                    <span style={{ fontSize: 22 }}>{acct.provider === 'plaid' ? '🇺🇸' : '🇪🇺'}</span>
                  </div>
                  <div>
                    <p style={s.bankName}>{acct.institutionName || acct.provider}</p>
                    <p style={s.bankMeta}>
                      {acct.status === 'active' ? '● Connected' : '○ ' + acct.status}
                      {acct.lastSyncAt && ` · Last sync: ${new Date(acct.lastSyncAt).toLocaleDateString()}`}
                    </p>
                    {acct.consentExpiresAt && (
                      <p style={s.consentMeta}>
                        Consent expires: {new Date(acct.consentExpiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, width: isMobile ? '100%' : 'auto' }}>
                  {unlinkConfirm === acct.id ? (
                    <>
                      <button onClick={() => handleUnlink(acct.id)} style={{ ...s.confirmUnlinkBtn, minHeight: 44, flex: isMobile ? 1 : undefined }}>Confirm</button>
                      <button onClick={() => setUnlinkConfirm(null)} style={{ ...s.cancelBtn, minHeight: 44, flex: isMobile ? 1 : undefined }}>Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => setUnlinkConfirm(acct.id)} style={{ ...s.unlinkBtn, minHeight: 44, width: isMobile ? '100%' : 'auto' }}>Unlink</button>
                  )}
                </div>
              </div>
            ))}

            {/* Sync button */}
            <button onClick={handleSync} disabled={syncing} style={{ ...s.syncBtn, opacity: syncing ? 0.7 : 1 }}>
              {syncing ? '⏳ Syncing...' : '🔄 Sync Transactions'}
            </button>
          </div>
        )}

        {/* Mirror Mode Quick Links */}
        {accounts.length > 0 && games.length > 0 && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Mirror Mode</h2>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: colors.textSecondary }}>
              Compare your real spending with your in-game decisions
            </p>
            {games.map(game => (
              <div
                key={game.id}
                style={{ ...s.mirrorCard, padding: isMobile ? 14 : 16 }}
                onClick={() => router.push(`/game/${game.id}/mirror`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 28 }}>🪞</span>
                  <div>
                    <p style={s.bankName}>Mirror: {game.persona} (Level {game.level})</p>
                    <p style={s.bankMeta}>Compare game vs real spending</p>
                  </div>
                </div>
                <span style={s.arrowBtn}>→</span>
              </div>
            ))}
          </div>
        )}

        {/* Recent Synced Transactions */}
        {transactions.length > 0 && (
          <div style={s.section}>
            <h2 style={s.sectionTitle}>Recent Bank Transactions</h2>
            {transactions.slice(0, 20).map(tx => (
              <div key={tx.id} style={s.txRow}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ ...s.txDesc, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.description}</p>
                  <p style={s.txMeta}>
                    {tx.date} · {tx.category}
                    {tx.merchantName && ` · ${tx.merchantName}`}
                    {tx.isPending && ' · Pending'}
                  </p>
                </div>
                <p style={{ ...s.txAmount, color: tx.amount >= 0 ? colors.success : colors.danger, whiteSpace: 'nowrap', marginLeft: 8 }}>
                  {tx.amount >= 0 ? '+' : ''}{(tx.amount / 100).toLocaleString('en-US', { style: 'currency', currency: tx.currency || 'USD' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <div style={{ ...s.bottomNav, paddingBottom: 'env(safe-area-inset-bottom, 14px)' }}>
        <button onClick={() => router.push('/dashboard')} style={s.navTab}>
          <span style={{ fontSize: 22 }}>🏠</span>
          <span style={{ fontSize: 11 }}>Home</span>
        </button>
        <button onClick={() => router.push('/social')} style={s.navTab}>
          <span style={{ fontSize: 22 }}>👥</span>
          <span style={{ fontSize: 11 }}>Social</span>
        </button>
        <button onClick={() => router.push('/leaderboard')} style={s.navTab}>
          <span style={{ fontSize: 22 }}>🏆</span>
          <span style={{ fontSize: 11 }}>Leaderboard</span>
        </button>
        <button onClick={() => {}} style={{ ...s.navTab, color: colors.primary }}>
          <span style={{ fontSize: 22 }}>🏦</span>
          <span style={{ fontSize: 11, fontWeight: 600 }}>Banking</span>
        </button>
      </div>
    </div>
  );
}

const purpleGradient = 'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #C084FC 100%)';

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: colors.background },
  header: {
    background: purpleGradient,
    padding: '20px 24px 28px',
    borderRadius: `0 0 ${radius.xl}px ${radius.xl}px`,
    display: 'flex',
    alignItems: 'flex-start',
  },
  backBtn: {
    width: 44, height: 44, borderRadius: radius.sm, border: 'none',
    background: 'rgba(255,255,255,0.2)', color: '#FFF', fontSize: 16, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { margin: '8px 0 4px', fontSize: 22, fontWeight: 700, color: '#FFF' },
  headerSub: { margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  content: { padding: '20px 20px 120px' },

  errorBanner: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', borderRadius: radius.md, backgroundColor: '#FEF2F2',
    color: colors.danger, marginBottom: 16, fontSize: 14,
  },
  successBanner: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', borderRadius: radius.md, backgroundColor: '#ECFDF5',
    color: colors.success, marginBottom: 16, fontSize: 14,
  },
  dismissBtn: {
    background: 'none', border: 'none', fontSize: 18, cursor: 'pointer',
    color: 'inherit', padding: '0 4px', minWidth: 44, minHeight: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  ctaCard: {
    padding: 28, borderRadius: radius.lg, background: purpleGradient,
    textAlign: 'center' as const, marginBottom: 24,
  },
  ctaTitle: { margin: '12px 0 8px', fontSize: 22, fontWeight: 700, color: '#FFF' },
  ctaDesc: { margin: '0 0 16px', fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5 },
  ctaList: {
    textAlign: 'left' as const, margin: '0 auto 16px', maxWidth: 280,
    padding: '0 0 0 20px', color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 1.8,
  },
  ctaPrivacy: { margin: '0 0 20px', fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  primaryBtn: {
    width: '100%', padding: '14px 28px', borderRadius: radius.md,
    background: '#FFF', color: '#7C3AED', fontSize: 16, fontWeight: 700,
    border: 'none', cursor: 'pointer', height: 52,
  },

  comingSoonCard: {
    padding: 28, borderRadius: radius.lg, background: colors.surface,
    textAlign: 'center' as const, boxShadow: shadows.card, marginBottom: 24,
  },

  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 17, fontWeight: 600, color: colors.textPrimary, margin: 0 },

  addBtn: {
    padding: '6px 16px', borderRadius: radius.pill, background: purpleGradient,
    color: '#FFF', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
    minHeight: 44, display: 'flex', alignItems: 'center',
  },

  accountCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderRadius: radius.lg, marginBottom: 8,
    background: colors.surface, boxShadow: shadows.card,
  },
  bankIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3E8FF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  bankName: { margin: 0, fontWeight: 600, color: colors.textPrimary, fontSize: 15 },
  bankMeta: { margin: '2px 0 0', fontSize: 12, color: colors.textMuted },
  consentMeta: { margin: '2px 0 0', fontSize: 11, color: colors.warning },
  unlinkBtn: {
    padding: '6px 14px', borderRadius: radius.sm, border: `1px solid ${colors.danger}`,
    color: colors.danger, background: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  confirmUnlinkBtn: {
    padding: '6px 14px', borderRadius: radius.sm, border: 'none',
    color: '#FFF', background: colors.danger, fontSize: 12, fontWeight: 600, cursor: 'pointer',
  },
  cancelBtn: {
    padding: '6px 14px', borderRadius: radius.sm, border: `1px solid ${colors.border}`,
    color: colors.textMuted, background: 'none', fontSize: 12, cursor: 'pointer',
  },
  syncBtn: {
    width: '100%', padding: '12px 24px', borderRadius: radius.md,
    background: purpleGradient, color: '#FFF', fontSize: 14, fontWeight: 600,
    border: 'none', cursor: 'pointer', marginTop: 12, height: 52,
  },

  mirrorCard: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderRadius: radius.lg, marginBottom: 8,
    background: colors.surface, boxShadow: shadows.card, cursor: 'pointer',
    border: '2px solid #E9D5FF', minHeight: 44,
  },
  arrowBtn: { fontSize: 20, color: '#7C3AED', fontWeight: 700 },

  txRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: `1px solid ${colors.borderLight}`,
  },
  txDesc: { margin: 0, fontWeight: 500, color: colors.textPrimary, fontSize: 14 },
  txMeta: { margin: '2px 0 0', fontSize: 12, color: colors.textMuted },
  txAmount: { margin: 0, fontWeight: 600, fontSize: 14 },

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

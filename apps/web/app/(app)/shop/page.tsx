'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useT } from '../../../src/lib/useT';
import { useAuth } from '../../../src/lib/auth-context';
import { api, type ShopItem, type GameResponse } from '../../../src/lib/api';
import { colors, radius, shadows } from '../../../src/lib/design-tokens';
import { useIsMobile } from '../../../src/hooks/useIsMobile';

const CATEGORY_ORDER = ['boost', 'protection', 'utility', 'cosmetic'];
const CATEGORY_LABELS: Record<string, string> = {
  boost: 'shop.boosts',
  protection: 'shop.protection',
  utility: 'shop.utility',
  cosmetic: 'shop.cosmetic',
};
const CATEGORY_COLORS: Record<string, string> = {
  boost: colors.accentCyan,
  protection: colors.success,
  utility: colors.warning,
  cosmetic: colors.accentPink,
};

export default function ShopPage(): React.ReactElement {
  const t = useT();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();

  const [items, setItems] = useState<ShopItem[]>([]);
  const [coins, setCoins] = useState(0);
  const [gameId, setGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    const [shopRes, gamesRes] = await Promise.all([
      api.shop.listItems(),
      api.game.list(),
    ]);
    if (shopRes.ok && shopRes.data) setItems(shopRes.data.items);
    if (gamesRes.ok && gamesRes.data) {
      const games = (gamesRes.data as unknown as GameResponse[]);
      const active = games.find((g: GameResponse) => g.status === 'active');
      if (active) {
        setGameId(active.id);
        setCoins(active.totalCoins ?? 0);
      }
    }
    setLoading(false);
  };

  const handleBuy = async (item: ShopItem) => {
    if (!gameId) return;
    setBuying(item.itemKey);
    const res = await api.shop.buy(item.itemKey, gameId);
    if (res.ok && res.data) {
      setCoins(res.data.remainingCoins);
      setItems(prev => prev.map(i =>
        i.itemKey === item.itemKey ? { ...i, ownedCount: i.ownedCount + 1 } : i
      ));
      setMessage(t('shop.purchased'));
      setTimeout(() => setMessage(null), 3000);
    }
    setBuying(null);
    setConfirmItem(null);
  };

  const grouped = CATEGORY_ORDER.map(cat => ({
    category: cat,
    items: items.filter(i => i.category === cat),
  })).filter(g => g.items.length > 0);

  if (authLoading || loading) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>{t('common.loading')}</p></div>;
  if (!user) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>Redirecting...</p></div>;

  return (
    <div style={s.page}>
      {/* Header with coin balance */}
      <div style={s.header}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#FFF', margin: 0 }}>
              {t('shop.title')}
            </h1>
          </div>
          <div style={s.coinBadge}>
            <span style={{ fontSize: 18 }}>🪙</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: colors.accentGold }}>
              {coins.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '16px 16px 100px' : '24px 24px 100px' }}>
        {/* Success message */}
        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: radius.sm,
            background: 'rgba(52, 211, 153, 0.15)',
            color: colors.success,
            marginBottom: 16,
            fontSize: 14,
            fontWeight: 600,
            border: `1px solid ${colors.success}`,
            animation: 'fadeIn 0.3s ease',
          }}>
            {message}
          </div>
        )}

        {!gameId && (
          <div style={{ ...s.card, textAlign: 'center', padding: 40 }}>
            <span style={{ fontSize: 48 }}>🎮</span>
            <p style={{ color: colors.textSecondary, margin: '12px 0 0' }}>Start a game first to use the shop!</p>
            <button onClick={() => router.push('/dashboard')} style={{ ...s.buyBtn, marginTop: 16 }}>Go to Dashboard</button>
          </div>
        )}

        {/* Shop items by category */}
        {grouped.map(group => (
          <div key={group.category} style={{ marginBottom: 28 }}>
            <h2 style={{
              fontSize: 16,
              fontWeight: 700,
              color: CATEGORY_COLORS[group.category],
              margin: '0 0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              {t(CATEGORY_LABELS[group.category])}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: 12,
            }}>
              {group.items.map(item => {
                const canBuy = gameId && coins >= item.price && (item.maxOwned < 0 || item.ownedCount < item.maxOwned);
                const isMaxed = item.maxOwned > 0 && item.ownedCount >= item.maxOwned;

                return (
                  <div key={item.id} style={{
                    ...s.card,
                    border: `1px solid ${colors.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 32 }}>{item.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: colors.textPrimary }}>{item.name}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: colors.textMuted }}>{item.description}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <div>
                        <span style={{ fontWeight: 700, color: colors.accentGold, fontSize: 15 }}>🪙 {item.price}</span>
                        {item.maxOwned > 0 && (
                          <span style={{ fontSize: 11, color: colors.textMuted, marginLeft: 8 }}>
                            {item.ownedCount}/{item.maxOwned}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setConfirmItem(item)}
                        disabled={!canBuy || buying === item.itemKey}
                        style={{
                          ...s.buyBtn,
                          opacity: canBuy ? 1 : 0.4,
                          cursor: canBuy ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {buying === item.itemKey ? '...' : isMaxed ? t('shop.maxOwned') : t('shop.buy')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Purchase confirmation modal */}
      {confirmItem && (
        <div style={s.modalOverlay} onClick={() => setConfirmItem(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: 48 }}>{confirmItem.icon}</span>
            <h3 style={{ margin: '12px 0 8px', fontSize: 18, fontWeight: 700, color: colors.textPrimary }}>
              {confirmItem.name}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: colors.textSecondary }}>
              {t('shop.confirmPurchase', { item: confirmItem.name, price: String(confirmItem.price) })}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setConfirmItem(null)} style={s.cancelBtn}>
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleBuy(confirmItem)}
                disabled={buying !== null}
                style={s.confirmBtn}
              >
                {buying ? '...' : `🪙 ${confirmItem.price} — ${t('shop.buy')}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div style={s.bottomNav}>
        {[
          { icon: '🏠', label: 'Home', href: '/dashboard' },
          { icon: '👥', label: 'Social', href: '/social' },
          { icon: '🏆', label: 'Leaderboard', href: '/leaderboard' },
          { icon: '🛒', label: 'Shop', href: '/shop', active: true },
        ].map(navTab => (
          <Link
            key={navTab.href}
            href={navTab.href}
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              gap: 2,
              textDecoration: 'none',
              color: navTab.active ? colors.primary : colors.textMuted,
              minWidth: 44,
              minHeight: 44,
              justifyContent: 'center',
              ...(navTab.active ? { filter: 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.4))' } : {}),
            }}
          >
            <span style={{ fontSize: 22 }}>{navTab.icon}</span>
            {!isMobile && <span style={{ fontSize: 11, fontWeight: navTab.active ? 600 : 400 }}>{navTab.label}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: colors.background },
  header: {
    background: colors.primaryGradient,
    padding: '40px 24px 28px',
    borderRadius: `0 0 ${radius.xl}px ${radius.xl}px`,
  },
  coinBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(0,0,0,0.3)',
    padding: '8px 16px',
    borderRadius: radius.pill,
    border: '1px solid rgba(252, 211, 77, 0.3)',
  },
  card: {
    background: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    boxShadow: shadows.card,
  },
  buyBtn: {
    padding: '8px 18px',
    borderRadius: radius.md,
    background: colors.primaryGradient,
    color: '#FFF',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
    minHeight: 44,
  },
  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    animation: 'fadeIn 0.2s ease',
    padding: 20,
  },
  modal: {
    background: colors.surfaceElevated,
    borderRadius: radius.xl,
    padding: 32,
    textAlign: 'center' as const,
    maxWidth: 360,
    width: '100%',
    boxShadow: shadows.elevated,
    animation: 'scaleIn 0.3s ease',
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: radius.md,
    background: colors.backgroundSecondary,
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    minHeight: 44,
  },
  confirmBtn: {
    padding: '10px 20px',
    borderRadius: radius.md,
    background: colors.primaryGradient,
    color: '#FFF',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
    minHeight: 44,
  },
  bottomNav: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px 0 14px',
    paddingBottom: 'env(safe-area-inset-bottom, 14px)',
    background: colors.surface,
    borderTop: `1px solid ${colors.border}`,
    backdropFilter: 'blur(12px)',
    zIndex: 50,
  },
};

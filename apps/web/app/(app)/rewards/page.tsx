'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '../../../src/lib/useT';
import { useAuth } from '../../../src/lib/auth-context';
import { api, type Badge, type GameResponse } from '../../../src/lib/api';
import { colors, radius, shadows } from '../../../src/lib/design-tokens';
import ShareableCard from '../../../src/components/ShareableCard';

export default function RewardsPage(): React.ReactElement {
  const t = useT();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [badges, setBadges] = useState<Badge[]>([]);
  const [game, setGame] = useState<GameResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareBadge, setShareBadge] = useState<Badge | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    const gamesRes = await api.game.list();
    if (gamesRes.ok && gamesRes.data) {
      const games = gamesRes.data as unknown as GameResponse[];
      const active = games.find((g: GameResponse) => g.status === 'active');
      if (active) {
        setGame(active);
        const badgesRes = await api.game.getBadges(active.id);
        if (badgesRes.ok && badgesRes.data) setBadges(badgesRes.data);
      }
    }
    setLoading(false);
  };

  if (authLoading || loading) return <div style={{ minHeight: '100vh', backgroundColor: colors.background }}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>{t('common.loading')}</p></div>;

  const earned = badges.filter(b => b.earned);
  const locked = badges.filter(b => !b.earned);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      <div style={{
        background: colors.primaryGradient,
        padding: '16px 20px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: `0 0 ${radius.xl}px ${radius.xl}px`,
      }}>
        <button onClick={() => router.push('/dashboard')} style={{
          width: 44, height: 44, borderRadius: radius.sm,
          border: 'none', background: 'rgba(255,255,255,0.2)', color: '#FFF',
          fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>←</button>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#FFF' }}>{t('rewards.title')}</span>
        <div style={{ width: 44 }} />
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px 40px' }}>
        {/* Earned badges */}
        {earned.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, marginBottom: 12 }}>
              {t('rewards.earned')} ({earned.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {earned.map(badge => (
                <div
                  key={badge.id}
                  onClick={() => setShareBadge(badge)}
                  style={{
                    background: colors.surface,
                    borderRadius: radius.lg,
                    padding: 16,
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: shadows.card,
                    border: `1px solid ${colors.border}`,
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: 36 }}>{badge.icon || '🏅'}</span>
                  <p style={{ margin: '8px 0 4px', fontWeight: 700, fontSize: 14, color: colors.textPrimary }}>
                    {badge.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: colors.textMuted }}>{badge.description}</p>
                  <p style={{ margin: '8px 0 0', fontSize: 11, color: colors.primary, fontWeight: 600 }}>
                    📤 {t('shareCard.share')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked badges */}
        {locked.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, marginBottom: 12 }}>
              {t('rewards.locked')} ({locked.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {locked.map(badge => (
                <div key={badge.id} style={{
                  background: colors.surface,
                  borderRadius: radius.lg,
                  padding: 16,
                  textAlign: 'center',
                  opacity: 0.5,
                  boxShadow: shadows.card,
                  border: `1px solid ${colors.border}`,
                }}>
                  <span style={{ fontSize: 36, filter: 'grayscale(1)' }}>{badge.icon || '🏅'}</span>
                  <p style={{ margin: '8px 0 4px', fontWeight: 700, fontSize: 14, color: colors.textPrimary }}>
                    {badge.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: colors.textMuted }}>{badge.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {badges.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, background: colors.surface, borderRadius: radius.lg, boxShadow: shadows.card }}>
            <span style={{ fontSize: 48 }}>🏅</span>
            <p style={{ color: colors.textSecondary, margin: '16px 0 8px', fontSize: 16, fontWeight: 600 }}>{t('rewards.noBadges')}</p>
            <p style={{ color: colors.textMuted, fontSize: 14 }}>{t('rewards.badgesHint')}</p>
            <button onClick={() => router.push('/dashboard')} style={{
              marginTop: 20, padding: '12px 28px', borderRadius: radius.md,
              background: colors.primaryGradient, color: '#FFF', fontSize: 15,
              fontWeight: 600, border: 'none', cursor: 'pointer', minHeight: 44,
            }}>
              Go to Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Shareable card modal */}
      {shareBadge && game && (
        <ShareableCard
          badgeIcon={shareBadge.icon || '🏅'}
          badgeName={shareBadge.name}
          badgeDescription={shareBadge.description}
          playerName={user?.displayName || 'Player'}
          level={game.level}
          netWorth={game.netWorth}
          badgeId={shareBadge.id}
          onClose={() => setShareBadge(null)}
        />
      )}
    </div>
  );
}

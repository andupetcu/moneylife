'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../src/lib/auth-context';
import { api, type GameResponse, type Badge } from '../../../../../src/lib/api';
import { colors, radius, shadows } from '../../../../../src/lib/design-tokens';
import { useTranslation } from 'react-i18next';
import { useIsMobile } from '../../../../../src/hooks/useIsMobile';

export default function RewardsPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<GameResponse | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [gameRes, badgeRes] = await Promise.all([
      api.game.get(gameId),
      api.game.getBadges(gameId),
    ]);
    if (gameRes.ok && gameRes.data) setGame(gameRes.data);
    if (badgeRes.ok && badgeRes.data) setBadges(badgeRes.data);
    setLoading(false);
  }, [gameId]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading, router, fetchData]);

  if (loading || authLoading) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>{t('common.loading')}</p></div>;

  const xpPct = game?.xpToNextLevel ? Math.min(100, ((game?.xp ?? 0) / game.xpToNextLevel) * 100) : 0;
  const earned = badges.filter(b => b.earned);

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.headerBar}>
        <button onClick={() => router.push(`/game/${gameId}`)} style={s.headerBack}>←</button>
        <span style={s.headerTitle}>{t('rewards.rewardsAndBadges')}</span>
        <div style={{ width: 44 }} />
      </div>

      <div style={{ ...s.content, padding: isMobile ? 16 : 20 }}>
        {/* Level & XP */}
        {game && (
          <div style={s.levelCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{t('game.level', { level: game.level })}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{`⭐ ${game.xp} ${t('rewards.xp')}`}</span>
            </div>
            <div style={s.xpTrack}><div style={{ ...s.xpFill, width: `${xpPct}%` }} /></div>
            {game.xpToNextLevel && (
              <p style={{ margin: '8px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'right' as const }}>
                {t('rewards.xpToNextLevel', { amount: game.xpToNextLevel - (game.xp ?? 0) })}
              </p>
            )}
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <span style={{ fontSize: isMobile ? 40 : 48, fontWeight: 700, color: '#FFF' }}>{game.level}</span>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{t('rewards.currentLevel')}</p>
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div style={s.statsRow}>
          <div style={s.statBox}>
            <p style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 700, color: colors.primary }}>{earned.length}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: colors.textSecondary }}>{t('rewards.earned')}</p>
          </div>
          <div style={s.statBox}>
            <p style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 700, color: colors.textMuted }}>{badges.length - earned.length}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: colors.textSecondary }}>{t('rewards.locked')}</p>
          </div>
          <div style={s.statBox}>
            <p style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 700, color: colors.textPrimary }}>{badges.length}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: colors.textSecondary }}>{t('rewards.total')}</p>
          </div>
        </div>

        {/* Badge Grid */}
        {badges.length === 0 ? (
          <div style={{ textAlign: 'center' as const, padding: 40 }}>
            <p style={{ fontSize: 48 }}>🏅</p>
            <p style={{ color: colors.textSecondary }}>{t('rewards.badgesAppear')}</p>
            <p style={{ color: colors.textMuted, fontSize: 13 }}>{t('rewards.badgesHint')}</p>
          </div>
        ) : (
          <div style={{ ...s.badgeGrid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {badges.map(badge => (
              <div key={badge.id} style={{ ...s.badgeCard, opacity: badge.earned ? 1 : 0.4, borderColor: badge.earned ? colors.primary : colors.border }}>
                <span style={{ fontSize: isMobile ? 30 : 36 }}>{badge.icon || '🏅'}</span>
                <p style={{ margin: '8px 0 2px', fontWeight: 600, color: colors.textPrimary, fontSize: isMobile ? 13 : 14 }}>{badge.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: colors.textSecondary, lineHeight: 1.4 }}>{badge.description}</p>
                {badge.earned && badge.earnedAt && (
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: colors.primary, fontWeight: 500 }}>
                    ✓ {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
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
  levelCard: { padding: 24, borderRadius: radius.lg, background: colors.cardGradient, boxShadow: shadows.bankCard, marginBottom: 20 },
  xpTrack: { height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 5, backgroundColor: '#FFF', transition: 'width 0.3s' },
  statsRow: { display: 'flex', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, textAlign: 'center' as const, padding: 16, borderRadius: radius.md, background: colors.surface, boxShadow: shadows.card },
  badgeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 },
  badgeCard: { padding: 16, border: '2px solid', borderRadius: radius.lg, textAlign: 'center' as const, background: colors.surface, boxShadow: shadows.card },
};

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../src/lib/auth-context';
import { api, type GameResponse, type Badge } from '../../../../../src/lib/api';
import { colors, radius, shadows } from '../../../../../src/lib/design-tokens';
import { useT } from '../../../../../src/lib/useT';
import { useIsMobile } from '../../../../../src/hooks/useIsMobile';

const RARITY_STYLES: Record<string, { color: string; glow: string }> = {
  common:    { color: '#6B7280', glow: '0 0 12px rgba(107, 114, 128, 0.4)' },
  rare:      { color: '#3B82F6', glow: '0 0 16px rgba(59, 130, 246, 0.5)' },
  epic:      { color: '#7C3AED', glow: '0 0 16px rgba(124, 58, 237, 0.5)' },
  legendary: { color: '#FCD34D', glow: '0 0 20px rgba(252, 211, 77, 0.5)' },
};

export default function RewardsPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useT();
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

  if (loading || authLoading) return (
    <div style={s.page}>
      <p style={{ color: '#6B6490', textAlign: 'center', paddingTop: 80 }}>{t('common.loading')}</p>
    </div>
  );

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

      <div style={{ ...s.content, padding: isMobile ? 16 : 24 }}>
        {/* Level Showcase */}
        {game && (
          <div style={{
            textAlign: 'center' as const,
            marginBottom: 28,
            animation: 'fadeIn 0.4s ease',
          }}>
            {/* Huge level number with glow */}
            <div style={{
              fontSize: 80,
              fontWeight: 800,
              color: '#F1F0FF',
              lineHeight: 1,
              textShadow: '0 0 40px rgba(99, 102, 241, 0.6), 0 0 80px rgba(99, 102, 241, 0.3)',
              marginBottom: 4,
            }}>
              {game.level}
            </div>
            <p style={{
              margin: '0 0 20px',
              fontSize: 14,
              color: '#A5A0C8',
              fontWeight: 600,
              textTransform: 'uppercase' as const,
              letterSpacing: 1,
            }}>
              {t('rewards.currentLevel')}
            </p>

            {/* XP Bar with cyan glow */}
            <div style={{
              maxWidth: 320,
              margin: '0 auto',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}>
                <span style={{ fontSize: 12, color: '#A5A0C8' }}>
                  {t('game.level', { level: game.level })}
                </span>
                <span style={{ fontSize: 12, color: '#22D3EE', fontWeight: 600 }}>
                  {`⭐ ${game.xp} ${t('rewards.xp')}`}
                </span>
              </div>
              <div style={s.xpTrack}>
                <div style={{
                  height: '100%',
                  borderRadius: 6,
                  background: 'linear-gradient(90deg, #22D3EE, #6366F1)',
                  boxShadow: '0 0 12px rgba(34, 211, 238, 0.5)',
                  width: `${xpPct}%`,
                  transition: 'width 0.6s ease',
                }} />
              </div>
              {game.xpToNextLevel && (
                <p style={{ margin: '8px 0 0', fontSize: 13, color: '#6B6490', textAlign: 'center' as const }}>
                  {t('rewards.xpToNextLevel', { amount: game.xpToNextLevel - (game.xp ?? 0) })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div style={s.statsRow}>
          <div style={s.statBox}>
            <p style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 700, color: '#6366F1' }}>{earned.length}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#A5A0C8' }}>{t('rewards.earned')}</p>
          </div>
          <div style={s.statBox}>
            <p style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 700, color: '#6B6490' }}>{badges.length - earned.length}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#A5A0C8' }}>{t('rewards.locked')}</p>
          </div>
          <div style={s.statBox}>
            <p style={{ margin: 0, fontSize: isMobile ? 22 : 26, fontWeight: 700, color: '#F1F0FF' }}>{badges.length}</p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#A5A0C8' }}>{t('rewards.total')}</p>
          </div>
        </div>

        {/* Badge Grid */}
        {badges.length === 0 ? (
          <div style={{ textAlign: 'center' as const, padding: 40 }}>
            <p style={{ fontSize: 48 }}>🏅</p>
            <p style={{ color: '#A5A0C8' }}>{t('rewards.badgesAppear')}</p>
            <p style={{ color: '#6B6490', fontSize: 13 }}>{t('rewards.badgesHint')}</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 14,
          }}>
            {badges.map((badge, idx) => {
              const rarity = RARITY_STYLES[(badge as any).rarity?.toLowerCase()] || RARITY_STYLES.common;
              const isEarned = badge.earned;
              const isLegendary = (badge as any).rarity?.toLowerCase() === 'legendary';

              return (
                <div
                  key={badge.id}
                  style={{
                    padding: 16,
                    borderRadius: radius.lg,
                    textAlign: 'center' as const,
                    background: isEarned ? '#211B3A' : '#1A1333',
                    border: isEarned ? `2px solid ${rarity.color}` : '2px solid #2D2545',
                    boxShadow: isEarned ? rarity.glow : 'none',
                    opacity: isEarned ? 1 : 0.5,
                    position: 'relative' as const,
                    animation: isLegendary && isEarned ? 'glowPulse 2s ease-in-out infinite' : `fadeIn 0.3s ease ${idx * 0.03}s both`,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {/* Locked overlay */}
                  {!isEarned && (
                    <div style={{
                      position: 'absolute' as const,
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: radius.lg,
                      zIndex: 1,
                    }}>
                      <span style={{
                        fontSize: 28,
                        color: '#6B6490',
                        fontWeight: 700,
                      }}>?</span>
                    </div>
                  )}
                  <span style={{
                    fontSize: isMobile ? 30 : 36,
                    filter: isEarned ? 'none' : 'grayscale(1) brightness(0.4)',
                  }}>
                    {badge.icon || '🏅'}
                  </span>
                  <p style={{
                    margin: '8px 0 2px',
                    fontWeight: 600,
                    color: isEarned ? '#F1F0FF' : '#6B6490',
                    fontSize: isMobile ? 13 : 14,
                  }}>
                    {isEarned ? badge.name : '???'}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: 12,
                    color: isEarned ? '#A5A0C8' : '#6B6490',
                    lineHeight: 1.4,
                  }}>
                    {isEarned ? badge.description : ''}
                  </p>
                  {isEarned && (badge as any).rarity && (
                    <span style={{
                      display: 'inline-block',
                      marginTop: 6,
                      padding: '2px 8px',
                      borderRadius: radius.pill,
                      fontSize: 10,
                      fontWeight: 600,
                      color: rarity.color,
                      backgroundColor: `${rarity.color}15`,
                      border: `1px solid ${rarity.color}30`,
                      textTransform: 'uppercase' as const,
                    }}>
                      {(badge as any).rarity}
                    </span>
                  )}
                  {isEarned && badge.earnedAt && (
                    <p style={{ margin: '6px 0 0', fontSize: 11, color: '#6366F1', fontWeight: 500 }}>
                      ✓ {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
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
  xpTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2D2545',
    overflow: 'hidden' as const,
  },
  statsRow: { display: 'flex', gap: 12, marginBottom: 24 },
  statBox: {
    flex: 1,
    textAlign: 'center' as const,
    padding: 16,
    borderRadius: radius.md,
    background: '#211B3A',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)',
    border: '1px solid #2D2545',
  },
};

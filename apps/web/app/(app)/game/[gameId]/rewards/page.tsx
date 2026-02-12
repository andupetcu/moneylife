'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../src/lib/auth-context';
import { api, type GameResponse, type Badge } from '../../../../../src/lib/api';

export default function RewardsPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
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

  if (loading || authLoading) return <div style={s.container}><p style={{ color: '#9CA3AF' }}>Loading...</p></div>;

  const xpPct = game?.xpToNextLevel ? Math.min(100, ((game?.xp ?? 0) / game.xpToNextLevel) * 100) : 0;
  const earned = badges.filter(b => b.earned);

  return (
    <div style={s.container}>
      <button onClick={() => router.push(`/game/${gameId}`)} style={s.backBtn}>← Back to Game</button>

      <h1 style={s.title}>🏆 Rewards & Badges</h1>

      {/* Level & XP */}
      {game && (
        <div style={s.levelCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>Level {game.level}</span>
            <span style={{ fontSize: 14, color: '#2563EB', fontWeight: 600 }}>⭐ {game.xp} XP</span>
          </div>
          <div style={s.xpTrack}><div style={{ ...s.xpFill, width: `${xpPct}%` }} /></div>
          {game.xpToNextLevel && (
            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#9CA3AF', textAlign: 'right' as const }}>
              {game.xpToNextLevel - (game.xp ?? 0)} XP to next level
            </p>
          )}
        </div>
      )}

      {/* Stats */}
      <div style={s.statsRow}>
        <div style={s.statBox}>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#2563EB' }}>{earned.length}</p>
          <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>Earned</p>
        </div>
        <div style={s.statBox}>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#9CA3AF' }}>{badges.length - earned.length}</p>
          <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>Locked</p>
        </div>
        <div style={s.statBox}>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#111827' }}>{badges.length}</p>
          <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>Total</p>
        </div>
      </div>

      {/* Badge Grid */}
      {badges.length === 0 ? (
        <div style={{ textAlign: 'center' as const, padding: 40 }}>
          <p style={{ fontSize: 48 }}>🏅</p>
          <p style={{ color: '#6B7280' }}>Badges will appear here as you play!</p>
          <p style={{ color: '#9CA3AF', fontSize: 13 }}>Make financial decisions and hit milestones to earn badges.</p>
        </div>
      ) : (
        <div style={s.badgeGrid}>
          {badges.map(badge => (
            <div key={badge.id} style={{ ...s.badgeCard, opacity: badge.earned ? 1 : 0.4, borderColor: badge.earned ? '#2563EB' : '#E5E7EB' }}>
              <span style={{ fontSize: 36 }}>{badge.icon || '🏅'}</span>
              <p style={{ margin: '8px 0 2px', fontWeight: 600, color: '#111827', fontSize: 14 }}>{badge.name}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#6B7280', lineHeight: 1.4 }}>{badge.description}</p>
              {badge.earned && badge.earnedAt && (
                <p style={{ margin: '6px 0 0', fontSize: 11, color: '#2563EB', fontWeight: 500 }}>
                  ✓ {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { maxWidth: 700, margin: '40px auto', padding: 24 },
  backBtn: { padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', color: '#6B7280', fontSize: 14, marginBottom: 24, display: 'inline-block', textDecoration: 'none' },
  title: { fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 24, textAlign: 'center' as const },
  levelCard: { padding: 20, border: '1px solid #E5E7EB', borderRadius: 14, background: '#FAFAFA', marginBottom: 20 },
  xpTrack: { height: 10, borderRadius: 5, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  xpFill: { height: '100%', borderRadius: 5, backgroundColor: '#2563EB', transition: 'width 0.3s' },
  statsRow: { display: 'flex', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, textAlign: 'center' as const, padding: 16, border: '1px solid #E5E7EB', borderRadius: 12 },
  badgeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 },
  badgeCard: { padding: 16, border: '2px solid', borderRadius: 14, textAlign: 'center' as const, background: '#FFF' },
};

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../src/lib/auth-context';
import { api, type GameResponse, type LoginReward } from '../../../../../src/lib/api';
import { colors, radius, shadows } from '../../../../../src/lib/design-tokens';
import { useT } from '../../../../../src/lib/useT';

const MILESTONE_DAYS = new Set([7, 14, 30]);

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export default function CalendarPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useT();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<GameResponse | null>(null);
  const [rewards, setRewards] = useState<LoginReward[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!gameId) return;
    const [gameRes, calRes] = await Promise.all([
      api.game.get(gameId),
      api.dailyEngagement.getLoginCalendar(gameId),
    ]);
    if (gameRes.ok && gameRes.data) setGame(gameRes.data);
    if (calRes.ok && calRes.data) {
      setRewards(Array.isArray(calRes.data) ? calRes.data : []);
    }
    setLoading(false);
  }, [gameId]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading, router, fetchData]);

  if (loading || authLoading || !game) {
    return (
      <div style={page}>
        <p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>
          {t('common.loading')}
        </p>
      </div>
    );
  }

  const gameDate = game.currentDate ? new Date(game.currentDate) : new Date();
  const year = gameDate.getFullYear();
  const month = gameDate.getMonth() + 1;
  const totalDays = daysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0=Sun

  // Build reward lookup
  const rewardMap = new Map<number, LoginReward>();
  for (const r of rewards) {
    const d = new Date(r.gameDate);
    if (d.getMonth() + 1 === month && d.getFullYear() === year) {
      rewardMap.set(d.getDate(), r);
    }
  }

  // Find current streak
  const currentStreak = rewards.length > 0
    ? rewards[rewards.length - 1].streakDay
    : 0;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div style={page}>
      {/* Header */}
      <div style={header}>
        <button onClick={() => router.push(`/game/${gameId}`)} style={backBtn}>←</button>
        <div style={{ textAlign: 'center' as const, flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#FFF' }}>
            📅 {t('dailyEngagement.loginCalendar')}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
            {monthNames[month - 1]} {year}
          </p>
        </div>
        <div style={{ width: 44 }} />
      </div>

      <div style={content}>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={statPill}>
            <span style={{ fontSize: 14 }}>🗓</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
              {t('dailyEngagement.daysPlayed', { count: rewards.length })}
            </span>
          </div>
          <div style={statPill}>
            <span style={{ fontSize: 14 }}>🔥</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: colors.accentGold }}>
              {t('dailyEngagement.currentStreak', { days: currentStreak })}
            </span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div style={calendarContainer}>
          {/* Day names header */}
          <div style={dayNamesRow}>
            {dayNames.map(d => (
              <div key={d} style={dayNameCell}>
                <span style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted }}>{d}</span>
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div style={calendarGrid}>
            {/* Empty cells for offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} style={emptyCell} />
            ))}

            {/* Day cells */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const reward = rewardMap.get(day);
              const isToday = day === gameDate.getDate();
              const isMilestone = reward && MILESTONE_DAYS.has(reward.streakDay);

              return (
                <div key={day} style={{
                  ...dayCell,
                  backgroundColor: reward ? 'rgba(99, 102, 241, 0.15)' : colors.surface,
                  border: isToday
                    ? `2px solid ${colors.primary}`
                    : reward
                      ? `1px solid rgba(99, 102, 241, 0.3)`
                      : `1px solid ${colors.border}`,
                  boxShadow: isMilestone ? colors.glowGold : 'none',
                }}>
                  <span style={{
                    fontSize: 14,
                    fontWeight: isToday ? 700 : 500,
                    color: reward ? colors.textPrimary : colors.textMuted,
                  }}>
                    {day}
                  </span>
                  {reward && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: isMilestone ? colors.accentGold : colors.accentCyan,
                    }}>
                      +{reward.rewardCoins}🪙
                    </span>
                  )}
                  {isMilestone && (
                    <span style={{ fontSize: 10, position: 'absolute' as const, top: 2, right: 4 }}>⭐</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestones legend */}
        <div style={legend}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: colors.textPrimary }}>
            {t('dailyEngagement.milestone')}
          </h3>
          {[
            { day: 7, text: t('dailyEngagement.milestoneDay7') },
            { day: 14, text: t('dailyEngagement.milestoneDay14') },
            { day: 30, text: t('dailyEngagement.milestoneDay30') },
          ].map(m => (
            <div key={m.day} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}>
              <span style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: currentStreak >= m.day ? 'rgba(252, 211, 77, 0.2)' : colors.surface,
                border: currentStreak >= m.day ? `1px solid ${colors.accentGold}` : `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
              }}>
                {currentStreak >= m.day ? '⭐' : '🔒'}
              </span>
              <span style={{
                fontSize: 13,
                color: currentStreak >= m.day ? colors.accentGold : colors.textMuted,
              }}>
                {m.text}
              </span>
            </div>
          ))}
        </div>

        {rewards.length === 0 && (
          <p style={{ textAlign: 'center' as const, color: colors.textMuted, fontSize: 14, marginTop: 20 }}>
            {t('dailyEngagement.noRewardsYet')}
          </p>
        )}
      </div>
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: colors.background,
};

const header: React.CSSProperties = {
  background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #818CF8 100%)',
  padding: '20px 24px',
  display: 'flex',
  alignItems: 'center',
  borderRadius: `0 0 ${radius.xl}px ${radius.xl}px`,
};

const backBtn: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: radius.sm,
  border: 'none',
  background: 'rgba(255,255,255,0.2)',
  color: '#FFF',
  fontSize: 16,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const content: React.CSSProperties = {
  padding: '20px 20px 40px',
};

const statPill: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 14px',
  borderRadius: radius.pill,
  backgroundColor: colors.surface,
  border: `1px solid ${colors.border}`,
};

const calendarContainer: React.CSSProperties = {
  borderRadius: radius.lg,
  background: colors.surfaceElevated,
  padding: 16,
  border: `1px solid ${colors.border}`,
  boxShadow: shadows.card,
  marginBottom: 20,
};

const dayNamesRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: 4,
  marginBottom: 8,
};

const dayNameCell: React.CSSProperties = {
  textAlign: 'center' as const,
  padding: 4,
};

const calendarGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: 4,
};

const emptyCell: React.CSSProperties = {
  aspectRatio: '1',
};

const dayCell: React.CSSProperties = {
  position: 'relative' as const,
  aspectRatio: '1',
  borderRadius: radius.sm,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
  padding: 2,
};

const legend: React.CSSProperties = {
  padding: 16,
  borderRadius: radius.lg,
  background: colors.surface,
  border: `1px solid ${colors.border}`,
};

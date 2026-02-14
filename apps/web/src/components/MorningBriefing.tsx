'use client';

import React, { useEffect, useState } from 'react';
import { api, type GameResponse, type DailyTip, type DailyChallenge, type LoginReward } from '../lib/api';
import { colors, radius, shadows } from '../lib/design-tokens';
import { useT } from '../lib/useT';

interface MorningBriefingProps {
  game: GameResponse;
  onDismiss: () => void;
}

const PERSONAS: Record<string, string> = {
  teen: 'Teen', student: 'Student', young_adult: 'Young Adult', parent: 'Parent',
};

function getStreakMultiplier(days: number): number {
  if (days >= 90) return 1.5;
  if (days >= 30) return 1.3;
  if (days >= 7) return 1.2;
  if (days >= 3) return 1.1;
  return 1;
}

function fmt(amount: number, currency: string): string {
  return (amount / 100).toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });
}

export default function MorningBriefing({ game, onDismiss }: MorningBriefingProps): React.ReactElement | null {
  const t = useT();
  const [tip, setTip] = useState<DailyTip | null>(null);
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [loginReward, setLoginReward] = useState<LoginReward | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const key = `ml_briefing_${game.id}_${game.currentDate}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(key)) {
      onDismiss();
      return;
    }

    async function load() {
      const [tipRes, challengeRes, rewardRes] = await Promise.all([
        api.dailyEngagement.getDailyTip(game.id),
        api.dailyEngagement.getDailyChallenge(game.id),
        api.dailyEngagement.claimLoginReward(game.id),
      ]);
      if (tipRes.ok && tipRes.data && 'tipText' in tipRes.data) setTip(tipRes.data);
      if (challengeRes.ok && challengeRes.data && 'title' in challengeRes.data) setChallenge(challengeRes.data);
      if (rewardRes.ok && rewardRes.data) setLoginReward(rewardRes.data);
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.id, game.currentDate]);

  const handleDismiss = () => {
    const key = `ml_briefing_${game.id}_${game.currentDate}`;
    if (typeof window !== 'undefined') sessionStorage.setItem(key, '1');
    onDismiss();
  };

  if (loading) return null;

  const currency = game.currency || 'USD';
  const streakDays = game.streakDays ?? 0;
  const mult = getStreakMultiplier(streakDays);
  const pendingCount = game.pendingCards?.length ?? 0;
  const dayNum = game.currentDate ? new Date(game.currentDate).getDate() : 1;

  return (
    <div style={overlay} onClick={handleDismiss}>
      <div style={backdrop} />
      <div style={modal} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center' as const, marginBottom: 20 }}>
          <span style={{ fontSize: 32 }}>📊</span>
          <h2 style={{ margin: '8px 0 4px', fontSize: 22, fontWeight: 700, color: colors.textPrimary }}>
            {t('dailyEngagement.goodMorning')}
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: colors.textSecondary }}>
            {t('dailyEngagement.dayLabel', { day: dayNum })} | {PERSONAS[game.persona] || game.persona} | {t('game.level', { level: game.level })}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
          {/* Net Worth */}
          <div style={row}>
            <span style={{ fontSize: 18 }}>💰</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, color: colors.textMuted }}>{t('dailyEngagement.netWorthLabel')}</span>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: colors.textPrimary }}>{fmt(game.netWorth ?? 0, currency)}</p>
            </div>
          </div>

          {/* Streak */}
          <div style={row}>
            <span style={{ fontSize: 18 }}>🔥</span>
            <span style={{ fontSize: 14, color: colors.textPrimary }}>
              {t('dailyEngagement.streakLabel', { days: streakDays, multiplier: mult.toFixed(1) })}
            </span>
          </div>

          {/* Pending decisions */}
          <div style={row}>
            <span style={{ fontSize: 18 }}>📋</span>
            <span style={{ fontSize: 14, color: pendingCount > 0 ? colors.warning : colors.textSecondary }}>
              {pendingCount > 0
                ? t('dailyEngagement.decisionsWaiting', { count: pendingCount })
                : t('dailyEngagement.noDecisions')
              }
            </span>
          </div>

          {/* Daily Tip */}
          {tip && (
            <div style={row}>
              <span style={{ fontSize: 18 }}>💡</span>
              <span style={{ fontSize: 13, color: colors.textSecondary, fontStyle: 'italic' as const }}>
                &ldquo;{tip.tipText}&rdquo;
              </span>
            </div>
          )}

          {/* Daily Challenge */}
          {challenge && (
            <div style={row}>
              <span style={{ fontSize: 18 }}>🎯</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, color: colors.textPrimary }}>{challenge.title}</span>
                <span style={{ fontSize: 12, color: colors.accentCyan, marginLeft: 8 }}>
                  (+{challenge.rewardXp} XP, +{challenge.rewardCoins} 🪙)
                </span>
              </div>
            </div>
          )}

          {/* Login Reward */}
          {loginReward && !loginReward.alreadyClaimed && (
            <div style={{
              ...row,
              backgroundColor: 'rgba(252, 211, 77, 0.1)',
              border: `1px solid rgba(252, 211, 77, 0.3)`,
              animation: 'celebrateGoldFlash 2s ease-in-out',
            }}>
              <span style={{ fontSize: 18 }}>🎁</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.accentGold }}>
                {t('dailyEngagement.loginRewardEarned', { coins: loginReward.rewardCoins, day: loginReward.streakDay })}
              </span>
            </div>
          )}
        </div>

        <button onClick={handleDismiss} style={btn}>
          {t('dailyEngagement.letsGo')}
        </button>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
};

const backdrop: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(15, 11, 30, 0.85)',
  backdropFilter: 'blur(8px)',
};

const modal: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: 420,
  padding: 28,
  borderRadius: radius.xl,
  background: colors.surfaceElevated,
  border: `1px solid ${colors.border}`,
  boxShadow: shadows.elevated,
  animation: 'scaleIn 0.3s ease',
  zIndex: 1,
};

const row: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '10px 14px',
  borderRadius: radius.md,
  backgroundColor: colors.surface,
};

const btn: React.CSSProperties = {
  width: '100%',
  marginTop: 20,
  padding: '14px 0',
  borderRadius: radius.md,
  background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #818CF8 100%)',
  color: '#FFF',
  fontSize: 16,
  fontWeight: 700,
  border: 'none',
  cursor: 'pointer',
  boxShadow: colors.glowPrimary,
  animation: 'glowPulse 2s ease-in-out infinite',
};

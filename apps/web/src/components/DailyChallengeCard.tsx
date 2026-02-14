'use client';

import React, { useEffect, useState } from 'react';
import { api, type DailyChallenge } from '../lib/api';
import { colors, radius, shadows } from '../lib/design-tokens';
import { useT } from '../lib/useT';

interface DailyChallengeCardProps {
  gameId: string;
  challenge?: DailyChallenge | null;
  onComplete?: (xp: number, coins: number) => void;
}

export default function DailyChallengeCard({ gameId, challenge: initialChallenge, onComplete }: DailyChallengeCardProps): React.ReactElement | null {
  const t = useT();
  const [challenge, setChallenge] = useState<DailyChallenge | null>(initialChallenge ?? null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (initialChallenge) {
      setChallenge(initialChallenge);
      return;
    }
    async function load() {
      const res = await api.dailyEngagement.getDailyChallenge(gameId);
      if (res.ok && res.data && 'title' in res.data) {
        setChallenge(res.data);
      }
    }
    load();
  }, [gameId, initialChallenge]);

  const handleComplete = async () => {
    if (!challenge || completing) return;
    setCompleting(true);
    const res = await api.dailyEngagement.completeDailyChallenge(gameId);
    if (res.ok && res.data) {
      setChallenge({ ...challenge, status: 'completed' });
      onComplete?.(res.data.xpEarned, res.data.coinsEarned);
    }
    setCompleting(false);
  };

  if (!challenge) return null;

  const isCompleted = challenge.status === 'completed';
  const isManualClaim = challenge.checkType === 'manual_claim';

  return (
    <div style={{
      ...card,
      borderColor: isCompleted ? 'rgba(52, 211, 153, 0.3)' : colors.border,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 24, flexShrink: 0 }}>
          {isCompleted ? '✅' : '🎯'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 600, color: colors.accentCyan, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>
            {t('dailyEngagement.dailyChallenge')}
          </p>
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: colors.textPrimary }}>
            {challenge.title}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: colors.textSecondary, lineHeight: 1.4 }}>
            {challenge.description}
          </p>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 14,
        paddingTop: 12,
        borderTop: `1px solid ${colors.border}`,
      }}>
        {/* Reward Preview */}
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{
            padding: '4px 10px',
            borderRadius: radius.pill,
            backgroundColor: 'rgba(34, 211, 238, 0.1)',
            fontSize: 12,
            fontWeight: 600,
            color: colors.accentCyan,
          }}>
            +{challenge.rewardXp} XP
          </span>
          <span style={{
            padding: '4px 10px',
            borderRadius: radius.pill,
            backgroundColor: 'rgba(252, 211, 77, 0.1)',
            fontSize: 12,
            fontWeight: 600,
            color: colors.accentGold,
          }}>
            +{challenge.rewardCoins} 🪙
          </span>
        </div>

        {/* Action button */}
        {isCompleted ? (
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: colors.success,
          }}>
            {t('dailyEngagement.completedReward', { xp: challenge.rewardXp })}
          </span>
        ) : isManualClaim ? (
          <button onClick={handleComplete} disabled={completing} style={completeBtn}>
            {completing ? '...' : t('dailyEngagement.complete')}
          </button>
        ) : (
          <span style={{ fontSize: 12, color: colors.textMuted }}>
            {t('dailyEngagement.autoProgress')}
          </span>
        )}
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  padding: 16,
  borderRadius: radius.lg,
  background: colors.surface,
  border: `1px solid ${colors.border}`,
  boxShadow: shadows.card,
  marginBottom: 16,
};

const completeBtn: React.CSSProperties = {
  padding: '8px 20px',
  borderRadius: radius.pill,
  background: 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)',
  color: '#FFF',
  fontSize: 13,
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s',
  minHeight: 36,
};

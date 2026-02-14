'use client';

import React, { useMemo } from 'react';
import { useCelebration, type CelebrationEvent } from '../lib/celebration-context';
import { colors, radius, shadows } from '../lib/design-tokens';
import { useT } from '../lib/useT';

/* ── Particle helpers ── */

function randomBetween(a: number, b: number): number {
  return a + Math.random() * (b - a);
}

function ConfettiParticles({ count, color }: { count: number; color: string }): React.ReactElement {
  const particles = useMemo(() =>
    Array.from({ length: count }).map((_, i) => {
      const angle = (360 / count) * i + randomBetween(-15, 15);
      const rad = (angle * Math.PI) / 180;
      const dist = randomBetween(60, 140);
      const dx = Math.cos(rad) * dist;
      const dy = Math.sin(rad) * dist;
      const size = randomBetween(4, 10);
      const hue = randomBetween(-30, 30);
      return { dx, dy, size, delay: randomBetween(0, 0.3), hue, id: i };
    })
  , [count]);

  return (
    <>
      <style>{particles.map(p => `
        @keyframes cp-${p.id} {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(${p.dx}px, ${p.dy}px) scale(0); opacity: 0; }
        }
      `).join('')}</style>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          width: p.size,
          height: p.size,
          borderRadius: p.size > 7 ? '50%' : 2,
          backgroundColor: color,
          filter: `hue-rotate(${p.hue}deg)`,
          animation: `cp-${p.id} 1.2s ease-out ${p.delay}s forwards`,
        }} />
      ))}
    </>
  );
}

function SparkleEffect({ color }: { color: string }): React.ReactElement {
  const sparkles = useMemo(() =>
    Array.from({ length: 6 }).map((_, i) => ({
      left: `${20 + (i * 12) % 60}%`,
      top: `${15 + (i * 17) % 50}%`,
      delay: i * 0.1,
      size: 8 + (i % 3) * 4,
      id: i,
    }))
  , []);

  return (
    <>
      {sparkles.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: s.left,
          top: s.top,
          width: s.size,
          height: s.size,
          borderRadius: '50%',
          backgroundColor: color,
          animation: `celebrateSparkle 0.6s ease-out ${s.delay}s both`,
          boxShadow: `0 0 ${s.size}px ${color}`,
        }} />
      ))}
    </>
  );
}

/* ── Individual celebration renderers ── */

function XPCelebration({ event }: { event: CelebrationEvent }): React.ReactElement {
  const t = useT();
  const amount = event.data.amount ?? 15;
  return (
    <div style={celebStyles.floatContainer}>
      <SparkleEffect color={colors.accentCyan} />
      <div style={{
        ...celebStyles.floatText,
        color: colors.accentCyan,
        textShadow: `0 0 12px ${colors.accentCyan}`,
        animation: 'celebrateFloat 0.8s ease-out forwards',
      }}>
        {t('celebration.xpGained', { amount })}
      </div>
    </div>
  );
}

function CoinsCelebration({ event }: { event: CelebrationEvent }): React.ReactElement {
  const amount = event.data.amount ?? 5;
  return (
    <div style={celebStyles.floatContainer}>
      <SparkleEffect color={colors.accentGold} />
      <div style={{
        ...celebStyles.floatText,
        color: colors.accentGold,
        textShadow: `0 0 12px ${colors.accentGold}`,
        animation: 'celebrateFloat 0.8s ease-out forwards',
      }}>
        +{amount} 🪙
      </div>
    </div>
  );
}

function BadgeCelebration({ event }: { event: CelebrationEvent }): React.ReactElement {
  const t = useT();
  const emoji = event.data.emoji || '🏅';
  const label = event.data.label || t('celebration.badgeEarned');
  return (
    <div style={celebStyles.fullscreen} onClick={(e) => e.stopPropagation()}>
      <div style={celebStyles.backdrop} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
        <div style={celebStyles.confettiWrap}>
          <ConfettiParticles count={20} color={colors.accentGold} />
        </div>
        <div style={{
          fontSize: 72,
          animation: 'celebrateZoomIn 0.6s ease-out forwards',
          filter: 'drop-shadow(0 0 20px rgba(252, 211, 77, 0.6))',
        }}>
          {emoji}
        </div>
        <div style={{
          ...celebStyles.bigLabel,
          color: colors.accentGold,
          animation: 'fadeIn 0.4s ease 0.3s both',
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function LevelUpCelebration({ event }: { event: CelebrationEvent }): React.ReactElement {
  const t = useT();
  const level = event.data.level ?? 2;
  return (
    <div style={celebStyles.fullscreen} onClick={(e) => e.stopPropagation()}>
      <div style={celebStyles.backdrop} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
        <div style={celebStyles.confettiWrap}>
          <ConfettiParticles count={30} color={colors.primary} />
        </div>
        <div style={{
          fontSize: 80,
          fontWeight: 900,
          color: '#FFF',
          animation: 'celebrateLevelFly 0.8s ease-out forwards',
          textShadow: '0 0 30px rgba(99, 102, 241, 0.8)',
        }}>
          {level}
        </div>
        <div style={{
          fontSize: 28,
          fontWeight: 800,
          color: colors.accentCyan,
          letterSpacing: 4,
          textTransform: 'uppercase' as const,
          animation: 'fadeIn 0.4s ease 0.5s both',
          textShadow: `0 0 20px ${colors.accentCyan}`,
        }}>
          {t('celebration.levelUp')}
        </div>
      </div>
    </div>
  );
}

function StreakCelebration({ event }: { event: CelebrationEvent }): React.ReactElement {
  const t = useT();
  const days = event.data.streakDays ?? 7;
  const multiplier = event.data.multiplier ?? 1;
  return (
    <div style={celebStyles.bannerContainer}>
      <div style={{
        ...celebStyles.banner,
        borderColor: '#EF4444',
        boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)',
      }}>
        <span style={{
          fontSize: 36,
          animation: 'celebrateStreakPulse 0.5s ease-in-out 3',
        }}>🔥</span>
        <div>
          <div style={{ fontWeight: 700, color: colors.textPrimary, fontSize: 16 }}>
            {t('celebration.streakMilestone', { days })}
          </div>
          {multiplier > 1 && (
            <div style={{ fontSize: 13, color: colors.accentCyan, fontWeight: 600 }}>
              {t('celebration.streakMultiplier', { multiplier: multiplier.toFixed(1) })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BillPaidCelebration(): React.ReactElement {
  return (
    <div style={celebStyles.floatContainer}>
      <div style={{
        fontSize: 40,
        color: colors.success,
        animation: 'celebrateCheckmark 0.5s ease-out forwards',
        filter: `drop-shadow(0 0 10px ${colors.success})`,
      }}>
        ✓
      </div>
    </div>
  );
}

function SalaryCelebration({ event }: { event: CelebrationEvent }): React.ReactElement {
  const t = useT();
  const amount = event.data.amount ?? 0;
  return (
    <div style={celebStyles.bannerContainer}>
      <div style={{
        ...celebStyles.banner,
        borderColor: colors.success,
        boxShadow: `0 0 20px rgba(52, 211, 153, 0.3)`,
      }}>
        <span style={{ fontSize: 28 }}>💰</span>
        <div style={{
          animation: 'celebrateCountUp 1s ease-out forwards',
        }}>
          <div style={{ fontSize: 13, color: colors.textSecondary, fontWeight: 500 }}>
            {t('celebration.salaryReceived')}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: colors.success }}>
            +{amount > 0 ? (amount / 100).toLocaleString('en-US', { minimumFractionDigits: 0 }) : '0'}
          </div>
        </div>
      </div>
    </div>
  );
}

function CrisisCelebration(): React.ReactElement {
  const t = useT();
  return (
    <div style={celebStyles.fullscreen} onClick={(e) => e.stopPropagation()}>
      <div style={{ ...celebStyles.backdrop, backgroundColor: 'rgba(15, 11, 30, 0.6)' }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
        <div style={{
          fontSize: 64,
          animation: 'celebrateShield 0.8s ease-out forwards',
          filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.5))',
        }}>
          🛡️
        </div>
        <div style={{
          ...celebStyles.bigLabel,
          color: colors.primaryLight,
          animation: 'fadeIn 0.4s ease 0.5s both',
        }}>
          {t('celebration.survived')}
        </div>
      </div>
    </div>
  );
}

function NetWorthHighCelebration(): React.ReactElement {
  return (
    <div style={celebStyles.floatContainer}>
      <div style={{
        width: 120,
        height: 120,
        borderRadius: radius.lg,
        animation: 'celebrateGoldFlash 1s ease-out forwards',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontSize: 40,
          filter: 'drop-shadow(0 0 10px rgba(252, 211, 77, 0.6))',
        }}>📈✨</span>
      </div>
    </div>
  );
}

/* ── Main overlay component ── */

const RENDERERS: Record<string, React.ComponentType<{ event: CelebrationEvent }>> = {
  xp: XPCelebration,
  coins: CoinsCelebration,
  badge: BadgeCelebration,
  levelUp: LevelUpCelebration,
  streak: StreakCelebration,
  billPaid: BillPaidCelebration,
  salary: SalaryCelebration,
  crisis: CrisisCelebration,
  netWorthHigh: NetWorthHighCelebration,
};

export default function CelebrationOverlay(): React.ReactElement | null {
  const { current, dismiss } = useCelebration();

  if (!current) return null;

  const Renderer = RENDERERS[current.type];
  if (!Renderer) return null;

  const isFullscreen = current.type === 'badge' || current.type === 'levelUp' || current.type === 'crisis';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        display: 'flex',
        alignItems: isFullscreen ? 'center' : 'flex-start',
        justifyContent: 'center',
        paddingTop: isFullscreen ? 0 : 120,
        pointerEvents: isFullscreen ? 'auto' : 'none',
      }}
      onClick={isFullscreen ? dismiss : undefined}
    >
      <Renderer event={current} />
    </div>
  );
}

/* ── Styles ── */

const celebStyles: Record<string, React.CSSProperties> = {
  floatContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  floatText: {
    fontSize: 24,
    fontWeight: 800,
    whiteSpace: 'nowrap',
  },
  fullscreen: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(15, 11, 30, 0.75)',
    backdropFilter: 'blur(4px)',
  },
  bigLabel: {
    fontSize: 22,
    fontWeight: 800,
    marginTop: 12,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  confettiWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 0,
    height: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContainer: {
    position: 'relative',
    animation: 'slideUp 0.3s ease-out',
    pointerEvents: 'none',
    width: '100%',
    maxWidth: 360,
    padding: '0 20px',
  },
  banner: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '16px 20px',
    borderRadius: radius.lg,
    background: colors.surfaceElevated,
    border: '2px solid',
    boxShadow: shadows.elevated,
  },
};

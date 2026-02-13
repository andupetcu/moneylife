'use client';

import React, { useEffect, useState } from 'react';
import { useT } from '../lib/useT';
import { colors, radius, shadows } from '../lib/design-tokens';

interface LevelUpModalProps {
  level: number;
  onDismiss: () => void;
}

const LEVEL_UNLOCKS: Record<number, string[]> = {
  2: ['Credit Cards', 'Budget Tracking'],
  3: ['Investments', 'Auto-pay'],
  4: ['Loans', 'Insurance'],
  5: ['Mortgage', 'Advanced Analytics'],
};

export default function LevelUpModal({ level, onDismiss }: LevelUpModalProps): React.ReactElement {
  const t = useT();
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAnimating(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const unlocks = LEVEL_UNLOCKS[level] || [];

  return (
    <div style={s.overlay}>
      <div style={s.backdrop} />
      <div style={{ ...s.modal, transform: animating ? 'scale(0.8)' : 'scale(1)', opacity: animating ? 0 : 1 }}>
        {/* Stars animation via CSS keyframes */}
        <style>{`
          @keyframes ml-star-float {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(-80px) rotate(180deg); opacity: 0; }
          }
          @keyframes ml-pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.3); }
            50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.6); }
          }
        `}</style>

        {/* Floating stars */}
        <div style={s.starsContainer}>
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              style={{
                position: 'absolute',
                fontSize: 14 + (i % 3) * 6,
                left: `${8 + (i * 7.5) % 85}%`,
                bottom: 0,
                animation: `ml-star-float ${1.5 + (i % 4) * 0.3}s ease-out ${i * 0.1}s forwards`,
              }}
            >
              {i % 3 === 0 ? '⭐' : i % 3 === 1 ? '✨' : '🌟'}
            </span>
          ))}
        </div>

        {/* Header */}
        <div style={s.header}>
          <div style={s.levelBadge}>
            <span style={{ fontSize: 44 }}>🏆</span>
          </div>
          <h2 style={s.title}>{t('levelUp.title')}</h2>
          <div style={s.levelNumber}>
            <span style={s.levelText}>{level}</span>
          </div>
        </div>

        {/* Unlocks */}
        {unlocks.length > 0 && (
          <div style={s.unlocks}>
            <p style={s.unlocksLabel}>{t('levelUp.unlocked')}</p>
            {unlocks.map(item => (
              <div key={item} style={s.unlockItem}>
                <span style={{ fontSize: 16 }}>🔓</span>
                <span style={s.unlockText}>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* XP bonus */}
        <div style={s.xpBonus}>
          <span style={{ fontSize: 18 }}>⭐</span>
          <span style={s.xpText}>{t('levelUp.xpBonus', { amount: level * 50 })}</span>
        </div>

        {/* Continue button */}
        <div style={{ padding: '0 24px 24px' }}>
          <button onClick={onDismiss} style={s.continueBtn}>
            {t('levelUp.continue')}
          </button>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(30, 27, 75, 0.7)',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: 380,
    borderRadius: radius.xl,
    background: colors.surface,
    boxShadow: shadows.elevated,
    overflow: 'hidden',
    transition: 'transform 0.4s ease, opacity 0.4s ease',
  },
  starsContainer: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  header: {
    background: 'linear-gradient(135deg, #312E81 0%, #4338CA 50%, #F59E0B 100%)',
    padding: '36px 24px 28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'ml-pulse-glow 2s ease-in-out infinite',
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    color: '#FFFFFF',
  },
  levelNumber: {
    width: 56,
    height: 56,
    borderRadius: 28,
    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
    marginTop: 4,
  },
  levelText: {
    fontSize: 26,
    fontWeight: 800,
    color: '#FFFFFF',
  },
  unlocks: {
    padding: '20px 24px 0',
  },
  unlocksLabel: {
    margin: '0 0 10px',
    fontSize: 13,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  unlockItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 14px',
    borderRadius: radius.sm,
    backgroundColor: '#EEF2FF',
    marginBottom: 8,
  },
  unlockText: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.primary,
  },
  xpBonus: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '16px 24px',
  },
  xpText: {
    fontSize: 16,
    fontWeight: 700,
    color: '#D97706',
  },
  continueBtn: {
    width: '100%',
    height: 52,
    borderRadius: radius.md,
    border: 'none',
    background: colors.primaryGradient,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
  },
};

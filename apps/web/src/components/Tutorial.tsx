'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { colors, radius, shadows } from '../lib/design-tokens';

interface TutorialStep {
  key: string;
  icon: string;
}

const STEPS: TutorialStep[] = [
  { key: 'step1', icon: '👋' },
  { key: 'step2', icon: '💳' },
  { key: 'step3', icon: '📋' },
  { key: 'step4', icon: '⚖️' },
  { key: 'step5', icon: '📬' },
  { key: 'step6', icon: '📊' },
  { key: 'step7', icon: '⭐' },
  { key: 'step8', icon: '🚀' },
];

function getStorageKey(gameId: string): string {
  return `moneylife_tutorial_completed_${gameId}`;
}

interface TutorialProps {
  gameId: string;
  onComplete: () => void;
}

export default function Tutorial({ gameId, onComplete }: TutorialProps): React.ReactElement | null {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(getStorageKey(gameId));
    if (!done) {
      setVisible(true);
    }
  }, [gameId]);

  const finish = useCallback(() => {
    localStorage.setItem(getStorageKey(gameId), 'true');
    setVisible(false);
    onComplete();
  }, [gameId, onComplete]);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      finish();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <div style={s.overlay}>
      <div style={s.backdrop} onClick={finish} />
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.iconCircle}>
            <span style={{ fontSize: 36 }}>{current.icon}</span>
          </div>
          <p style={s.stepLabel}>
            {t('tutorial.stepOf', { current: step + 1, total: STEPS.length })}
          </p>
        </div>

        {/* Body */}
        <div style={s.body}>
          <p style={s.text}>{t(`tutorial.${current.key}`)}</p>
        </div>

        {/* Progress dots */}
        <div style={s.dots}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                ...s.dot,
                backgroundColor: i === step ? colors.primary : colors.borderLight,
                width: i === step ? 24 : 8,
              }}
            />
          ))}
        </div>

        {/* Buttons */}
        <div style={s.buttons}>
          {step > 0 ? (
            <button onClick={handleBack} style={s.backBtn}>
              {t('common.back')}
            </button>
          ) : (
            <button onClick={finish} style={s.skipBtn}>
              {t('tutorial.skip')}
            </button>
          )}
          <button onClick={handleNext} style={s.nextBtn}>
            {step < STEPS.length - 1 ? t('common.next') : t('tutorial.letsGo')}
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
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(30, 27, 75, 0.6)',
    backdropFilter: 'blur(4px)',
  },
  modal: {
    position: 'relative',
    width: '100%',
    maxWidth: 400,
    borderRadius: radius.xl,
    background: colors.surface,
    boxShadow: shadows.elevated,
    overflow: 'hidden',
  },
  header: {
    background: colors.primaryGradient,
    padding: '32px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.5,
  },
  body: {
    padding: '28px 24px 16px',
  },
  text: {
    margin: 0,
    fontSize: 16,
    lineHeight: '1.6',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: 6,
    padding: '0 24px 20px',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s',
  },
  buttons: {
    display: 'flex',
    gap: 12,
    padding: '0 24px 24px',
  },
  backBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  skipBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    border: 'none',
    background: 'transparent',
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  nextBtn: {
    flex: 2,
    height: 48,
    borderRadius: radius.md,
    border: 'none',
    background: colors.primaryGradient,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
};

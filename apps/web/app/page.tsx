'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { colors, radius, shadows } from '../src/lib/design-tokens';

/**
 * Landing page
 */
export default function LandingPage(): React.ReactElement {
  const { t } = useTranslation();

  const features = [
    { icon: '📊', title: t('landing.realisticSim'), desc: t('landing.realisticSimDesc') },
    { icon: '🎯', title: t('landing.decisionCards'), desc: t('landing.decisionCardsDesc') },
    { icon: '🏆', title: t('landing.earnRewards'), desc: t('landing.earnRewardsDesc') },
    { icon: '🏫', title: t('landing.classroomMode'), desc: t('landing.classroomModeDesc') },
    { icon: '🏦', title: t('landing.mirrorMode'), desc: t('landing.mirrorModeDesc') },
    { icon: '🌍', title: t('landing.multiCurrency'), desc: t('landing.multiCurrencyDesc') },
  ];

  return (
    <main style={{ minHeight: '100vh', background: colors.background }}>
      {/* Hero */}
      <section style={{
        background: colors.primaryGradient,
        padding: '100px 24px 80px',
        textAlign: 'center',
        borderRadius: `0 0 ${radius.xl}px ${radius.xl}px`,
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
          <h1 style={{ fontSize: 52, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>{t('appTitle')}</h1>
          <p style={{ fontSize: 22, color: 'rgba(255,255,255,0.85)', marginBottom: 16 }}>{t('landing.tagline')}</p>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            {t('landing.description')}
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Link href="/register" style={{
              background: '#FFFFFF',
              color: colors.primary,
              padding: '16px 36px',
              borderRadius: radius.pill,
              fontSize: 18,
              fontWeight: 600,
              boxShadow: shadows.elevated,
            }}>
              {t('landing.getStarted')}
            </Link>
            <Link href="/login" style={{
              border: '2px solid rgba(255,255,255,0.5)',
              color: '#FFFFFF',
              padding: '14px 36px',
              borderRadius: radius.pill,
              fontSize: 18,
              fontWeight: 600,
            }}>
              {t('landing.signIn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '60px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 20,
      }}>
        {features.map((f) => (
          <div key={f.title} style={{
            background: colors.surface,
            padding: 28,
            borderRadius: radius.lg,
            boxShadow: shadows.card,
            border: `1px solid ${colors.borderLight}`,
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: colors.textPrimary, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '32px 24px',
        color: colors.textMuted,
        borderTop: `1px solid ${colors.border}`,
        fontSize: 14,
      }}>
        <p>{t('landing.footer')}</p>
      </footer>
    </main>
  );
}

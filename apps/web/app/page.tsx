'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { colors, radius, shadows } from '../src/lib/design-tokens';
import en from '../src/i18n/en.json';

function tx(key: string): string {
  const parts = key.split('.');
  let val: unknown = en;
  for (const p of parts) {
    if (val && typeof val === 'object') val = (val as Record<string, unknown>)[p];
    else return key;
  }
  return typeof val === 'string' ? val : key;
}

export default function LandingPage(): React.ReactElement {
  const [isMobile, setIsMobile] = useState(false);
  const { t, ready } = useTranslation();
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Use i18n t() if ready, otherwise fallback to direct JSON lookup
  const T = ready && t('landing.tagline') !== 'landing.tagline' ? t : tx;

  const features = [
    { icon: '📊', title: T('landing.realisticSim'), desc: T('landing.realisticSimDesc') },
    { icon: '🎯', title: T('landing.decisionCards'), desc: T('landing.decisionCardsDesc') },
    { icon: '🏆', title: T('landing.earnRewards'), desc: T('landing.earnRewardsDesc') },
    { icon: '🏫', title: T('landing.classroomMode'), desc: T('landing.classroomModeDesc') },
    { icon: '🏦', title: T('landing.mirrorMode'), desc: T('landing.mirrorModeDesc') },
    { icon: '🌍', title: T('landing.multiCurrency'), desc: T('landing.multiCurrencyDesc') },
  ];

  return (
    <main style={{ minHeight: '100vh', background: colors.background }}>
      <section style={{
        background: colors.primaryGradient,
        padding: isMobile ? '60px 20px 50px' : '100px 24px 80px',
        textAlign: 'center',
        borderRadius: `0 0 ${radius.xl}px ${radius.xl}px`,
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: isMobile ? 36 : 48, marginBottom: 12 }}>💰</div>
          <h1 style={{ fontSize: isMobile ? 28 : 52, fontWeight: 700, color: '#FFFFFF', marginBottom: 12 }}>MoneyLife</h1>
          <p style={{ fontSize: isMobile ? 17 : 22, color: 'rgba(255,255,255,0.85)', marginBottom: 16 }}>{T('landing.tagline')}</p>
          <p style={{ fontSize: isMobile ? 15 : 17, color: 'rgba(255,255,255,0.7)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            {T('landing.description')}
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
            <Link href="/register" style={{
              background: '#FFFFFF', color: colors.primary, padding: '16px 36px', borderRadius: radius.pill,
              fontSize: isMobile ? 16 : 18, fontWeight: 600, boxShadow: shadows.elevated,
              width: isMobile ? '100%' : 'auto', textAlign: 'center', minHeight: 44,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {T('landing.getStarted')}
            </Link>
            <Link href="/login" style={{
              border: '2px solid rgba(255,255,255,0.5)', color: '#FFFFFF', padding: '14px 36px',
              borderRadius: radius.pill, fontSize: isMobile ? 16 : 18, fontWeight: 600,
              width: isMobile ? '100%' : 'auto', textAlign: 'center', minHeight: 44,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {T('landing.signIn')}
            </Link>
          </div>
        </div>
      </section>

      <section style={{
        maxWidth: 1100, margin: '0 auto', padding: isMobile ? '40px 16px' : '60px 24px',
        display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20,
      }}>
        {features.map((f) => (
          <div key={f.title} style={{
            background: colors.surface, padding: isMobile ? 20 : 28, borderRadius: radius.lg,
            boxShadow: shadows.card, border: `1px solid ${colors.borderLight}`,
          }}>
            <div style={{ fontSize: isMobile ? 28 : 36, marginBottom: 12 }}>{f.icon}</div>
            <h3 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, color: colors.textPrimary, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: isMobile ? 14 : 15, color: colors.textSecondary, lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </section>

      <footer style={{
        textAlign: 'center', padding: '32px 24px', color: colors.textMuted,
        borderTop: `1px solid ${colors.border}`, fontSize: 14,
      }}>
        <p>{T('landing.footer')}</p>
      </footer>
    </main>
  );
}

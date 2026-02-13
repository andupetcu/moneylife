'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { colors, radius, shadows } from '../../../src/lib/design-tokens';

export default function RewardsPage(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
      <div style={{ background: colors.primaryGradient, padding: '16px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: `0 0 ${radius.xl}px ${radius.xl}px` }}>
        <button onClick={() => router.push('/dashboard')} style={{ width: 44, height: 44, borderRadius: radius.sm, border: 'none', background: 'rgba(255,255,255,0.2)', color: '#FFF', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#FFF' }}>{t('rewards.title')}</span>
        <div style={{ width: 44 }} />
      </div>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ textAlign: 'center', padding: 40, background: colors.surface, borderRadius: radius.lg, boxShadow: shadows.card }}>
          <span style={{ fontSize: 48 }}>🏅</span>
          <p style={{ color: colors.textSecondary, margin: '16px 0 8px', fontSize: 16, fontWeight: 600 }}>{t('rewards.noBadges')}</p>
          <p style={{ color: colors.textMuted, fontSize: 14 }}>Start a game and earn badges by making smart financial decisions!</p>
          <button onClick={() => router.push('/dashboard')} style={{ marginTop: 20, padding: '12px 28px', borderRadius: radius.md, background: colors.primaryGradient, color: '#FFF', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', minHeight: 44 }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

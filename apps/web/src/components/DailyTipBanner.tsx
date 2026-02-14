'use client';

import React, { useEffect, useState } from 'react';
import { api, type DailyTip } from '../lib/api';
import { colors, radius, shadows } from '../lib/design-tokens';
import { useT } from '../lib/useT';

interface DailyTipBannerProps {
  gameId: string;
  tip?: DailyTip | null;
}

export default function DailyTipBanner({ gameId, tip: initialTip }: DailyTipBannerProps): React.ReactElement | null {
  const t = useT();
  const [tip, setTip] = useState<DailyTip | null>(initialTip ?? null);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (initialTip) {
      setTip(initialTip);
      setTimeout(() => setVisible(true), 100);
      return;
    }
    async function load() {
      const res = await api.dailyEngagement.getDailyTip(gameId);
      if (res.ok && res.data && 'tipText' in res.data) {
        setTip(res.data);
        setTimeout(() => setVisible(true), 100);
      }
    }
    load();
  }, [gameId, initialTip]);

  const handleDismiss = async () => {
    if (tip) {
      await api.dailyEngagement.markTipUseful(gameId, tip.id);
    }
    setVisible(false);
    setTimeout(() => setDismissed(true), 300);
  };

  if (dismissed || !tip) return null;

  return (
    <div style={{
      ...banner,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(12px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>💡</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 600, color: colors.accentGold, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>
            {t('dailyEngagement.tipOfTheDay')}
          </p>
          <p style={{ margin: 0, fontSize: 14, color: colors.textPrimary, lineHeight: 1.5 }}>
            {tip.tipText}
          </p>
          {tip.tipSource && (
            <p style={{ margin: '4px 0 0', fontSize: 11, color: colors.textMuted, fontStyle: 'italic' as const }}>
              — {tip.tipSource}
            </p>
          )}
        </div>
      </div>
      <button onClick={handleDismiss} style={dismissBtn}>
        {t('dailyEngagement.gotIt')}
      </button>
    </div>
  );
}

const banner: React.CSSProperties = {
  padding: 16,
  borderRadius: radius.lg,
  background: colors.surface,
  border: `1px solid rgba(252, 211, 77, 0.2)`,
  boxShadow: shadows.card,
  marginBottom: 16,
};

const dismissBtn: React.CSSProperties = {
  display: 'block',
  marginTop: 12,
  marginLeft: 'auto',
  padding: '8px 18px',
  borderRadius: radius.pill,
  background: 'rgba(252, 211, 77, 0.15)',
  color: colors.accentGold,
  fontSize: 13,
  fontWeight: 600,
  border: `1px solid rgba(252, 211, 77, 0.3)`,
  cursor: 'pointer',
  transition: 'all 0.2s',
};

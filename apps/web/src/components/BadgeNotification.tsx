'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { colors, radius, shadows } from '../lib/design-tokens';
import type { Badge } from '../lib/api';

interface BadgeToast {
  badge: Badge;
  id: string;
}

interface BadgeNotificationProps {
  badges: Badge[];
  onClear: () => void;
}

export default function BadgeNotification({ badges, onClear }: BadgeNotificationProps): React.ReactElement | null {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState<BadgeToast[]>([]);

  useEffect(() => {
    if (badges.length === 0) return;
    const newToasts = badges.map(badge => ({
      badge,
      id: `${badge.id}-${Date.now()}`,
    }));
    setToasts(prev => [...prev, ...newToasts]);
    onClear();
  }, [badges, onClear]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map(toast =>
      setTimeout(() => dismiss(toast.id), 5000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div style={s.container}>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            ...s.toast,
            transform: `translateY(${-index * 8}px)`,
            opacity: Math.max(0.6, 1 - index * 0.15),
            zIndex: 1200 - index,
          }}
          onClick={() => dismiss(toast.id)}
        >
          <div style={s.iconWrap}>
            <span style={{ fontSize: 28 }}>{toast.badge.icon || '🏅'}</span>
          </div>
          <div style={s.textWrap}>
            <p style={s.label}>{t('badges.earned')}</p>
            <p style={s.name}>{toast.badge.name}</p>
            <p style={s.desc}>{toast.badge.description}</p>
          </div>
          <div style={s.shimmer} />
        </div>
      ))}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: 80,
    left: 16,
    right: 16,
    zIndex: 1200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  toast: {
    width: '100%',
    maxWidth: 400,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 18px',
    borderRadius: radius.lg,
    background: colors.surface,
    boxShadow: shadows.bankCard,
    border: `2px solid #F59E0B`,
    marginBottom: 8,
    cursor: 'pointer',
    pointerEvents: 'auto',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, opacity 0.3s ease',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    margin: 0,
    fontSize: 11,
    fontWeight: 700,
    color: '#D97706',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    margin: '2px 0 0',
    fontSize: 15,
    fontWeight: 700,
    color: colors.textPrimary,
  },
  desc: {
    margin: '2px 0 0',
    fontSize: 12,
    color: colors.textSecondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.08))',
    pointerEvents: 'none',
  },
};

'use client';

import React, { useState } from 'react';
import { useT } from '../lib/useT';
import { api } from '../lib/api';
import { colors, radius, shadows } from '../lib/design-tokens';

interface ShareableCardProps {
  badgeIcon: string;
  badgeName: string;
  badgeDescription?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  playerName: string;
  level: number;
  day?: number;
  netWorth?: number;
  badgeId?: string;
  onClose?: () => void;
}

const RARITY_GRADIENTS: Record<string, string> = {
  common: 'linear-gradient(135deg, #1A1333 0%, #211B3A 50%, #2D2545 100%)',
  rare: 'linear-gradient(135deg, #1A1333 0%, #1E3A5F 50%, #2D2545 100%)',
  epic: 'linear-gradient(135deg, #1A1333 0%, #4338CA 50%, #7C3AED 100%)',
  legendary: 'linear-gradient(135deg, #312E81 0%, #B8860B 30%, #FFD700 50%, #B8860B 70%, #312E81 100%)',
};

const RARITY_BORDER: Record<string, string> = {
  common: colors.border,
  rare: colors.accentCyan,
  epic: colors.primary,
  legendary: '#FFD700',
};

export default function ShareableCard({
  badgeIcon,
  badgeName,
  badgeDescription,
  rarity = 'common',
  playerName,
  level,
  day,
  netWorth,
  badgeId,
  onClose,
}: ShareableCardProps): React.ReactElement {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareText = `🏆 I earned the "${badgeName}" badge in MoneyLife! Level ${level}${netWorth ? ` · Net Worth: ${(netWorth / 100).toLocaleString()}` : ''} #MoneyLife`;

    // Log the share
    api.share.log('badge', 'clipboard', badgeId, { badgeName, level, netWorth });

    // Try Web Share API first
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text: shareText, title: 'MoneyLife Achievement' });
        return;
      } catch {
        // User cancelled or API not available — fall through to clipboard
      }
    }

    // Fallback to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard failed silently
      }
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.container} onClick={e => e.stopPropagation()}>
        {/* Share card */}
        <div style={{
          ...styles.card,
          background: RARITY_GRADIENTS[rarity],
          border: `2px solid ${RARITY_BORDER[rarity]}`,
          boxShadow: rarity === 'legendary'
            ? `0 0 30px rgba(255, 215, 0, 0.4), ${shadows.elevated}`
            : rarity === 'epic'
              ? `0 0 20px rgba(99, 102, 241, 0.4), ${shadows.elevated}`
              : shadows.elevated,
        }}>
          {/* Badge */}
          <div style={{
            fontSize: 64,
            textAlign: 'center',
            marginBottom: 8,
            animation: rarity === 'legendary' ? 'float 2s ease-in-out infinite' : undefined,
            filter: rarity === 'legendary' ? 'drop-shadow(0 0 12px rgba(255, 215, 0, 0.6))' : undefined,
          }}>
            {badgeIcon}
          </div>

          {/* Badge name */}
          <h2 style={{
            margin: '0 0 4px',
            fontSize: 20,
            fontWeight: 800,
            color: rarity === 'legendary' ? colors.accentGold : colors.textPrimary,
            textAlign: 'center',
            textShadow: rarity === 'legendary' ? '0 0 10px rgba(252, 211, 77, 0.5)' : undefined,
          }}>
            {badgeName}
          </h2>

          {/* Description */}
          {badgeDescription && (
            <p style={{ margin: '0 0 16px', fontSize: 13, color: colors.textSecondary, textAlign: 'center' }}>
              {badgeDescription}
            </p>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: `${colors.border}80`, margin: '0 -16px 12px' }} />

          {/* Player info */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 13 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, color: colors.textMuted, fontSize: 11 }}>Player</p>
              <p style={{ margin: '2px 0 0', fontWeight: 700, color: colors.textPrimary }}>{playerName}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, color: colors.textMuted, fontSize: 11 }}>Level</p>
              <p style={{ margin: '2px 0 0', fontWeight: 700, color: colors.accentCyan }}>{level}</p>
            </div>
            {day && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, color: colors.textMuted, fontSize: 11 }}>Day</p>
                <p style={{ margin: '2px 0 0', fontWeight: 700, color: colors.textPrimary }}>{day}</p>
              </div>
            )}
            {netWorth !== undefined && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, color: colors.textMuted, fontSize: 11 }}>Net Worth</p>
                <p style={{ margin: '2px 0 0', fontWeight: 700, color: colors.success }}>
                  {(netWorth / 100).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Branding */}
          <div style={{
            textAlign: 'center',
            marginTop: 16,
            padding: '8px 0 0',
            borderTop: `1px solid ${colors.border}40`,
          }}>
            <span style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600 }}>
              🎮 {t('shareCard.playMoneyLife')}
            </span>
          </div>
        </div>

        {/* Share button */}
        <button onClick={handleShare} style={styles.shareBtn}>
          {copied ? `✅ ${t('shareCard.copied')}` : `📤 ${t('shareCard.share')}`}
        </button>

        {/* Close */}
        {onClose && (
          <button onClick={onClose} style={styles.closeBtn}>
            {t('common.close')}
          </button>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    animation: 'fadeIn 0.3s ease',
    padding: 20,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    maxWidth: 340,
    width: '100%',
    animation: 'celebrateZoomIn 0.4s ease',
  },
  card: {
    borderRadius: radius.xl,
    padding: '28px 24px 20px',
    width: '100%',
  },
  shareBtn: {
    width: '100%',
    padding: '14px 24px',
    borderRadius: radius.md,
    background: colors.primaryGradient,
    color: '#FFF',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 700,
    minHeight: 48,
  },
  closeBtn: {
    padding: '8px 20px',
    borderRadius: radius.md,
    background: 'transparent',
    color: colors.textMuted,
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
  },
};

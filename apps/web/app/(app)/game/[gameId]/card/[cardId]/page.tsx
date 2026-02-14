'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useT } from '../../../../../../src/lib/useT';
import { useAuth } from '../../../../../../src/lib/auth-context';
import { api, type PendingCard, type GameResponse } from '../../../../../../src/lib/api';
import { colors, radius, shadows } from '../../../../../../src/lib/design-tokens';
import { CardHintButton } from '../../../../../../src/components/AIAdvisor';
import { useIsMobile } from '../../../../../../src/hooks/useIsMobile';
import { useToast } from '../../../../../../src/components/Toast';

const CATEGORY_STYLES: Record<string, { icon: string; color: string }> = {
  housing:       { icon: '🏠', color: '#7C3AED' },
  health:        { icon: '💊', color: '#059669' },
  career:        { icon: '💼', color: '#7C3AED' },
  emergency:     { icon: '🚨', color: '#EF4444' },
  investment:    { icon: '📈', color: '#059669' },
  insurance:     { icon: '🛡️', color: '#0891B2' },
  social:        { icon: '👥', color: '#F59E0B' },
  education:     { icon: '📚', color: '#7C3AED' },
  transport:     { icon: '🚗', color: '#6B7280' },
  food:          { icon: '🍽️', color: '#EA580C' },
  entertainment: { icon: '🎬', color: '#DB2777' },
  shopping:      { icon: '🛍️', color: '#EC4899' },
  savings:       { icon: '💰', color: '#2563EB' },
};

function getEffectLabel(effect: { type: string; amount?: number; label?: string }): string {
  if (effect.label) return effect.label;
  const sign = (effect.amount ?? 0) >= 0 ? '+' : '';
  switch (effect.type) {
    case 'balance': return `💰 ${sign}RON ${(Math.abs(effect.amount ?? 0) / 100).toFixed(0)}`;
    case 'xp': return `⭐ ${sign}${effect.amount} XP`;
    case 'happiness': return `😊 ${sign}${effect.amount}`;
    case 'credit': return `📊 ${sign}${effect.amount}`;
    case 'coins': return `🪙 ${sign}${effect.amount}`;
    default: return effect.label || effect.type;
  }
}

function getEffectPillStyle(effect: { type: string; amount?: number }): React.CSSProperties {
  let bg: string;
  let color: string;
  let border: string;
  if (effect.type === 'balance') {
    const isPositive = (effect.amount ?? 0) >= 0;
    color = isPositive ? '#34D399' : '#FB7185';
    bg = isPositive ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 113, 133, 0.15)';
    border = isPositive ? 'rgba(52, 211, 153, 0.3)' : 'rgba(251, 113, 133, 0.3)';
  } else if (effect.type === 'xp') {
    color = '#22D3EE';
    bg = 'rgba(34, 211, 238, 0.15)';
    border = 'rgba(34, 211, 238, 0.3)';
  } else if (effect.type === 'coins') {
    color = '#FCD34D';
    bg = 'rgba(252, 211, 77, 0.15)';
    border = 'rgba(252, 211, 77, 0.3)';
  } else if (effect.type === 'happiness') {
    color = '#F472B6';
    bg = 'rgba(244, 114, 182, 0.15)';
    border = 'rgba(244, 114, 182, 0.3)';
  } else {
    color = '#A5A0C8';
    bg = 'rgba(165, 160, 200, 0.1)';
    border = 'rgba(165, 160, 200, 0.2)';
  }
  return {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: radius.pill,
    backgroundColor: bg,
    fontSize: 12,
    fontWeight: 600,
    color,
    border: `1px solid ${border}`,
  };
}

function getEffectColor(effect: { type: string; amount?: number }): string {
  if (effect.type === 'balance') return (effect.amount ?? 0) >= 0 ? '#34D399' : '#FB7185';
  if (effect.type === 'xp') return '#22D3EE';
  if (effect.type === 'happiness') return '#F472B6';
  if (effect.type === 'coins') return '#FCD34D';
  return '#A5A0C8';
}

const shimmerStyle: React.CSSProperties = {
  background: `linear-gradient(90deg, ${colors.borderLight} 25%, ${colors.border} 50%, ${colors.borderLight} 75%)`,
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
};

function SkeletonCard() {
  return (
    <div style={s.page}>
      <div style={s.headerBar}>
        <div style={{ width: 44, height: 44, borderRadius: radius.sm, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ width: 120, height: 20, borderRadius: 4, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ width: 44 }} />
      </div>
      <div style={{ padding: 20 }}>
        <div style={{ ...shimmerStyle, width: 100, height: 28, borderRadius: radius.pill, marginBottom: 16 }} />
        <div style={{ padding: 20, borderRadius: radius.lg, background: colors.surface, boxShadow: shadows.card, marginBottom: 20 }}>
          <div style={{ ...shimmerStyle, width: '100%', height: 16, borderRadius: 4, marginBottom: 8 }} />
          <div style={{ ...shimmerStyle, width: '70%', height: 16, borderRadius: 4 }} />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ ...shimmerStyle, width: '100%', height: 80, borderRadius: radius.md, marginBottom: 10 }} />
        ))}
      </div>
    </div>
  );
}

export default function CardPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useT();
  const isMobile = useIsMobile();
  const { showToast } = useToast();
  const gameId = params.gameId as string;
  const cardId = params.cardId as string;

  const [card, setCard] = useState<PendingCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [outcome, setOutcome] = useState<{ label: string; effects: { type: string; amount?: number; label?: string }[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalCoins, setTotalCoins] = useState(0);

  const fetchCard = useCallback(async () => {
    const [cardsRes, gameRes] = await Promise.all([
      api.game.getCards(gameId),
      api.game.get(gameId),
    ]);
    if (cardsRes.ok && cardsRes.data) {
      const found = cardsRes.data.find((c: PendingCard) => c.id === cardId);
      if (found) setCard(found);
      else setError(t('game.cardNotFound'));
    } else {
      setError(cardsRes.error || 'Failed to load card');
    }
    if (gameRes.ok && gameRes.data) {
      setTotalCoins(gameRes.data.totalCoins ?? 0);
    } else {
      setError(gameRes.error || t('game.failedToLoadCard'));
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, cardId]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchCard();
  }, [user, authLoading, router, fetchCard]);

  const handleSubmit = async (): Promise<void> => {
    if (!selectedOption) return;
    setSubmitting(true);
    setError(null);
    const res = await api.game.submitAction(gameId, {
      type: 'decide_card',
      cardId,
      optionId: selectedOption,
    });
    setSubmitting(false);
    if (res.ok) {
      const chosen = card?.options?.find(o => o.id === selectedOption);
      setOutcome({ label: chosen?.label || t('game.decisionMade'), effects: chosen?.effects || [] });
      setConfirmed(true);
      showToast(t('game.decisionMade'), 'success');
      setTimeout(() => router.push(`/game/${gameId}`), 2500);
    } else {
      setError(res.error || t('game.failedToSubmit'));
    }
  };

  if (loading || authLoading) return <SkeletonCard />;
  if (!card) return (
    <div style={s.page}>
      <div style={s.headerBar}>
        <button onClick={() => router.push(`/game/${gameId}`)} style={s.headerBack}>←</button>
        <span style={s.headerTitle}>{t('game.decision')}</span>
        <div style={{ width: 44 }} />
      </div>
      <div style={s.content}>
        <p style={{ color: colors.danger }}>{error || t('game.cardNotFound')}</p>
      </div>
    </div>
  );

  const catStyle = CATEGORY_STYLES[(card.category || '').toLowerCase()] || { icon: '📋', color: '#6366F1' };

  if (confirmed && outcome) {
    return (
      <div style={s.page}>
        <div style={s.headerBar} />
        <div style={{
          ...s.content,
          textAlign: 'center' as const,
          paddingTop: 60,
          animation: 'scaleIn 0.4s ease',
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F1F0FF', marginBottom: 8 }}>{t('game.decisionMade')}</h2>
          <p style={{ fontSize: 16, color: '#A5A0C8', marginBottom: 16 }}>{outcome.label}</p>
          {outcome.effects.length > 0 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' as const, marginBottom: 24 }}>
              {outcome.effects.map((eff, i) => (
                <span key={i} style={{
                  ...getEffectPillStyle(eff),
                  padding: '6px 14px',
                  fontSize: 14,
                  animation: `fadeIn 0.3s ease ${i * 0.1}s both`,
                }}>
                  {getEffectLabel(eff)}
                </span>
              ))}
            </div>
          )}
          <p style={{ fontSize: 14, color: '#6B6490' }}>{t('game.returningToGame')}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* Dark Header */}
      <div style={s.headerBar}>
        <button onClick={() => router.push(`/game/${gameId}`)} style={s.headerBack}>←</button>
        <span style={{ ...s.headerTitle, fontSize: isMobile ? 16 : 18 }}>{t('game.decision')}</span>
        <div style={{ width: 44 }} />
      </div>

      <div style={{ ...s.content, padding: isMobile ? 16 : 24 }}>
        {/* Category Emoji with glow */}
        <div style={{
          textAlign: 'center' as const,
          marginBottom: 20,
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80,
            height: 80,
            borderRadius: 40,
            background: `${catStyle.color}20`,
            boxShadow: `0 0 30px ${catStyle.color}40, 0 0 60px ${catStyle.color}20`,
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 48, lineHeight: 1 }}>{catStyle.icon}</span>
          </div>
          {/* Category pill */}
          <div style={{ marginBottom: 12 }}>
            <span style={{
              display: 'inline-block',
              padding: '5px 14px',
              borderRadius: radius.pill,
              backgroundColor: `${catStyle.color}20`,
              color: catStyle.color,
              fontSize: 12,
              fontWeight: 600,
              border: `1px solid ${catStyle.color}30`,
              textTransform: 'uppercase' as const,
              letterSpacing: 0.5,
            }}>
              {card.category}
            </span>
          </div>
          {/* Card title */}
          <h1 style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#F1F0FF',
            margin: '0 0 8px',
            lineHeight: 1.3,
          }}>
            {card.title}
          </h1>
        </div>

        {/* Description */}
        <div style={{
          padding: 16,
          borderRadius: radius.lg,
          background: '#211B3A',
          marginBottom: 20,
          animation: 'fadeIn 0.3s ease 0.1s both',
        }}>
          <p style={{ margin: 0, fontSize: 15, color: '#A5A0C8', lineHeight: 1.6, textAlign: 'center' as const }}>
            {card.description}
          </p>
        </div>

        {/* Separator */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, #2D254580, transparent)',
          marginBottom: 20,
        }} />

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
          {(card.options || []).map((opt, idx) => {
            const isSelected = selectedOption === opt.id;
            const isOther = selectedOption !== null && !isSelected;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                style={{
                  width: '100%',
                  padding: isMobile ? 16 : 18,
                  borderRadius: radius.lg,
                  border: isSelected
                    ? `2px solid #6366F1`
                    : `2px solid #2D2545`,
                  background: '#211B3A',
                  cursor: 'pointer',
                  textAlign: 'left' as const,
                  minHeight: 44,
                  transition: 'all 0.25s ease',
                  transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                  opacity: isOther ? 0.5 : 1,
                  boxShadow: isSelected
                    ? '0 0 20px rgba(99, 102, 241, 0.4), 0 8px 32px rgba(0, 0, 0, 0.4)'
                    : '0 2px 12px rgba(0, 0, 0, 0.3)',
                  borderLeft: isSelected
                    ? `4px solid ${catStyle.color}`
                    : `4px solid ${catStyle.color}60`,
                  animation: `fadeIn 0.3s ease ${0.15 + idx * 0.05}s both`,
                  position: 'relative' as const,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: '#F1F0FF' }}>{opt.label}</p>
                    {opt.description && (
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: '#A5A0C8', lineHeight: 1.5 }}>{opt.description}</p>
                    )}
                    {opt.effects && opt.effects.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' as const }}>
                        {opt.effects.map((eff, i) => (
                          <span key={i} style={getEffectPillStyle(eff)}>
                            {getEffectLabel(eff)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      background: '#6366F1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}>
                      <span style={{ color: '#FFF', fontSize: 14, fontWeight: 700 }}>✓</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* AI Hint Button */}
        <div style={{ marginTop: 16 }}>
          <CardHintButton gameId={gameId} cardId={cardId} totalCoins={totalCoins} />
        </div>

        {error && <p style={{ color: '#FB7185', marginTop: 12, fontSize: 14 }}>{error}</p>}

        {/* Confirm Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedOption || submitting}
          style={{
            width: '100%',
            height: 56,
            borderRadius: radius.lg,
            background: selectedOption && !submitting
              ? 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #818CF8 100%)'
              : '#2D2545',
            color: selectedOption && !submitting ? '#FFF' : '#6B6490',
            fontSize: 17,
            fontWeight: 700,
            border: 'none',
            cursor: selectedOption && !submitting ? 'pointer' : 'not-allowed',
            marginTop: 24,
            transition: 'all 0.3s ease',
            boxShadow: selectedOption && !submitting
              ? '0 0 20px rgba(99, 102, 241, 0.4), 0 8px 32px rgba(0, 0, 0, 0.3)'
              : 'none',
            letterSpacing: 0.5,
          }}
        >
          {submitting ? t('game.submitting') : `✅ ${t('game.confirmDecision')}`}
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: '#0F0B1E' },
  headerBar: {
    background: '#211B3A',
    padding: '16px 20px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #2D2545',
  },
  headerBack: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    border: '1px solid #2D2545',
    background: '#2D2545',
    color: '#F1F0FF',
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: 700, color: '#F1F0FF' },
  content: { padding: 20 },
};

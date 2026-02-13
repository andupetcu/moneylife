'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../../../src/lib/auth-context';
import { api, type PendingCard, type GameResponse } from '../../../../../../src/lib/api';
import { colors, radius, shadows } from '../../../../../../src/lib/design-tokens';
import { CardHintButton } from '../../../../../../src/components/AIAdvisor';

const CATEGORY_STYLES: Record<string, { icon: string; color: string; bg: string }> = {
  housing: { icon: '🏠', color: '#7C3AED', bg: '#F5F3FF' },
  health: { icon: '🏥', color: '#059669', bg: '#ECFDF5' },
  career: { icon: '💼', color: '#2563EB', bg: '#EFF6FF' },
  emergency: { icon: '🚨', color: '#DC2626', bg: '#FEF2F2' },
  investment: { icon: '📈', color: '#059669', bg: '#ECFDF5' },
  insurance: { icon: '🛡️', color: '#0891B2', bg: '#ECFEFF' },
  social: { icon: '👥', color: '#D97706', bg: '#FFFBEB' },
  education: { icon: '📚', color: '#7C3AED', bg: '#F5F3FF' },
  transport: { icon: '🚗', color: '#6B7280', bg: '#F9FAFB' },
  food: { icon: '🍽️', color: '#EA580C', bg: '#FFF7ED' },
  entertainment: { icon: '🎭', color: '#DB2777', bg: '#FDF2F8' },
};

function getEffectLabel(effect: { type: string; amount?: number; label?: string }): string {
  if (effect.label) return effect.label;
  const sign = (effect.amount ?? 0) >= 0 ? '+' : '';
  switch (effect.type) {
    case 'balance': return `${sign}$${((effect.amount ?? 0) / 100).toFixed(0)}`;
    case 'xp': return `${sign}${effect.amount} XP`;
    case 'happiness': return `😊 ${sign}${effect.amount}`;
    case 'credit': return `📊 ${sign}${effect.amount}`;
    default: return effect.label || effect.type;
  }
}

function getEffectColor(effect: { type: string; amount?: number }): string {
  if (effect.type === 'balance') return (effect.amount ?? 0) >= 0 ? colors.success : colors.danger;
  if (effect.type === 'xp') return colors.primary;
  if (effect.type === 'happiness') return colors.warning;
  return colors.textSecondary;
}

export default function CardPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const gameId = params.gameId as string;
  const cardId = params.cardId as string;

  const [card, setCard] = useState<PendingCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [outcome, setOutcome] = useState<string | null>(null);
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
      setTotalCoins((gameRes.data as GameResponse & { coins?: number }).coins ?? (gameRes.data as any).totalCoins ?? 0);
      setError(res.error || t('game.failedToLoadCard'));
    }
    setLoading(false);
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
      setOutcome(chosen?.label || t('game.decisionMade'));
      setConfirmed(true);
      setTimeout(() => router.push(`/game/${gameId}`), 2500);
    } else {
      setError(res.error || t('game.failedToSubmit'));
    }
  };

  if (loading || authLoading) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>{t('common.loading')}</p></div>;
  if (!card) return (
    <div style={s.page}>
      <div style={s.headerBar}>
        <button onClick={() => router.push(`/game/${gameId}`)} style={s.headerBack}>←</button>
        <span style={s.headerTitle}>{t('game.decision')}</span>
        <div style={{ width: 32 }} />
      </div>
      <div style={s.content}>
        <p style={{ color: colors.danger }}>{error || t('game.cardNotFound')}</p>
      </div>
    </div>
  );

  const catStyle = CATEGORY_STYLES[(card.category || '').toLowerCase()] || { icon: '📋', color: colors.primary, bg: '#EEF2FF' };

  if (confirmed && outcome) {
    return (
      <div style={s.page}>
        <div style={s.headerBar} />
        <div style={{ ...s.content, textAlign: 'center' as const, paddingTop: 60 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: colors.textPrimary, marginBottom: 8 }}>{t('game.decisionMade')}</h2>
          <p style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 24 }}>{outcome}</p>
          <p style={{ fontSize: 14, color: colors.textMuted }}>{t('game.returningToGame')}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* Purple Header */}
      <div style={s.headerBar}>
        <button onClick={() => router.push(`/game/${gameId}`)} style={s.headerBack}>←</button>
        <span style={s.headerTitle}>{card.title}</span>
        <div style={{ width: 32 }} />
      </div>

      <div style={s.content}>
        {/* Category Badge */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: radius.pill, backgroundColor: catStyle.bg, color: catStyle.color, fontSize: 13, fontWeight: 600 }}>
            {catStyle.icon} {card.category}
          </span>
        </div>

        {/* Description Card */}
        <div style={s.descCard}>
          <p style={{ margin: 0, fontSize: 15, color: colors.textSecondary, lineHeight: 1.6 }}>{card.description}</p>
        </div>

        {/* AI Hint Button */}
        <CardHintButton gameId={gameId} cardId={cardId} totalCoins={totalCoins} />

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
          {(card.options || []).map((opt, idx) => {
            const isSelected = selectedOption === opt.id;
            const isPrimary = idx === 0;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                style={{
                  width: '100%',
                  padding: 16,
                  borderRadius: radius.md,
                  border: isSelected ? `2px solid ${colors.primary}` : `2px solid ${colors.border}`,
                  background: isSelected ? '#EEF2FF' : (isPrimary ? colors.surface : colors.surface),
                  cursor: 'pointer',
                  textAlign: 'left' as const,
                }}
              >
                <p style={{ margin: 0, fontWeight: 600, color: colors.textPrimary }}>{opt.label}</p>
                {opt.description && <p style={{ margin: '4px 0 0', fontSize: 13, color: colors.textSecondary }}>{opt.description}</p>}
                {opt.effects && opt.effects.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' as const }}>
                    {opt.effects.map((eff, i) => (
                      <span key={i} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, backgroundColor: colors.inputBg, fontSize: 12, fontWeight: 600, color: getEffectColor(eff) }}>
                        {getEffectLabel(eff)}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {error && <p style={{ color: colors.danger, marginTop: 12, fontSize: 14 }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!selectedOption || submitting}
          style={{ ...s.primaryBtn, marginTop: 24, opacity: !selectedOption || submitting ? 0.5 : 1 }}
        >
          {submitting ? t('game.submitting') : `✅ ${t('game.confirmDecision')}`}
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: colors.background },
  headerBar: { background: colors.primaryGradient, padding: '16px 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  headerBack: { width: 32, height: 32, borderRadius: radius.sm, border: 'none', background: 'rgba(255,255,255,0.2)', color: '#FFF', fontSize: 16, cursor: 'pointer' },
  headerTitle: { fontSize: 18, fontWeight: 700, color: '#FFF' },
  content: { padding: 20 },
  descCard: { padding: 20, borderRadius: radius.lg, background: colors.surface, boxShadow: shadows.card, marginBottom: 20 },
  primaryBtn: { width: '100%', height: 52, borderRadius: radius.md, background: colors.primaryGradient, color: '#FFF', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer' },
};

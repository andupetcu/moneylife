'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../../src/lib/auth-context';
import { api, type PendingCard } from '../../../../../../src/lib/api';

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
  if (effect.type === 'balance') return (effect.amount ?? 0) >= 0 ? '#10B981' : '#EF4444';
  if (effect.type === 'xp') return '#2563EB';
  if (effect.type === 'happiness') return '#F59E0B';
  return '#6B7280';
}

export default function CardPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const gameId = params.gameId as string;
  const cardId = params.cardId as string;

  const [card, setCard] = useState<PendingCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCard = useCallback(async () => {
    const res = await api.game.getCards(gameId);
    if (res.ok && res.data) {
      const found = res.data.find((c: PendingCard) => c.id === cardId);
      if (found) setCard(found);
      else setError('Card not found');
    } else {
      setError(res.error || 'Failed to load card');
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
      setOutcome(chosen?.label || 'Decision made!');
      setConfirmed(true);
      setTimeout(() => router.push(`/game/${gameId}`), 2500);
    } else {
      setError(res.error || 'Failed to submit decision');
    }
  };

  if (loading || authLoading) return <div style={s.container}><p style={s.muted}>Loading...</p></div>;
  if (!card) return (
    <div style={s.container}>
      <p style={{ color: '#EF4444' }}>{error || 'Card not found'}</p>
      <button onClick={() => router.push(`/game/${gameId}`)} style={s.backBtn}>← Back to Game</button>
    </div>
  );

  const catStyle = CATEGORY_STYLES[(card.category || '').toLowerCase()] || { icon: '📋', color: '#2563EB', bg: '#EFF6FF' };

  if (confirmed && outcome) {
    return (
      <div style={{ ...s.container, textAlign: 'center' as const, paddingTop: 80 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Decision Made!</h2>
        <p style={{ fontSize: 16, color: '#6B7280', marginBottom: 24 }}>{outcome}</p>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>Returning to game...</p>
      </div>
    );
  }

  return (
    <div style={s.container}>
      <button onClick={() => router.push(`/game/${gameId}`)} style={s.backBtn}>← Back to Game</button>

      <div style={{ ...s.cardBox, borderColor: catStyle.color }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ ...s.categoryBadge, backgroundColor: catStyle.bg, color: catStyle.color }}>
            {catStyle.icon} {card.category}
          </span>
        </div>

        <h1 style={s.title}>{card.title}</h1>
        <p style={s.desc}>{card.description}</p>

        <div style={s.optionsContainer}>
          {(card.options || []).map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelectedOption(opt.id)}
              style={{
                ...s.optionBtn,
                borderColor: selectedOption === opt.id ? catStyle.color : '#E5E7EB',
                backgroundColor: selectedOption === opt.id ? catStyle.bg : '#FFF',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{opt.label}</p>
              {opt.description && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>{opt.description}</p>}
              {opt.effects && opt.effects.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' as const }}>
                  {opt.effects.map((eff, i) => (
                    <span key={i} style={{ ...s.effectTag, color: getEffectColor(eff) }}>
                      {getEffectLabel(eff)}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>

        {error && <p style={{ color: '#EF4444', marginTop: 12 }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!selectedOption || submitting}
          style={{ ...s.submitBtn, opacity: !selectedOption || submitting ? 0.5 : 1, backgroundColor: catStyle.color }}
        >
          {submitting ? 'Submitting...' : '✅ Confirm Decision'}
        </button>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  container: { maxWidth: 600, margin: '40px auto', padding: 24 },
  muted: { color: '#9CA3AF' },
  backBtn: { padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', color: '#6B7280', fontSize: 14, marginBottom: 24, display: 'inline-block', textDecoration: 'none' },
  cardBox: { padding: 28, border: '2px solid', borderRadius: 16, background: '#FAFAFA' },
  categoryBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  title: { fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 8px' },
  desc: { fontSize: 15, color: '#6B7280', lineHeight: 1.6, margin: '0 0 24px' },
  optionsContainer: { display: 'flex', flexDirection: 'column' as const, gap: 10 },
  optionBtn: { padding: 16, borderRadius: 12, border: '2px solid', cursor: 'pointer', textAlign: 'left' as const, background: '#FFF', transition: 'all 0.15s' },
  effectTag: { display: 'inline-block', padding: '2px 8px', borderRadius: 6, backgroundColor: '#F9FAFB', fontSize: 12, fontWeight: 600 },
  submitBtn: { marginTop: 24, width: '100%', padding: '14px 28px', borderRadius: 12, color: '#FFF', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer' },
};

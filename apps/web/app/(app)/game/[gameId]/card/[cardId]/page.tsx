'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../../src/lib/auth-context';
import { api, type PendingCard } from '../../../../../../src/lib/api';

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
  const [error, setError] = useState<string | null>(null);

  const fetchCard = useCallback(async () => {
    const res = await api.game.getCards(gameId);
    if (res.ok && res.data) {
      const found = res.data.find(c => c.id === cardId);
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
      router.push(`/game/${gameId}`);
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

  return (
    <div style={s.container}>
      <button onClick={() => router.push(`/game/${gameId}`)} style={s.backBtn}>← Back to Game</button>

      <div style={s.cardBox}>
        <span style={s.category}>{card.category}</span>
        <h1 style={s.title}>{card.title}</h1>
        <p style={s.desc}>{card.description}</p>

        <div style={s.optionsContainer}>
          {card.options.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSelectedOption(opt.id)}
              style={{
                ...s.optionBtn,
                borderColor: selectedOption === opt.id ? '#2563EB' : '#E5E7EB',
                backgroundColor: selectedOption === opt.id ? '#EFF6FF' : '#FFF',
              }}
            >
              <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{opt.label}</p>
              {opt.description && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>{opt.description}</p>}
            </button>
          ))}
        </div>

        {error && <p style={{ color: '#EF4444', marginTop: 12 }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!selectedOption || submitting}
          style={{ ...s.submitBtn, opacity: !selectedOption || submitting ? 0.5 : 1 }}
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
  backBtn: { padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', color: '#6B7280', fontSize: 14, marginBottom: 24, display: 'inline-block' },
  cardBox: { padding: 28, border: '2px solid #2563EB', borderRadius: 16, background: '#FAFAFA' },
  category: { display: 'inline-block', padding: '4px 12px', borderRadius: 20, backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: 13, fontWeight: 600, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 8px' },
  desc: { fontSize: 15, color: '#6B7280', lineHeight: 1.6, margin: '0 0 24px' },
  optionsContainer: { display: 'flex', flexDirection: 'column' as const, gap: 10 },
  optionBtn: { padding: 16, borderRadius: 12, border: '2px solid', cursor: 'pointer', textAlign: 'left' as const, background: '#FFF', transition: 'all 0.15s' },
  submitBtn: { marginTop: 24, width: '100%', padding: '14px 28px', borderRadius: 12, backgroundColor: '#2563EB', color: '#FFF', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer' },
};

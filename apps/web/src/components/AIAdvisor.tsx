'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../lib/api';
import { colors, radius, shadows } from '../lib/design-tokens';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAdvisorProps {
  gameId: string;
}

export default function AIAdvisor({ gameId }: AIAdvisorProps): React.ReactElement | null {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [remainingCalls, setRemainingCalls] = useState(10);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dailySummary, setDailySummary] = useState<string | null>(null);
  const [dailyLoading, setDailyLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check AI availability on mount
  useEffect(() => {
    api.ai.getStatus(gameId).then(res => {
      if (res.ok && res.data) {
        setAvailable(res.data.available);
        setRemainingCalls(res.data.remainingCalls);
      } else {
        setAvailable(false);
      }
    });
  }, [gameId]);

  // Load daily summary when panel opens
  const loadDailySummary = useCallback(async () => {
    if (dailySummary || dailyLoading) return;
    setDailyLoading(true);
    const res = await api.ai.getDailySummary(gameId);
    if (res.ok && res.data) {
      setDailySummary(res.data.summary);
      setRemainingCalls(res.data.remainingCalls);
    }
    setDailyLoading(false);
  }, [gameId, dailySummary, dailyLoading]);

  useEffect(() => {
    if (open && !dailySummary && !dailyLoading) {
      loadDailySummary();
    }
  }, [open, dailySummary, dailyLoading, loadDailySummary]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    const res = await api.ai.getAdvice(gameId, q);
    if (res.ok && res.data) {
      setMessages(prev => [...prev, { role: 'assistant', content: res.data!.advice }]);
      setRemainingCalls(res.data.remainingCalls);
    } else {
      setMessages(prev => [...prev, { role: 'assistant', content: res.error || 'Sorry, I couldn\'t process that request.' }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Don't render anything if AI is not available
  if (available === false) return null;
  // Still loading status
  if (available === null) return null;

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button onClick={() => setOpen(true)} style={styles.fab}>
          <span style={{ fontSize: 24 }}>🤖</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div style={styles.panel}>
          {/* Header */}
          <div style={styles.panelHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🤖</span>
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: '#FFF', fontSize: 15 }}>AI Financial Advisor</p>
                <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{remainingCalls} calls remaining today</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={styles.closeBtn}>✕</button>
          </div>

          {/* Messages area */}
          <div style={styles.messagesArea}>
            {/* Daily summary */}
            {dailyLoading && (
              <div style={styles.dailyCard}>
                <p style={{ margin: 0, fontSize: 13, color: colors.textMuted }}>Loading daily tip...</p>
              </div>
            )}
            {dailySummary && (
              <div style={styles.dailyCard}>
                <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: colors.primary, textTransform: 'uppercase' as const, letterSpacing: 1 }}>Daily Tip</p>
                <p style={{ margin: 0, fontSize: 13, color: colors.textSecondary, lineHeight: 1.5 }}>{dailySummary}</p>
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                <div style={msg.role === 'user' ? styles.userBubble : styles.aiBubble}>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' as const }}>{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 8 }}>
                <div style={styles.aiBubble}>
                  <p style={{ margin: 0, fontSize: 14, color: colors.textMuted }}>Thinking...</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div style={styles.inputArea}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your finances..."
              disabled={loading || remainingCalls <= 0}
              style={styles.input}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading || remainingCalls <= 0}
              style={{ ...styles.sendBtn, opacity: !input.trim() || loading ? 0.5 : 1 }}
            >
              ↑
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Card Hint Button (exported separately for the card decision page)
// ---------------------------------------------------------------------------

interface CardHintButtonProps {
  gameId: string;
  cardId: string;
  totalCoins: number;
}

export function CardHintButton({ gameId, cardId, totalCoins }: CardHintButtonProps): React.ReactElement | null {
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);

  const HINT_COST = 50;

  useEffect(() => {
    api.ai.getStatus(gameId).then(res => {
      if (res.ok && res.data) {
        setAvailable(res.data.available);
      } else {
        setAvailable(false);
      }
    });
  }, [gameId]);

  const handleGetHint = async () => {
    setLoading(true);
    setError(null);
    const res = await api.ai.getCardHint(gameId, cardId);
    if (res.ok && res.data) {
      setHint(res.data.hint);
    } else {
      setError(res.error || 'Failed to get hint');
    }
    setLoading(false);
  };

  if (available === false || available === null) return null;

  if (hint) {
    return (
      <div style={hintStyles.hintCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 16 }}>🤖</span>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: colors.primary }}>AI Advisor Hint</p>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: colors.textSecondary, lineHeight: 1.6, whiteSpace: 'pre-wrap' as const }}>{hint}</p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={handleGetHint}
        disabled={loading || totalCoins < HINT_COST}
        style={{
          ...hintStyles.hintBtn,
          opacity: loading || totalCoins < HINT_COST ? 0.5 : 1,
        }}
      >
        {loading ? '🤖 Analyzing...' : `🤖 Get AI Hint (${HINT_COST} coins)`}
      </button>
      {totalCoins < HINT_COST && !loading && (
        <p style={{ margin: '4px 0 0', fontSize: 12, color: colors.textMuted, textAlign: 'center' as const }}>
          Need {HINT_COST} coins (you have {totalCoins})
        </p>
      )}
      {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: colors.danger, textAlign: 'center' as const }}>{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles: Record<string, React.CSSProperties> = {
  fab: {
    position: 'fixed',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    background: colors.primaryGradient,
    border: 'none',
    boxShadow: shadows.elevated,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  panel: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: '100%',
    maxWidth: 400,
    height: '70vh',
    maxHeight: 600,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 200,
    overflow: 'hidden',
  },
  panelHeader: {
    background: colors.primaryGradient,
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    border: 'none',
    background: 'rgba(255,255,255,0.2)',
    color: '#FFF',
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 16px 8px',
  },
  dailyCard: {
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: '#EEF2FF',
    border: `1px solid ${colors.primaryLight}30`,
    marginBottom: 16,
  },
  userBubble: {
    maxWidth: '80%',
    padding: '10px 14px',
    borderRadius: '16px 16px 4px 16px',
    background: colors.primaryGradient,
    color: '#FFF',
  },
  aiBubble: {
    maxWidth: '80%',
    padding: '10px 14px',
    borderRadius: '16px 16px 16px 4px',
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    boxShadow: shadows.card,
  },
  inputArea: {
    padding: '12px 16px',
    borderTop: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: radius.pill,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.inputBg,
    fontSize: 14,
    outline: 'none',
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    background: colors.primaryGradient,
    border: 'none',
    color: '#FFF',
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};

const hintStyles: Record<string, React.CSSProperties> = {
  hintBtn: {
    width: '100%',
    padding: '12px 20px',
    borderRadius: radius.md,
    background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
    color: '#FFF',
    fontSize: 14,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
  },
  hintCard: {
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: '#F5F3FF',
    border: `1px solid ${colors.primaryLight}30`,
    marginBottom: 16,
  },
};

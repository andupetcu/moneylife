'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useT } from '../../../src/lib/useT';
import { useAuth } from '../../../src/lib/auth-context';
import { api, type Challenge, type Friend, type GameResponse } from '../../../src/lib/api';
import { colors, radius, shadows } from '../../../src/lib/design-tokens';
import { useIsMobile } from '../../../src/hooks/useIsMobile';

const CHALLENGE_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  savings_rate: { label: 'social.savingsRate', icon: '💰' },
  net_worth_growth: { label: 'social.netWorthGrowth', icon: '📈' },
  xp_earned: { label: 'social.xpEarned', icon: '⚡' },
};

const STATUS_COLORS: Record<string, string> = {
  pending: colors.warning,
  active: colors.accentCyan,
  completed: colors.success,
  declined: colors.textMuted,
  expired: colors.textMuted,
};

export default function ChallengesPage(): React.ReactElement {
  const t = useT();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [gameId, setGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ opponentId: '', challengeType: 'savings_rate', durationDays: 7 });
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    const [challRes, friendsRes, gamesRes] = await Promise.all([
      api.social.listChallenges(),
      api.social.listFriends(),
      api.game.list(),
    ]);
    if (challRes.ok && challRes.data) setChallenges(challRes.data.challenges);
    if (friendsRes.ok && friendsRes.data) setFriends(friendsRes.data.friends);
    if (gamesRes.ok && gamesRes.data) {
      const games = gamesRes.data as unknown as GameResponse[];
      const active = games.find((g: GameResponse) => g.status === 'active');
      if (active) setGameId(active.id);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!gameId || !createForm.opponentId) return;
    setCreating(true);
    const res = await api.social.createChallenge(createForm.opponentId, gameId, createForm.challengeType, createForm.durationDays);
    if (res.ok) {
      setMessage(t('social.challengeCreated'));
      setShowCreate(false);
      setCreateForm({ opponentId: '', challengeType: 'savings_rate', durationDays: 7 });
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    }
    setCreating(false);
  };

  const handleAccept = async (id: string) => {
    if (!gameId) return;
    const res = await api.social.acceptChallenge(id, gameId);
    if (res.ok) fetchData();
  };

  const handleDecline = async (id: string) => {
    const res = await api.social.declineChallenge(id);
    if (res.ok) fetchData();
  };

  const pending = challenges.filter(c => c.status === 'pending' && !c.isChallenger);
  const active = challenges.filter(c => c.status === 'active');
  const myPending = challenges.filter(c => c.status === 'pending' && c.isChallenger);
  const completed = challenges.filter(c => c.status === 'completed' || c.status === 'declined');

  if (authLoading || loading) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>{t('common.loading')}</p></div>;
  if (!user) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>Redirecting...</p></div>;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#FFF', margin: 0 }}>
              ⚔️ {t('social.challenges')}
            </h1>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} style={s.createBtn}>
            + {t('social.challengeFriend')}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '16px 16px 100px' : '24px 24px 100px' }}>
        {/* Message */}
        {message && (
          <div style={{ padding: '12px 16px', borderRadius: radius.sm, background: 'rgba(52, 211, 153, 0.15)', color: colors.success, marginBottom: 16, fontSize: 14, fontWeight: 600, border: `1px solid ${colors.success}`, animation: 'fadeIn 0.3s ease' }}>
            {message}
          </div>
        )}

        {/* Create challenge form */}
        {showCreate && (
          <div style={{ ...s.card, marginBottom: 20, animation: 'slideDown 0.3s ease' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>
              {t('social.challengeFriend')}
            </h3>

            <label style={s.label}>{t('social.selectFriend')}</label>
            <select
              value={createForm.opponentId}
              onChange={e => setCreateForm(prev => ({ ...prev, opponentId: e.target.value }))}
              style={s.select}
            >
              <option value="">--</option>
              {friends.map(f => (
                <option key={f.userId} value={f.userId}>{f.displayName}</option>
              ))}
            </select>

            <label style={s.label}>{t('social.selectType')}</label>
            <select
              value={createForm.challengeType}
              onChange={e => setCreateForm(prev => ({ ...prev, challengeType: e.target.value }))}
              style={s.select}
            >
              {Object.entries(CHALLENGE_TYPE_LABELS).map(([key, val]) => (
                <option key={key} value={key}>{val.icon} {t(val.label)}</option>
              ))}
            </select>

            <label style={s.label}>{t('social.selectDuration')}</label>
            <select
              value={createForm.durationDays}
              onChange={e => setCreateForm(prev => ({ ...prev, durationDays: parseInt(e.target.value) }))}
              style={s.select}
            >
              {[3, 5, 7, 14, 30].map(d => (
                <option key={d} value={d}>{d} {t('social.days', { count: String(d) })}</option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => setShowCreate(false)} style={s.cancelBtn}>{t('common.cancel')}</button>
              <button
                onClick={handleCreate}
                disabled={creating || !createForm.opponentId || !gameId}
                style={{ ...s.confirmBtn, opacity: createForm.opponentId && gameId ? 1 : 0.4 }}
              >
                {creating ? '...' : '⚔️ ' + t('social.challengeFriend')}
              </button>
            </div>
          </div>
        )}

        {/* Incoming challenges */}
        {pending.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={s.sectionTitle}>📩 {t('social.pending')} ({pending.length})</h2>
            {pending.map(c => (
              <ChallengeCard key={c.id} challenge={c} userId={user!.id} t={t} isMobile={isMobile}
                onAccept={() => handleAccept(c.id)} onDecline={() => handleDecline(c.id)} />
            ))}
          </div>
        )}

        {/* Active challenges */}
        {active.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={s.sectionTitle}>🔥 {t('social.active')} ({active.length})</h2>
            {active.map(c => (
              <ChallengeCard key={c.id} challenge={c} userId={user!.id} t={t} isMobile={isMobile} />
            ))}
          </div>
        )}

        {/* My sent pending */}
        {myPending.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={s.sectionTitle}>📤 Sent ({myPending.length})</h2>
            {myPending.map(c => (
              <ChallengeCard key={c.id} challenge={c} userId={user!.id} t={t} isMobile={isMobile} />
            ))}
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={s.sectionTitle}>✅ {t('social.completed')} ({completed.length})</h2>
            {completed.slice(0, 10).map(c => (
              <ChallengeCard key={c.id} challenge={c} userId={user!.id} t={t} isMobile={isMobile} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {challenges.length === 0 && (
          <div style={{ ...s.card, textAlign: 'center', padding: 40 }}>
            <span style={{ fontSize: 48 }}>⚔️</span>
            <p style={{ color: colors.textSecondary, margin: '12px 0 0', fontSize: 16, fontWeight: 600 }}>
              {t('social.noChallengesYet')}
            </p>
            <button onClick={() => setShowCreate(true)} style={{ ...s.confirmBtn, marginTop: 16 }}>
              {t('social.challengeFriend')}
            </button>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={s.bottomNav}>
        {[
          { icon: '🏠', label: 'Home', href: '/dashboard' },
          { icon: '👥', label: 'Social', href: '/social' },
          { icon: '🏆', label: 'Leaderboard', href: '/leaderboard' },
          { icon: '🛒', label: 'Shop', href: '/shop' },
        ].map(navTab => (
          <Link
            key={navTab.href}
            href={navTab.href}
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              gap: 2,
              textDecoration: 'none',
              color: colors.textMuted,
              minWidth: 44,
              minHeight: 44,
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 22 }}>{navTab.icon}</span>
            {!isMobile && <span style={{ fontSize: 11 }}>{navTab.label}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

function ChallengeCard({ challenge: c, userId, t, isMobile, onAccept, onDecline }: {
  challenge: Challenge;
  userId: string;
  t: (key: string, params?: Record<string, unknown>) => string;
  isMobile: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  const typeConfig = CHALLENGE_TYPE_LABELS[c.challengeType] || { label: c.challengeType, icon: '🎯' };
  const opponentName = c.isChallenger ? c.opponentName : c.challengerName;
  const myScore = c.isChallenger ? c.challengerScore : c.opponentScore;
  const theirScore = c.isChallenger ? c.opponentScore : c.challengerScore;
  const totalScore = myScore + theirScore || 1;
  const myPercent = Math.round((myScore / totalScore) * 100);

  const isWinner = c.winnerId === userId;
  const isDraw = c.status === 'completed' && !c.winnerId;

  return (
    <div style={{
      background: colors.surface,
      borderRadius: radius.lg,
      padding: 16,
      marginBottom: 10,
      boxShadow: shadows.card,
      border: c.status === 'active'
        ? `1px solid ${colors.accentCyan}`
        : `1px solid ${colors.border}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>{typeConfig.icon}</span>
          <span style={{ fontWeight: 600, color: colors.textPrimary, fontSize: 14 }}>
            {t(typeConfig.label)}
          </span>
        </div>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: STATUS_COLORS[c.status],
          background: `${STATUS_COLORS[c.status]}20`,
          padding: '2px 8px',
          borderRadius: radius.pill,
        }}>
          {c.status === 'completed'
            ? (isWinner ? t('social.won') : isDraw ? t('social.draw') : t('social.lost'))
            : t(`social.${c.status}`)}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: c.status === 'active' ? 8 : 0 }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 13, color: colors.textSecondary }}>
            {t('social.vs')} <span style={{ fontWeight: 700, color: colors.textPrimary }}>{opponentName}</span>
          </p>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: colors.textMuted }}>
            {c.durationDays} days · {c.rewardXp} XP + {c.rewardCoins} coins
          </p>
        </div>
      </div>

      {/* Score progress bar for active challenges */}
      {c.status === 'active' && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: colors.accentCyan, fontWeight: 700 }}>You: {myScore}</span>
            <span style={{ color: colors.accentPink, fontWeight: 700 }}>{opponentName}: {theirScore}</span>
          </div>
          <div style={{ height: 8, background: colors.backgroundSecondary, borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
            <div style={{
              width: `${myPercent}%`,
              background: colors.accentCyan,
              borderRadius: 4,
              transition: 'width 0.5s ease',
            }} />
            <div style={{
              width: `${100 - myPercent}%`,
              background: colors.accentPink,
              borderRadius: 4,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      )}

      {/* Accept/Decline for pending incoming */}
      {c.status === 'pending' && !c.isChallenger && onAccept && onDecline && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={onAccept} style={{ ...cardStyles.acceptBtn, minHeight: 44 }}>
            {t('social.accept')}
          </button>
          <button onClick={onDecline} style={{ ...cardStyles.declineBtn, minHeight: 44 }}>
            {t('social.decline')}
          </button>
        </div>
      )}
    </div>
  );
}

const cardStyles: Record<string, React.CSSProperties> = {
  acceptBtn: {
    flex: 1,
    padding: '8px 16px',
    borderRadius: radius.md,
    background: colors.success,
    color: '#FFF',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
  },
  declineBtn: {
    flex: 1,
    padding: '8px 16px',
    borderRadius: radius.md,
    background: colors.backgroundSecondary,
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
};

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: colors.background },
  header: {
    background: colors.primaryGradient,
    padding: '40px 24px 28px',
    borderRadius: `0 0 ${radius.xl}px ${radius.xl}px`,
  },
  createBtn: {
    padding: '8px 16px',
    borderRadius: radius.pill,
    background: 'rgba(255,255,255,0.2)',
    color: '#FFF',
    border: '1px solid rgba(255,255,255,0.3)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    minHeight: 44,
  },
  card: {
    background: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    boxShadow: shadows.card,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: colors.textPrimary, marginBottom: 12 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: colors.textSecondary, marginBottom: 4, marginTop: 12 },
  select: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: radius.sm,
    border: `1px solid ${colors.border}`,
    background: colors.inputBg,
    color: colors.textPrimary,
    fontSize: 14,
    minHeight: 44,
  },
  cancelBtn: {
    flex: 1,
    padding: '10px 20px',
    borderRadius: radius.md,
    background: colors.backgroundSecondary,
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    minHeight: 44,
  },
  confirmBtn: {
    flex: 1,
    padding: '10px 20px',
    borderRadius: radius.md,
    background: colors.primaryGradient,
    color: '#FFF',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 700,
    minHeight: 44,
  },
  bottomNav: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    padding: '10px 0 14px',
    paddingBottom: 'env(safe-area-inset-bottom, 14px)',
    background: colors.surface,
    borderTop: `1px solid ${colors.border}`,
    backdropFilter: 'blur(12px)',
    zIndex: 50,
  },
};

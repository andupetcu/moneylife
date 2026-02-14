'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useT } from '../../../src/lib/useT';
import { useAuth } from '../../../src/lib/auth-context';
import { api, type LeaderboardEntry, type RankedEntry } from '../../../src/lib/api';
import { colors, radius } from '../../../src/lib/design-tokens';
import { useIsMobile } from '../../../src/hooks/useIsMobile';

type TabKey = 'networth' | 'xp-weekly' | 'streaks' | 'credit' | 'badges' | 'challenges';

interface UnifiedEntry {
  rank: number;
  userId: string;
  displayName: string;
  score: number;
  isYou: boolean;
}

const MEDALS = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];
const PODIUM_COLORS = [
  { bg: 'linear-gradient(180deg, #C0C0C0 0%, #808080 100%)', border: '#C0C0C0', glow: '0 0 12px rgba(192, 192, 192, 0.3)' },
  { bg: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)', border: '#FFD700', glow: '0 0 20px rgba(255, 215, 0, 0.4)' },
  { bg: 'linear-gradient(180deg, #CD7F32 0%, #8B4513 100%)', border: '#CD7F32', glow: '0 0 12px rgba(205, 127, 50, 0.3)' },
];

const TAB_CONFIG: { key: TabKey; labelKey: string; scoreLabel: string; icon: string }[] = [
  { key: 'networth', labelKey: 'social.netWorthTab', scoreLabel: 'Net Worth', icon: '💰' },
  { key: 'xp-weekly', labelKey: 'social.weeklyXpTab', scoreLabel: 'XP', icon: '⚡' },
  { key: 'streaks', labelKey: 'social.streaksTab', scoreLabel: 'Days', icon: '🔥' },
  { key: 'credit', labelKey: 'social.creditTab', scoreLabel: 'CHI', icon: '📊' },
  { key: 'badges', labelKey: 'social.badgesTab', scoreLabel: 'Badges', icon: '🏅' },
  { key: 'challenges', labelKey: 'social.challengesTab', scoreLabel: 'Done', icon: '✅' },
];

export default function LeaderboardPage(): React.ReactElement {
  const t = useT();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();

  const [tab, setTab] = useState<TabKey>('networth');
  const [entries, setEntries] = useState<UnifiedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState<number | null>(null);

  const fetchLeaderboard = useCallback(async (tabKey: TabKey) => {
    setLoading(true);
    setTab(tabKey);
    setMyRank(null);

    try {
      let unified: UnifiedEntry[] = [];

      if (tabKey === 'networth') {
        const res = await api.social.globalLeaderboard();
        if (res.ok && res.data) {
          unified = res.data.entries.map((e: LeaderboardEntry) => ({
            rank: e.rank,
            userId: e.userId,
            displayName: e.displayName,
            score: e.netWorth,
            isYou: e.userId === user?.id,
          }));
        }
      } else {
        const fetchers: Record<string, () => ReturnType<typeof api.social.weeklyXpLeaderboard>> = {
          'xp-weekly': api.social.weeklyXpLeaderboard,
          'streaks': api.social.streaksLeaderboard,
          'credit': api.social.creditLeaderboard,
          'badges': api.social.badgesLeaderboard,
          'challenges': api.social.challengesLeaderboard,
        };
        const res = await fetchers[tabKey]();
        if (res.ok && res.data) {
          unified = res.data.entries.map((e: RankedEntry) => ({
            rank: e.rank,
            userId: e.userId,
            displayName: e.displayName,
            score: e.score,
            isYou: e.isYou,
          }));
        }
      }

      setEntries(unified);
      const myEntry = unified.find(e => e.isYou);
      if (myEntry) setMyRank(myEntry.rank);
    } catch {
      setEntries([]);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchLeaderboard(tab);
  }, [user, authLoading]);

  const currentTabConfig = TAB_CONFIG.find(tc => tc.key === tab)!;

  const formatScore = (score: number) => {
    if (tab === 'networth') return `RON ${(score / 100).toLocaleString()}`;
    return score.toLocaleString();
  };

  if (authLoading) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>{t('common.loading')}</p></div>;
  if (!user) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>Redirecting...</p></div>;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
            {t('social.leaderboard')}
          </h1>
          <p style={{ fontSize: 14, color: colors.textSecondary, margin: '4px 0 0' }}>{t('social.rank')}</p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '16px 16px 100px' : '20px 24px 100px' }}>
        {/* Scrollable tab bar */}
        <div style={s.tabScroll}>
          <div style={s.tabRow}>
            {TAB_CONFIG.map(item => (
              <button
                key={item.key}
                onClick={() => fetchLeaderboard(item.key)}
                style={{
                  ...s.tabBtn,
                  ...(tab === item.key ? s.tabBtnActive : {}),
                  minHeight: 44,
                  fontSize: isMobile ? 11 : 12,
                  whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: 14 }}>{item.icon}</span>{' '}
                {t(item.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 40 }}>{t('common.loading')}</p>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <span style={{ fontSize: 48 }}>🏆</span>
            <p style={{ color: colors.textSecondary, margin: '12px 0 4px', fontSize: 16, fontWeight: 600 }}>
              {t('social.noLeaderboardData')}
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {entries.length >= 3 && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: isMobile ? 6 : 10,
                marginBottom: 24,
                padding: '0 8px',
              }}>
                {[entries[1], entries[0], entries[2]].map((e, idx) => {
                  const podiumOrder = [1, 0, 2];
                  const rank = podiumOrder[idx];
                  const heights = isMobile ? [80, 110, 64] : [100, 130, 80];
                  const avatarSizes = isMobile ? [44, 56, 40] : [48, 64, 44];
                  const podiumColor = PODIUM_COLORS[idx];
                  const isFirst = rank === 0;

                  return (
                    <div key={e.userId} style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{
                        width: avatarSizes[idx],
                        height: avatarSizes[idx],
                        borderRadius: avatarSizes[idx] / 2,
                        background: isFirst
                          ? 'linear-gradient(135deg, #312E81 0%, #4338CA 50%, #7C3AED 100%)'
                          : colors.primaryGradient,
                        color: '#FFF',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: isFirst ? (isMobile ? 20 : 24) : (isMobile ? 16 : 18),
                        border: `3px solid ${podiumColor.border}`,
                        boxShadow: podiumColor.glow,
                        margin: '0 auto',
                        animation: isFirst ? 'glowPulse 2s ease-in-out infinite' : undefined,
                      }}>
                        {e.displayName.charAt(0).toUpperCase()}
                      </div>
                      {isFirst && (
                        <div style={{ fontSize: 20, marginTop: -8, marginBottom: -4, position: 'relative' as const, zIndex: 2 }}>
                          👑
                        </div>
                      )}
                      <p style={{
                        margin: '6px 0 2px',
                        fontWeight: 600,
                        fontSize: isFirst ? (isMobile ? 13 : 15) : (isMobile ? 11 : 13),
                        color: colors.textPrimary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {e.displayName}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: colors.textMuted }}>
                        {formatScore(e.score)}
                      </p>
                      <div style={{
                        height: heights[idx],
                        background: podiumColor.bg,
                        borderRadius: `${radius.sm}px ${radius.sm}px 0 0`,
                        marginTop: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: podiumColor.glow,
                      }}>
                        <span style={{ fontSize: isMobile ? 22 : 28 }}>{MEDALS[rank]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            <div style={{ marginTop: 4 }}>
              {entries.map(entry => {
                const isMe = entry.isYou;
                return (
                  <div
                    key={entry.userId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: isMobile ? '10px 12px' : '14px 16px',
                      background: colors.surface,
                      borderRadius: radius.md,
                      marginBottom: 8,
                      boxShadow: isMe ? `${colors.glowPrimary}, 0 2px 12px rgba(0,0,0,0.3)` : '0 2px 12px rgba(0,0,0,0.3)',
                      border: isMe ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <div style={s.rankBadge}>
                      {entry.rank <= 3 ? (
                        <span style={{ fontSize: 20 }}>{MEDALS[entry.rank - 1]}</span>
                      ) : (
                        <span style={{ fontSize: 14, fontWeight: 700, color: colors.textMuted }}>{entry.rank}</span>
                      )}
                    </div>
                    <div style={{
                      width: isMobile ? 34 : 38,
                      height: isMobile ? 34 : 38,
                      borderRadius: isMobile ? 17 : 19,
                      background: isMe
                        ? 'linear-gradient(135deg, #312E81 0%, #4338CA 50%, #7C3AED 100%)'
                        : colors.primaryGradient,
                      color: '#FFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 16,
                      flexShrink: 0,
                    }}>
                      {entry.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: isMobile ? 13 : 14,
                        color: colors.textPrimary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {entry.displayName} {isMe && <span style={{ fontSize: 11, color: colors.primary }}>(You)</span>}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: isMobile ? 11 : 12, color: colors.textMuted }}>
                        {currentTabConfig.scoreLabel}
                      </p>
                    </div>
                    <p style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: isMobile ? 13 : 15,
                      color: colors.textPrimary,
                      whiteSpace: 'nowrap',
                    }}>
                      {formatScore(entry.score)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* "You are #X" footer if not in top 50 */}
            {myRank && myRank > 50 && (
              <div style={{
                textAlign: 'center',
                padding: '16px',
                background: colors.surface,
                borderRadius: radius.md,
                border: `1px solid ${colors.primary}`,
                marginTop: 12,
              }}>
                <p style={{ margin: 0, color: colors.primary, fontWeight: 700, fontSize: 16 }}>
                  You are #{myRank}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div style={s.bottomNav}>
        {[
          { icon: '🏠', label: 'Home', href: '/dashboard' },
          { icon: '👥', label: 'Social', href: '/social' },
          { icon: '🏆', label: 'Leaderboard', href: '/leaderboard', active: true },
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
              color: navTab.active ? colors.primary : colors.textMuted,
              minWidth: 44,
              minHeight: 44,
              justifyContent: 'center',
              ...(navTab.active ? { filter: 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.4))' } : {}),
            }}
          >
            <span style={{ fontSize: 22 }}>{navTab.icon}</span>
            {!isMobile && <span style={{ fontSize: 11, fontWeight: navTab.active ? 600 : 400 }}>{navTab.label}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: colors.background },
  header: {
    background: colors.surface,
    padding: '40px 24px 28px',
    borderBottom: `1px solid ${colors.border}`,
  },
  tabScroll: {
    overflowX: 'auto',
    marginBottom: 20,
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
  },
  tabRow: {
    display: 'flex',
    gap: 4,
    background: colors.backgroundSecondary,
    borderRadius: radius.pill,
    padding: 3,
    border: `1px solid ${colors.border}`,
    minWidth: 'max-content',
  },
  tabBtn: {
    padding: '8px 12px',
    borderRadius: radius.pill,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    background: 'transparent',
    color: colors.textMuted,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  tabBtnActive: {
    background: colors.border,
    color: colors.primary,
    boxShadow: '0 0 12px rgba(99, 102, 241, 0.2)',
  },
  rankBadge: { width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
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

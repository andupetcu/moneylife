'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useT } from '../../../src/lib/useT';
import { useAuth } from '../../../src/lib/auth-context';
import { api, type LeaderboardEntry } from '../../../src/lib/api';
import { colors, radius, shadows } from '../../../src/lib/design-tokens';
import { useIsMobile } from '../../../src/hooks/useIsMobile';

type TabKey = 'global' | 'friends' | 'level';

const MEDALS = ['🥇', '🥈', '🥉'];
const PODIUM_COLORS = [
  { bg: 'linear-gradient(180deg, #C0C0C0 0%, #808080 100%)', border: '#C0C0C0', glow: '0 0 12px rgba(192, 192, 192, 0.3)' },  // 2nd - silver
  { bg: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)', border: '#FFD700', glow: '0 0 20px rgba(255, 215, 0, 0.4)' },     // 1st - gold
  { bg: 'linear-gradient(180deg, #CD7F32 0%, #8B4513 100%)', border: '#CD7F32', glow: '0 0 12px rgba(205, 127, 50, 0.3)' },    // 3rd - bronze
];

export default function LeaderboardPage(): React.ReactElement {
  const t = useT();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();

  const [tab, setTab] = useState<TabKey>('global');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchLeaderboard(tab);
  }, [user, authLoading, router]);

  const fetchLeaderboard = async (tabKey: TabKey) => {
    setLoading(true);
    setTab(tabKey);
    let res;
    switch (tabKey) {
      case 'global':
        res = await api.social.globalLeaderboard();
        break;
      case 'friends':
        res = await api.social.friendsLeaderboard();
        break;
      case 'level':
        res = await api.social.levelLeaderboard();
        break;
    }
    if (res.ok && res.data) setEntries(res.data.entries);
    setLoading(false);
  };

  if (authLoading) return <div style={s.page}><p style={{ color: '#6B6490', textAlign: 'center', paddingTop: 80 }}>Loading...</p></div>;
  if (!user) return <div style={s.page}><p style={{ color: '#6B6490', textAlign: 'center', paddingTop: 80 }}>Redirecting...</p></div>;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#F1F0FF', margin: 0 }}>
            {t('social.leaderboard')}
          </h1>
          <p style={{ fontSize: 14, color: '#A5A0C8', margin: '4px 0 0' }}>{t('social.rank')}</p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '16px 16px 100px' : '20px 24px 100px' }}>
        {/* Tab toggle */}
        <div style={s.tabRow}>
          {([
            { key: 'global' as TabKey, label: t('social.globalLeaderboard') },
            { key: 'friends' as TabKey, label: t('social.friendsLeaderboard') },
            { key: 'level' as TabKey, label: 'By Level' },
          ]).map(item => (
            <button
              key={item.key}
              onClick={() => fetchLeaderboard(item.key)}
              style={{
                ...s.tabBtn,
                ...(tab === item.key ? s.tabBtnActive : {}),
                minHeight: 44,
                fontSize: isMobile ? 12 : 13,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Leaderboard list */}
        {loading ? (
          <p style={{ color: '#6B6490', textAlign: 'center', paddingTop: 40 }}>Loading...</p>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <span style={{ fontSize: 48 }}>🏆</span>
            <p style={{ color: '#A5A0C8', margin: '12px 0 4px', fontSize: 16, fontWeight: 600 }}>
              Challenge friends to climb the ranks!
            </p>
            <p style={{ color: '#6B6490', margin: 0 }}>No leaderboard data yet</p>
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
                  const avatarSizes = isMobile
                    ? [44, 56, 40]
                    : [48, 64, 44];
                  const podiumColor = PODIUM_COLORS[idx];
                  const isFirst = rank === 0;

                  return (
                    <div key={e.userId} style={{ textAlign: 'center', flex: 1 }}>
                      {/* Avatar */}
                      <div style={{
                        width: avatarSizes[idx],
                        height: avatarSizes[idx],
                        borderRadius: avatarSizes[idx] / 2,
                        background: isFirst
                          ? 'linear-gradient(135deg, #312E81 0%, #4338CA 50%, #7C3AED 100%)'
                          : 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #818CF8 100%)',
                        color: '#FFF',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: isFirst ? (isMobile ? 20 : 24) : (isMobile ? 16 : 18),
                        border: `3px solid ${podiumColor.border}`,
                        boxShadow: podiumColor.glow,
                        margin: '0 auto',
                      }}>
                        {e.displayName.charAt(0).toUpperCase()}
                      </div>
                      {/* Crown for 1st */}
                      {isFirst && (
                        <div style={{
                          fontSize: 20,
                          marginTop: -8,
                          marginBottom: -4,
                          position: 'relative' as const,
                          zIndex: 2,
                        }}>👑</div>
                      )}
                      <p style={{
                        margin: '6px 0 2px',
                        fontWeight: 600,
                        fontSize: isFirst ? (isMobile ? 13 : 15) : (isMobile ? 11 : 13),
                        color: '#F1F0FF',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {e.displayName}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: '#6B6490' }}>
                        {tab === 'level' ? `Lvl ${e.level}` : `RON ${(e.netWorth / 100).toLocaleString()}`}
                      </p>
                      {/* Podium bar */}
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
                const isMe = entry.isMe || entry.userId === user?.id;
                return (
                  <div
                    key={entry.userId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: isMobile ? '10px 12px' : '14px 16px',
                      background: isMe ? '#211B3A' : '#211B3A',
                      borderRadius: radius.md,
                      marginBottom: 8,
                      boxShadow: isMe
                        ? '0 0 20px rgba(99, 102, 241, 0.3), 0 2px 12px rgba(0, 0, 0, 0.3)'
                        : '0 2px 12px rgba(0, 0, 0, 0.3)',
                      border: isMe
                        ? '2px solid #6366F1'
                        : '1px solid #2D2545',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    <div style={s.rankBadge}>
                      {entry.rank <= 3 ? (
                        <span style={{ fontSize: 20 }}>{MEDALS[entry.rank - 1]}</span>
                      ) : (
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#6B6490' }}>{entry.rank}</span>
                      )}
                    </div>
                    <div style={{
                      width: isMobile ? 34 : 38,
                      height: isMobile ? 34 : 38,
                      borderRadius: isMobile ? 17 : 19,
                      background: isMe
                        ? 'linear-gradient(135deg, #312E81 0%, #4338CA 50%, #7C3AED 100%)'
                        : 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #818CF8 100%)',
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
                        color: '#F1F0FF',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {entry.displayName} {isMe && <span style={{ fontSize: 11, color: '#6366F1' }}>(You)</span>}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: isMobile ? 11 : 12, color: '#6B6490' }}>
                        Level {entry.level} · {entry.xp.toLocaleString()} XP
                      </p>
                    </div>
                    <p style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: isMobile ? 13 : 15,
                      color: '#F1F0FF',
                      whiteSpace: 'nowrap',
                    }}>
                      RON {(entry.netWorth / 100).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div style={s.bottomNav}>
        {[
          { icon: '🏠', label: 'Home', href: '/dashboard' },
          { icon: '👥', label: 'Social', href: '/social' },
          { icon: '🏆', label: 'Leaderboard', href: '/leaderboard', active: true },
          { icon: '🎓', label: 'Classroom', href: '/classroom' },
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
              color: navTab.active ? '#6366F1' : '#6B6490',
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
  page: { minHeight: '100vh', backgroundColor: '#0F0B1E' },
  header: {
    background: '#211B3A',
    padding: '40px 24px 28px',
    borderBottom: '1px solid #2D2545',
  },
  tabRow: {
    display: 'flex',
    gap: 6,
    background: '#1A1333',
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: 20,
    border: '1px solid #2D2545',
  },
  tabBtn: {
    flex: 1,
    padding: '10px 0',
    borderRadius: radius.pill,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    background: 'transparent',
    color: '#6B6490',
  },
  tabBtnActive: {
    background: '#2D2545',
    color: '#6366F1',
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
    background: '#211B3A',
    borderTop: '1px solid #2D2545',
    backdropFilter: 'blur(12px)',
    zIndex: 50,
  },
};

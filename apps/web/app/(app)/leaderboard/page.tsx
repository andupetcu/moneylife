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

  if (authLoading) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>Loading...</p></div>;
  if (!user) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>Redirecting...</p></div>;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#FFF', margin: 0 }}>{t('social.leaderboard')}</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>{t('social.rank')}</p>
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
              style={{ ...s.tabBtn, ...(tab === item.key ? s.tabBtnActive : {}), minHeight: 44, fontSize: isMobile ? 12 : 13 }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Leaderboard list */}
        {loading ? (
          <p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 40 }}>Loading...</p>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <span style={{ fontSize: 48 }}>🏆</span>
            <p style={{ color: colors.textMuted, margin: '12px 0 0' }}>No leaderboard data yet</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {entries.length >= 3 && (
              <div style={s.podium}>
                {[entries[1], entries[0], entries[2]].map((e, idx) => {
                  const podiumOrder = [1, 0, 2];
                  const rank = podiumOrder[idx];
                  const heights = isMobile ? [80, 110, 64] : [100, 130, 80];
                  return (
                    <div key={e.userId} style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ ...s.podiumAvatar, ...(rank === 0 ? { width: isMobile ? 48 : 56, height: isMobile ? 48 : 56, borderRadius: isMobile ? 24 : 28, fontSize: isMobile ? 18 : 22 } : {}) }}>
                        {e.displayName.charAt(0).toUpperCase()}
                      </div>
                      <p style={{ margin: '6px 0 2px', fontWeight: 600, fontSize: rank === 0 ? (isMobile ? 13 : 15) : (isMobile ? 11 : 13), color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.displayName}</p>
                      <p style={{ margin: 0, fontSize: 11, color: colors.textMuted }}>
                        {tab === 'level' ? `Lvl ${e.level}` : `$${(e.netWorth / 100).toLocaleString()}`}
                      </p>
                      <div style={{ height: heights[idx], background: colors.primaryGradient, borderRadius: `${radius.sm}px ${radius.sm}px 0 0`, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: isMobile ? 22 : 28 }}>{MEDALS[rank]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            <div style={{ marginTop: 20 }}>
              {entries.map(entry => {
                const isMe = entry.isMe || entry.userId === user?.id;
                return (
                  <div key={entry.userId} style={{ ...s.entryRow, ...(isMe ? s.entryRowMe : {}), padding: isMobile ? '10px 12px' : '14px 16px' }}>
                    <div style={s.rankBadge}>
                      {entry.rank <= 3 ? (
                        <span style={{ fontSize: 20 }}>{MEDALS[entry.rank - 1]}</span>
                      ) : (
                        <span style={{ fontSize: 14, fontWeight: 700, color: colors.textMuted }}>{entry.rank}</span>
                      )}
                    </div>
                    <div style={{ ...s.entryAvatar, ...(isMe ? { background: colors.cardGradient } : {}), width: isMobile ? 34 : 38, height: isMobile ? 34 : 38, borderRadius: isMobile ? 17 : 19 }}>
                      {entry.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: isMobile ? 13 : 14, color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.displayName} {isMe && <span style={{ fontSize: 11, color: colors.primary }}>(You)</span>}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: isMobile ? 11 : 12, color: colors.textMuted }}>
                        Level {entry.level} · {entry.xp.toLocaleString()} XP
                      </p>
                    </div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: isMobile ? 13 : 15, color: colors.textPrimary, whiteSpace: 'nowrap' }}>
                      ${(entry.netWorth / 100).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ ...s.bottomNav, paddingBottom: 'env(safe-area-inset-bottom, 14px)' }}>
        {[
          { icon: '🏠', label: 'Home', href: '/dashboard' },
          { icon: '👥', label: 'Social', href: '/social' },
          { icon: '🏆', label: 'Leaderboard', href: '/leaderboard', active: true },
          { icon: '🎓', label: 'Classroom', href: '/classroom' },
        ].map(navTab => (
          <Link key={navTab.href} href={navTab.href} style={{ ...s.navTab, color: navTab.active ? colors.primary : colors.textMuted, minWidth: 44, minHeight: 44, justifyContent: 'center' }}>
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
  header: { background: colors.primaryGradient, padding: '40px 24px 28px', borderRadius: `0 0 ${radius.xl}px ${radius.xl}px` },
  tabRow: { display: 'flex', gap: 6, background: colors.borderLight, borderRadius: radius.pill, padding: 4, marginBottom: 20 },
  tabBtn: { flex: 1, padding: '10px 0', borderRadius: radius.pill, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: 'transparent', color: colors.textSecondary },
  tabBtnActive: { background: colors.surface, color: colors.primary, boxShadow: shadows.card },
  podium: { display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 8 },
  podiumAvatar: { width: 44, height: 44, borderRadius: 22, background: colors.primaryGradient, color: '#FFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18, margin: '0 auto' },
  entryRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: colors.surface, borderRadius: radius.md, marginBottom: 8, boxShadow: shadows.card },
  entryRowMe: { border: `2px solid ${colors.primaryLight}`, background: '#EEF2FF' },
  rankBadge: { width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  entryAvatar: { width: 38, height: 38, borderRadius: 19, background: colors.primaryGradient, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 },
  bottomNav: { position: 'fixed' as const, bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px', background: colors.surface, borderTop: `1px solid ${colors.border}`, zIndex: 50 },
  navTab: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2, textDecoration: 'none' },
};

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../src/lib/auth-context';
import { api, type Friend, type FriendRequest, type SearchUser } from '../../../src/lib/api';
import { colors, radius, shadows } from '../../../src/lib/design-tokens';

export default function SocialPage(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchData();
  }, [user, authLoading, router]);

  const fetchData = async () => {
    const [friendsRes, reqRes] = await Promise.all([
      api.social.listFriends(),
      api.social.listFriendRequests(),
    ]);
    if (friendsRes.ok && friendsRes.data) setFriends(friendsRes.data.friends);
    if (reqRes.ok && reqRes.data) setRequests(reqRes.data.requests);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    setSearching(true);
    const res = await api.social.searchUsers(searchQuery.trim());
    if (res.ok && res.data) setSearchResults(res.data.users);
    setSearching(false);
  };

  const handleSendRequest = async (targetUserId: string) => {
    const res = await api.social.sendFriendRequest(targetUserId);
    if (res.ok) {
      setActionMsg('Friend request sent!');
      setSearchResults(prev => prev.filter(u => u.id !== targetUserId));
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  const handleAccept = async (requestId: string) => {
    const res = await api.social.acceptFriendRequest(requestId);
    if (res.ok) {
      setRequests(prev => prev.filter(r => r.id !== requestId));
      fetchData();
    }
  };

  const handleReject = async (requestId: string) => {
    const res = await api.social.rejectFriendRequest(requestId);
    if (res.ok) setRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleRemove = async (friendshipId: string) => {
    const res = await api.social.removeFriend(friendshipId);
    if (res.ok) setFriends(prev => prev.filter(f => f.friendshipId !== friendshipId));
  };

  if (authLoading || loading) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>Loading...</p></div>;
  if (!user) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>Redirecting...</p></div>;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#FFF', margin: 0 }}>{t('social.title')}</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>{t('social.friends')}</p>
          </div>
          <button onClick={() => setShowSearch(!showSearch)} style={s.addBtn}>
            + {t('social.addFriend')}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 24px 100px' }}>
        {/* Action message */}
        {actionMsg && (
          <div style={{ padding: '12px 16px', borderRadius: radius.sm, background: '#D1FAE5', color: '#065F46', marginBottom: 16, fontSize: 14, fontWeight: 500 }}>
            {actionMsg}
          </div>
        )}

        {/* Search panel */}
        {showSearch && (
          <div style={{ ...s.card, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: colors.textPrimary }}>{t('social.addFriend')}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name or email..."
                style={s.input}
              />
              <button onClick={handleSearch} disabled={searching} style={s.searchBtn}>
                {searching ? '...' : t('common.search')}
              </button>
            </div>
            {searchResults.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {searchResults.map(u => (
                  <div key={u.id} style={s.searchRow}>
                    <div style={s.avatar}>{u.displayName.charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, color: colors.textPrimary, fontSize: 14 }}>{u.displayName}</p>
                      <p style={{ margin: 0, fontSize: 12, color: colors.textMuted }}>{u.email}</p>
                    </div>
                    <button onClick={() => handleSendRequest(u.id)} style={s.sendBtn}>Add</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pending requests */}
        {requests.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={s.sectionTitle}>Pending Requests ({requests.length})</h2>
            {requests.map(req => (
              <div key={req.id} style={s.card}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={s.avatar}>{req.displayName.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: colors.textPrimary }}>{req.displayName}</p>
                    <p style={{ margin: 0, fontSize: 12, color: colors.textMuted }}>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleAccept(req.id)} style={s.acceptBtn}>Accept</button>
                    <button onClick={() => handleReject(req.id)} style={s.rejectBtn}>Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Friends list */}
        <h2 style={s.sectionTitle}>{t('social.friends')} ({friends.length})</h2>
        {friends.length === 0 ? (
          <div style={{ ...s.card, textAlign: 'center', padding: 40 }}>
            <span style={{ fontSize: 48 }}>👥</span>
            <p style={{ color: colors.textMuted, margin: '12px 0 0' }}>{t('social.noFriends')}</p>
            <button onClick={() => setShowSearch(true)} style={{ ...s.searchBtn, marginTop: 16 }}>
              {t('social.addFriend')}
            </button>
          </div>
        ) : (
          friends.map(friend => (
            <div key={friend.friendshipId} style={s.friendCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={s.avatar}>{friend.displayName.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: colors.textPrimary }}>{friend.displayName}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: colors.textMuted }}>
                    Level {friend.level} · {friend.xp} XP
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: colors.textPrimary, fontSize: 15 }}>
                    {(friend.netWorth / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </p>
                  <button onClick={() => handleRemove(friend.friendshipId)} style={s.removeBtn}>Remove</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom nav */}
      <div style={s.bottomNav}>
        {[
          { icon: '🏠', label: 'Home', href: '/dashboard' },
          { icon: '👥', label: 'Social', href: '/social', active: true },
          { icon: '🏆', label: 'Leaderboard', href: '/leaderboard' },
          { icon: '🎓', label: 'Classroom', href: '/classroom' },
        ].map(tab => (
          <Link key={tab.label} href={tab.href} style={{ ...s.navTab, color: tab.active ? colors.primary : colors.textMuted }}>
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 11, fontWeight: tab.active ? 600 : 400 }}>{tab.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', backgroundColor: colors.background },
  header: { background: colors.primaryGradient, padding: '40px 24px 28px', borderRadius: `0 0 ${radius.xl}px ${radius.xl}px` },
  addBtn: { padding: '8px 16px', borderRadius: radius.pill, background: 'rgba(255,255,255,0.2)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  card: { background: colors.surface, borderRadius: radius.lg, padding: 16, boxShadow: shadows.card, marginBottom: 10 },
  friendCard: { background: colors.surface, borderRadius: radius.lg, padding: 16, boxShadow: shadows.card, marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: 600, color: colors.textPrimary, marginBottom: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, background: colors.primaryGradient, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 },
  input: { flex: 1, padding: '10px 14px', borderRadius: radius.sm, border: `1px solid ${colors.border}`, fontSize: 14, background: colors.inputBg, outline: 'none' },
  searchBtn: { padding: '10px 20px', borderRadius: radius.sm, background: colors.primaryGradient, color: '#FFF', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  searchRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${colors.borderLight}` },
  sendBtn: { padding: '6px 14px', borderRadius: radius.sm, background: colors.primaryGradient, color: '#FFF', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  acceptBtn: { padding: '6px 14px', borderRadius: radius.sm, background: colors.success, color: '#FFF', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  rejectBtn: { padding: '6px 14px', borderRadius: radius.sm, background: colors.borderLight, color: colors.textSecondary, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  removeBtn: { marginTop: 4, padding: '2px 8px', borderRadius: radius.sm, background: 'transparent', color: colors.danger, border: 'none', cursor: 'pointer', fontSize: 11 },
  bottomNav: { position: 'fixed' as const, bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px', background: colors.surface, borderTop: `1px solid ${colors.border}`, zIndex: 50 },
  navTab: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2, textDecoration: 'none' },
};

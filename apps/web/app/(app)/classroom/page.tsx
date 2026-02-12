'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../src/lib/auth-context';
import { api, type Classroom, type LeaderboardEntry } from '../../../src/lib/api';
import { colors, radius, shadows } from '../../../src/lib/design-tokens';

type View = 'list' | 'detail';

export default function ClassroomPage(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [view, setView] = useState<View>('list');
  const [teaching, setTeaching] = useState<Classroom[]>([]);
  const [enrolled, setEnrolled] = useState<Classroom[]>([]);
  const [selected, setSelected] = useState<Classroom | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [className, setClassName] = useState('');
  const [classDesc, setClassDesc] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user) fetchClassrooms();
  }, [user, authLoading, router]);

  const fetchClassrooms = async () => {
    const res = await api.social.listClassrooms();
    if (res.ok && res.data) {
      setTeaching(res.data.teaching);
      setEnrolled(res.data.enrolled);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!className.trim()) { setFormError('Name is required'); return; }
    setSubmitting(true);
    setFormError(null);
    const res = await api.social.createClassroom(className.trim(), classDesc.trim());
    setSubmitting(false);
    if (res.ok && res.data) {
      setShowCreate(false);
      setClassName('');
      setClassDesc('');
      fetchClassrooms();
    } else {
      setFormError(res.error || 'Failed to create classroom');
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) { setFormError('Code is required'); return; }
    setSubmitting(true);
    setFormError(null);
    const res = await api.social.joinClassroom(joinCode.trim());
    setSubmitting(false);
    if (res.ok) {
      setShowJoin(false);
      setJoinCode('');
      fetchClassrooms();
    } else {
      setFormError(res.error || 'Invalid code');
    }
  };

  const openClassroom = async (id: string) => {
    const [detailRes, lbRes] = await Promise.all([
      api.social.getClassroom(id),
      api.social.classroomLeaderboard(id),
    ]);
    if (detailRes.ok && detailRes.data) setSelected(detailRes.data);
    if (lbRes.ok && lbRes.data) setLeaderboard(lbRes.data.entries);
    setView('detail');
  };

  if (authLoading || loading) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>Loading...</p></div>;
  if (!user) return <div style={s.page}><p style={{ color: colors.textMuted, textAlign: 'center', paddingTop: 80 }}>Redirecting...</p></div>;

  const isTeacher = user.role === 'teacher' || user.role === 'admin';
  const MEDALS = ['🥇', '🥈', '🥉'];

  // Detail view
  if (view === 'detail' && selected) {
    return (
      <div style={s.page}>
        <div style={s.header}>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setView('list')} style={s.backBtn}>←</button>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#FFF', margin: 0 }}>{selected.name}</h1>
              {selected.isTeacher && selected.joinCode && (
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '4px 0 0' }}>
                  Join code: <span style={{ fontWeight: 700, letterSpacing: 1.5 }}>{selected.joinCode}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 24px 100px' }}>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <div style={{ ...s.statCard, flex: 1 }}>
              <p style={s.statLabel}>Members</p>
              <p style={s.statValue}>{selected.members?.length ?? 0}</p>
            </div>
            <div style={{ ...s.statCard, flex: 1 }}>
              <p style={s.statLabel}>Role</p>
              <p style={s.statValue}>{selected.isTeacher ? 'Teacher' : 'Student'}</p>
            </div>
          </div>

          {/* Members list */}
          {selected.members && selected.members.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h2 style={s.sectionTitle}>Members</h2>
              {selected.members.map(m => (
                <div key={m.userId} style={s.memberRow}>
                  <div style={s.avatar}>{m.displayName.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: colors.textPrimary, fontSize: 14 }}>{m.displayName}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: colors.textMuted }}>Level {m.level} · {m.xp} XP</p>
                  </div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: colors.textPrimary }}>
                    ${(m.netWorth / 100).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Classroom leaderboard */}
          {leaderboard.length > 0 && (
            <div>
              <h2 style={s.sectionTitle}>{t('social.classroomLeaderboard')}</h2>
              {leaderboard.map(entry => {
                const isMe = entry.isMe || entry.userId === user?.id;
                return (
                  <div key={entry.userId} style={{ ...s.lbRow, ...(isMe ? { border: `2px solid ${colors.primaryLight}`, background: '#EEF2FF' } : {}) }}>
                    <div style={{ width: 32, textAlign: 'center' }}>
                      {entry.rank <= 3 ? (
                        <span style={{ fontSize: 20 }}>{MEDALS[entry.rank - 1]}</span>
                      ) : (
                        <span style={{ fontSize: 14, fontWeight: 700, color: colors.textMuted }}>{entry.rank}</span>
                      )}
                    </div>
                    <div style={s.avatar}>{entry.displayName.charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: colors.textPrimary }}>
                        {entry.displayName} {isMe && <span style={{ fontSize: 11, color: colors.primary }}>(You)</span>}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: colors.textMuted }}>Level {entry.level}</p>
                    </div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: colors.textPrimary }}>
                      ${(entry.netWorth / 100).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div style={s.bottomNav}>
          {[
            { icon: '🏠', label: 'Home', href: '/dashboard' },
            { icon: '👥', label: 'Social', href: '/social' },
            { icon: '🏆', label: 'Leaderboard', href: '/leaderboard' },
            { icon: '🎓', label: 'Classroom', href: '/classroom', active: true },
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

  // List view
  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#FFF', margin: 0 }}>{t('social.classroom')}</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>Learn together</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }} style={s.headerBtn}>
              {t('social.joinClassroom')}
            </button>
            {isTeacher && (
              <button onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }} style={s.headerBtn}>
                + Create
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 24px 100px' }}>
        {/* Join form */}
        {showJoin && (
          <div style={{ ...s.card, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: colors.textPrimary }}>{t('social.joinClassroom')}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                placeholder={t('social.classroomCode')}
                style={s.input}
                maxLength={10}
              />
              <button onClick={handleJoin} disabled={submitting} style={s.primaryBtn}>
                {submitting ? '...' : 'Join'}
              </button>
            </div>
            {formError && <p style={{ color: colors.danger, fontSize: 13, margin: '8px 0 0' }}>{formError}</p>}
          </div>
        )}

        {/* Create form */}
        {showCreate && isTeacher && (
          <div style={{ ...s.card, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: colors.textPrimary }}>Create Classroom</h3>
            <input
              value={className}
              onChange={e => setClassName(e.target.value)}
              placeholder="Classroom name"
              style={{ ...s.input, marginBottom: 8, width: '100%', flex: 'unset' }}
            />
            <input
              value={classDesc}
              onChange={e => setClassDesc(e.target.value)}
              placeholder="Description (optional)"
              style={{ ...s.input, marginBottom: 12, width: '100%', flex: 'unset' }}
            />
            <button onClick={handleCreate} disabled={submitting} style={{ ...s.primaryBtn, width: '100%' }}>
              {submitting ? 'Creating...' : 'Create Classroom'}
            </button>
            {formError && <p style={{ color: colors.danger, fontSize: 13, margin: '8px 0 0' }}>{formError}</p>}
          </div>
        )}

        {/* Teaching */}
        {teaching.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={s.sectionTitle}>My Classrooms (Teacher)</h2>
            {teaching.map(c => (
              <div key={c.id} onClick={() => openClassroom(c.id)} style={s.classCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ ...s.classIcon, background: colors.cardGradient }}>🎓</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: colors.textPrimary }}>{c.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: colors.textMuted }}>
                      {c.memberCount} members · Code: {c.joinCode}
                    </p>
                  </div>
                  <span style={{ color: colors.textMuted, fontSize: 16 }}>→</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enrolled */}
        {enrolled.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={s.sectionTitle}>Enrolled Classrooms</h2>
            {enrolled.map(c => (
              <div key={c.id} onClick={() => openClassroom(c.id)} style={s.classCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={s.classIcon}>🎓</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: colors.textPrimary }}>{c.name}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: colors.textMuted }}>
                      by {c.teacherName} · {c.memberCount} members
                    </p>
                  </div>
                  <span style={{ color: colors.textMuted, fontSize: 16 }}>→</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {teaching.length === 0 && enrolled.length === 0 && (
          <div style={{ ...s.card, textAlign: 'center', padding: 40 }}>
            <span style={{ fontSize: 48 }}>🎓</span>
            <p style={{ color: colors.textMuted, margin: '12px 0 16px' }}>{t('social.noClassroom')}</p>
            <button onClick={() => setShowJoin(true)} style={s.primaryBtn}>{t('social.joinClassroom')}</button>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={s.bottomNav}>
        {[
          { icon: '🏠', label: 'Home', href: '/dashboard' },
          { icon: '👥', label: 'Social', href: '/social' },
          { icon: '🏆', label: 'Leaderboard', href: '/leaderboard' },
          { icon: '🎓', label: 'Classroom', href: '/classroom', active: true },
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
  headerBtn: { padding: '8px 14px', borderRadius: radius.pill, background: 'rgba(255,255,255,0.2)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  backBtn: { width: 32, height: 32, borderRadius: radius.sm, border: 'none', background: 'rgba(255,255,255,0.2)', color: '#FFF', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { background: colors.surface, borderRadius: radius.lg, padding: 16, boxShadow: shadows.card, marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: 600, color: colors.textPrimary, marginBottom: 12 },
  input: { flex: 1, padding: '10px 14px', borderRadius: radius.sm, border: `1px solid ${colors.border}`, fontSize: 14, background: colors.inputBg, outline: 'none' },
  primaryBtn: { padding: '10px 20px', borderRadius: radius.sm, background: colors.primaryGradient, color: '#FFF', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  classCard: { background: colors.surface, borderRadius: radius.lg, padding: 16, boxShadow: shadows.card, marginBottom: 10, cursor: 'pointer' },
  classIcon: { width: 42, height: 42, borderRadius: 12, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 },
  avatar: { width: 38, height: 38, borderRadius: 19, background: colors.primaryGradient, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 },
  statCard: { padding: 16, borderRadius: radius.md, background: colors.surface, boxShadow: shadows.card, textAlign: 'center' },
  statLabel: { margin: 0, fontSize: 12, color: colors.textMuted },
  statValue: { margin: '4px 0 0', fontSize: 22, fontWeight: 700, color: colors.textPrimary },
  memberRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: colors.surface, borderRadius: radius.md, marginBottom: 8, boxShadow: shadows.card },
  lbRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: colors.surface, borderRadius: radius.md, marginBottom: 8, boxShadow: shadows.card },
  bottomNav: { position: 'fixed' as const, bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '10px 0 14px', background: colors.surface, borderTop: `1px solid ${colors.border}`, zIndex: 50 },
  navTab: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2, textDecoration: 'none' },
};

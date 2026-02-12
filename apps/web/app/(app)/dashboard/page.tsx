'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/lib/auth-context';
import { api, type GameResponse } from '../../../src/lib/api';

const PERSONAS = [
  { id: 'teen', emoji: '🎒' },
  { id: 'student', emoji: '🎓' },
  { id: 'young_adult', emoji: '💼' },
  { id: 'parent', emoji: '👨‍👩‍👧' },
];

const DIFFICULTIES = ['easy', 'normal', 'hard'];

export default function DashboardPage(): React.ReactElement {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [games, setGames] = useState<GameResponse[]>([]);
  const [showNewGame, setShowNewGame] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('young_adult');
  const [selectedDifficulty, setSelectedDifficulty] = useState('normal');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      api.game.list().then(res => {
        if (res.ok && res.data) setGames(res.data);
      });
    }
  }, [user]);

  const handleCreateGame = async (): Promise<void> => {
    setCreating(true);
    setError(null);
    const res = await api.game.create(selectedPersona, selectedDifficulty, 'RO', 'RON');
    setCreating(false);
    if (res.ok && res.data) {
      setGames(prev => [res.data!, ...prev]);
      setShowNewGame(false);
    } else {
      setError(res.error || 'Failed to create game');
    }
  };

  if (loading) return <div style={styles.container}><p>Loading...</p></div>;
  if (!user) return <div style={styles.container}><p>Redirecting...</p></div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>👋 {t('home.welcome') || 'Welcome'}, {user.displayName}!</h1>
          <p style={styles.subtitle}>{t('home.subtitle') || 'Your financial journey starts here'}</p>
        </div>
        <button onClick={logout} style={styles.logoutBtn}>Logout</button>
      </div>

      {games.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>{t('home.yourGames') || 'Your Games'}</h2>
          {games.map(game => (
            <div key={game.id} style={styles.gameCard} onClick={() => router.push(`/game/${game.id}`)}>
              <div style={styles.gameInfo}>
                <span style={styles.gameEmoji}>{PERSONAS.find(p => p.id === game.persona)?.emoji || '🎮'}</span>
                <div>
                  <p style={styles.gameName}>{game.persona} · Level {game.level}</p>
                  <p style={styles.gameDetail}>{game.currency} · {game.difficulty} · {game.xp} XP</p>
                </div>
              </div>
              <span style={{...styles.statusBadge, backgroundColor: game.status === 'active' ? '#D1FAE5' : '#F3F4F6'}}>
                {game.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {!showNewGame ? (
        <button onClick={() => setShowNewGame(true)} style={styles.newGameBtn}>
          🎮 {t('home.startNewGame') || 'Start New Game'}
        </button>
      ) : (
        <div style={styles.newGamePanel}>
          <h2 style={styles.sectionTitle}>{t('onboarding.personaSelect') || 'Choose Your Persona'}</h2>
          <div style={styles.personaGrid}>
            {PERSONAS.map(p => (
              <button key={p.id} onClick={() => setSelectedPersona(p.id)}
                style={{...styles.personaCard, borderColor: selectedPersona === p.id ? '#2563EB' : '#E5E7EB', backgroundColor: selectedPersona === p.id ? '#EFF6FF' : '#FFF'}}>
                <span style={{fontSize: 32}}>{p.emoji}</span>
                <span style={{fontWeight: 600}}>{t(`onboarding.persona${p.id.charAt(0).toUpperCase() + p.id.slice(1).replace('_a', 'A')}`) || p.id}</span>
              </button>
            ))}
          </div>

          <h3 style={{...styles.sectionTitle, marginTop: 24}}>{t('onboarding.selectDifficulty') || 'Difficulty'}</h3>
          <div style={{display: 'flex', gap: 12}}>
            {DIFFICULTIES.map(d => (
              <button key={d} onClick={() => setSelectedDifficulty(d)}
                style={{...styles.diffBtn, borderColor: selectedDifficulty === d ? '#2563EB' : '#E5E7EB', backgroundColor: selectedDifficulty === d ? '#EFF6FF' : '#FFF'}}>
                {t(`onboarding.difficulty${d.charAt(0).toUpperCase() + d.slice(1)}`) || d}
              </button>
            ))}
          </div>

          {error && <p style={{color: '#EF4444', marginTop: 12}}>{error}</p>}

          <div style={{display: 'flex', gap: 12, marginTop: 24}}>
            <button onClick={handleCreateGame} disabled={creating} style={{...styles.newGameBtn, opacity: creating ? 0.7 : 1}}>
              {creating ? 'Creating...' : (t('onboarding.startGame') || '🚀 Start Game')}
            </button>
            <button onClick={() => setShowNewGame(false)} style={styles.cancelBtn}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: 800, margin: '40px auto', padding: 24 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  logoutBtn: { padding: '8px 16px', borderRadius: 8, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', color: '#6B7280' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 16 },
  gameCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, border: '1px solid #E5E7EB', borderRadius: 12, marginBottom: 12, cursor: 'pointer', transition: 'border-color 0.2s' },
  gameInfo: { display: 'flex', alignItems: 'center', gap: 12 },
  gameEmoji: { fontSize: 32 },
  gameName: { fontWeight: 600, color: '#111827', margin: 0 },
  gameDetail: { color: '#6B7280', fontSize: 14, margin: 0 },
  statusBadge: { padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500 },
  newGameBtn: { padding: '14px 28px', borderRadius: 12, backgroundColor: '#2563EB', color: '#FFF', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer' },
  cancelBtn: { padding: '14px 28px', borderRadius: 12, backgroundColor: '#F3F4F6', color: '#6B7280', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer' },
  newGamePanel: { padding: 24, border: '1px solid #E5E7EB', borderRadius: 16, background: '#FAFAFA' },
  personaGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 },
  personaCard: { display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8, padding: 16, borderRadius: 12, border: '2px solid', cursor: 'pointer', transition: 'all 0.2s' },
  diffBtn: { flex: 1, padding: '10px 16px', borderRadius: 8, border: '2px solid', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' },
};

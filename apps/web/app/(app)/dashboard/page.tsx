'use client';

import React, { useEffect, useState } from 'react';
import { useT } from '../../../src/lib/useT';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/lib/auth-context';
import { api, type GameResponse } from '../../../src/lib/api';
import Link from 'next/link';
import { colors, radius, shadows } from '../../../src/lib/design-tokens';
import LanguageSwitcher from '../../../src/components/LanguageSwitcher';
import { useIsMobile } from '../../../src/hooks/useIsMobile';

const PERSONAS = [
  { id: 'teen', emoji: '🎒' },
  { id: 'student', emoji: '🎓' },
  { id: 'young_adult', emoji: '💼' },
  { id: 'parent', emoji: '👨‍👩‍👧' },
];

const DIFFICULTIES = ['easy', 'normal', 'hard'];

export default function DashboardPage(): React.ReactElement {
  const t = useT();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const isMobile = useIsMobile();
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

  if (loading) return <div style={{ minHeight: '100vh', background: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: colors.textSecondary }}>{t('common.loading')}</p></div>;
  if (!user) return <div style={{ minHeight: '100vh', background: colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: colors.textSecondary }}>{t('dashboard.redirecting')}</p></div>;

  return (
    <div style={{ minHeight: '100vh', background: colors.background }}>
      {/* Purple gradient header */}
      <div style={{
        background: colors.primaryGradient,
        padding: isMobile ? '32px 16px 24px' : '40px 24px 32px',
        borderRadius: `0 0 ${radius.xl}px ${radius.xl}px`,
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {t('dashboard.hi', { name: user.displayName })} 👋
            </h1>
            <p style={{ fontSize: isMobile ? 13 : 15, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>
              {t('home.subtitle') || 'Your financial journey starts here'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            {!isMobile && <LanguageSwitcher />}
            <button onClick={logout} style={{
              padding: '8px 16px', borderRadius: radius.sm, border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)', cursor: 'pointer', color: '#FFFFFF', fontSize: 14, fontWeight: 500,
              minHeight: 44,
            }}>
              {t('dashboard.logout')}
            </button>
          </div>
        </div>
        {isMobile && (
          <div style={{ maxWidth: 800, margin: '12px auto 0', display: 'flex', justifyContent: 'flex-end' }}>
            <LanguageSwitcher />
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '16px 16px 100px' : '24px 24px 100px' }}>
        {/* Game cards */}
        {games.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, color: colors.textPrimary, marginBottom: 16 }}>
              {t('home.yourGames') || 'Your Games'}
            </h2>
            {games.map(game => (
              <div key={game.id} onClick={() => router.push(`/game/${game.id}`)} style={{
                background: colors.cardGradient,
                borderRadius: radius.lg,
                padding: isMobile ? 16 : 20,
                marginBottom: 14,
                cursor: 'pointer',
                boxShadow: shadows.bankCard,
                color: '#FFFFFF',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', bottom: -30, right: 40, width: 100, height: 100, borderRadius: 50, background: 'rgba(255,255,255,0.05)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14 }}>
                    <span style={{ fontSize: isMobile ? 28 : 36 }}>{PERSONAS.find(p => p.id === game.persona)?.emoji || '🎮'}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: isMobile ? 15 : 17, margin: 0, textTransform: 'capitalize' }}>{game.persona.replace('_', ' ')}</p>
                      <p style={{ fontSize: 13, opacity: 0.8, margin: '2px 0 0' }}>{t('game.level', { level: game.level })} · {game.xp} XP</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>{game.currency}</p>
                    <span style={{
                      display: 'inline-block', marginTop: 4, padding: '3px 10px', borderRadius: radius.pill,
                      fontSize: 12, fontWeight: 500,
                      background: game.status === 'active' ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.15)',
                    }}>
                      {game.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Welcome card when no games */}
        {games.length === 0 && !showNewGame && (
          <div style={{
            background: colors.surface, borderRadius: radius.xl, padding: isMobile ? 24 : 32,
            boxShadow: shadows.elevated, textAlign: 'center', marginBottom: 24,
            border: `1px solid ${colors.borderLight}`,
          }}>
            <span style={{ fontSize: isMobile ? 44 : 56 }}>🎮</span>
            <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, color: colors.textPrimary, margin: '16px 0 8px' }}>
              {t('dashboard.welcomeTitle') || 'Welcome to MoneyLife!'}
            </h2>
            <p style={{ fontSize: 15, color: colors.textSecondary, lineHeight: '1.6', margin: '0 0 24px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
              {t('dashboard.welcomeDesc') || 'Start your first financial journey. Choose a persona, make smart money decisions, and level up your financial skills!'}
            </p>
            <button onClick={() => setShowNewGame(true)} style={{
              padding: '14px 32px', borderRadius: radius.md, background: colors.primaryGradient,
              color: '#FFFFFF', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
              height: 52, width: isMobile ? '100%' : 'auto',
            }}>
              {t('dashboard.createFirst') || 'Create Your First Game'}
            </button>
          </div>
        )}

        {/* New Game button / panel */}
        {!showNewGame && games.length > 0 && (
          <button onClick={() => setShowNewGame(true)} style={{
            width: '100%', padding: 20, borderRadius: radius.lg,
            background: colors.surface, border: `2px dashed ${colors.border}`,
            cursor: 'pointer', fontSize: 16, fontWeight: 600, color: colors.primary,
            boxShadow: shadows.card, minHeight: 52,
          }}>
            🎮 {t('home.startNewGame') || 'Start New Game'}
          </button>
        )}
        {showNewGame && (
          <div style={{
            background: colors.surface, borderRadius: radius.xl, padding: isMobile ? 20 : 28,
            boxShadow: shadows.elevated, border: `1px solid ${colors.borderLight}`,
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.textPrimary, marginBottom: 20 }}>
              {t('onboarding.personaSelect') || 'Choose Your Persona'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {PERSONAS.map(p => (
                <button key={p.id} onClick={() => setSelectedPersona(p.id)} style={{
                  display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8,
                  padding: isMobile ? 14 : 18, borderRadius: radius.md,
                  border: `2px solid ${selectedPersona === p.id ? colors.primary : colors.border}`,
                  background: selectedPersona === p.id ? '#EEF2FF' : colors.surface,
                  cursor: 'pointer', transition: 'all 0.2s', minHeight: 44,
                }}>
                  <span style={{ fontSize: isMobile ? 28 : 32 }}>{p.emoji}</span>
                  <span style={{ fontWeight: 600, fontSize: 14, color: selectedPersona === p.id ? colors.primary : colors.textPrimary, textTransform: 'capitalize' }}>
                    {t(`onboarding.persona${p.id.charAt(0).toUpperCase() + p.id.slice(1).replace('_a', 'A')}`) || p.id.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary, margin: '24px 0 12px' }}>
              {t('onboarding.selectDifficulty') || 'Difficulty'}
            </h3>
            <div style={{ display: 'flex', gap: 10 }}>
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => setSelectedDifficulty(d)} style={{
                  flex: 1, padding: '12px 16px', borderRadius: radius.pill,
                  border: `2px solid ${selectedDifficulty === d ? colors.primary : colors.border}`,
                  background: selectedDifficulty === d ? '#EEF2FF' : colors.surface,
                  cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                  color: selectedDifficulty === d ? colors.primary : colors.textSecondary,
                  textTransform: 'capitalize', minHeight: 44,
                }}>
                  {t(`onboarding.difficulty${d.charAt(0).toUpperCase() + d.slice(1)}`) || d}
                </button>
              ))}
            </div>

            {error && <p style={{ color: colors.danger, marginTop: 16, fontSize: 14, padding: '10px 14px', background: '#FEF2F2', borderRadius: radius.sm }}>{error}</p>}

            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexDirection: isMobile ? 'column-reverse' : 'row' }}>
              <button onClick={handleCreateGame} disabled={creating} style={{
                flex: 1, height: 52, borderRadius: radius.md, background: colors.primaryGradient,
                color: '#FFFFFF', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer',
                opacity: creating ? 0.7 : 1,
              }}>
                {creating ? t('dashboard.creating') : (t('onboarding.startGame') || '🚀 Start Game')}
              </button>
              <button onClick={() => setShowNewGame(false)} style={{
                padding: '0 24px', height: 52, borderRadius: radius.md,
                background: colors.borderLight, color: colors.textSecondary,
                fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer',
              }}>
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom tab nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: colors.surface, borderTop: `1px solid ${colors.border}`,
        padding: '10px 0 14px', display: 'flex', justifyContent: 'space-around',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom, 14px)',
      }}>
        {[
          { icon: '🏠', label: isMobile ? '' : 'Home', href: '/dashboard', active: true },
          { icon: '👥', label: isMobile ? '' : 'Social', href: '/social' },
          { icon: '🏆', label: isMobile ? '' : 'Leaderboard', href: '/leaderboard' },
          { icon: '🎓', label: isMobile ? '' : 'Classroom', href: '/classroom' },
        ].map(tab => (
          <Link key={tab.href} href={tab.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', color: tab.active ? colors.primary : colors.textMuted, minWidth: 44, minHeight: 44, justifyContent: 'center' }}>
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            {tab.label && <span style={{ fontSize: 11, fontWeight: tab.active ? 600 : 400 }}>{tab.label}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

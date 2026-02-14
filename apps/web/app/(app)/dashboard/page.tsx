'use client';

import React, { useEffect, useState } from 'react';
import { useT } from '../../../src/lib/useT';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/lib/auth-context';
import { api, type GameResponse } from '../../../src/lib/api';
import Link from 'next/link';
import { radius } from '../../../src/lib/design-tokens';
import LanguageSwitcher from '../../../src/components/LanguageSwitcher';
import { useIsMobile } from '../../../src/hooks/useIsMobile';

// Dark theme colors (hardcoded — chunk A may not be merged yet)
const dk = {
  background: '#0F0B1E',
  surface: '#211B3A',
  surfaceHover: '#2A2248',
  surfaceElevated: '#2D2545',
  textPrimary: '#F1F0FF',
  textSecondary: '#A5A0C8',
  textMuted: '#6B6490',
  border: '#2D2545',
  borderLight: '#1E1838',
  primary: '#6366F1',
  primaryGradient: 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #818CF8 100%)',
  cardGradient: 'linear-gradient(135deg, #312E81 0%, #4338CA 50%, #7C3AED 100%)',
  success: '#34D399',
  danger: '#FB7185',
  warning: '#FBBF24',
  accentCyan: '#22D3EE',
  glowPrimary: '0 0 20px rgba(99, 102, 241, 0.4)',
  shadowCard: '0 2px 12px rgba(0, 0, 0, 0.3)',
  shadowElevated: '0 8px 32px rgba(0, 0, 0, 0.4)',
  shadowBankCard: '0 8px 32px rgba(67, 56, 202, 0.35)',
};

const PERSONAS = [
  { id: 'teen', emoji: '🎒' },
  { id: 'student', emoji: '🎓' },
  { id: 'young_adult', emoji: '💼' },
  { id: 'parent', emoji: '👨‍👩‍👧' },
];

const PERSONA_GRADIENTS: Record<string, string> = {
  teen: 'linear-gradient(135deg, #0D9488 0%, #22D3EE 100%)',
  student: 'linear-gradient(135deg, #4338CA 0%, #7C3AED 100%)',
  young_adult: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
  parent: 'linear-gradient(135deg, #D97706 0%, #F97316 100%)',
};

const PERSONA_GLOWS: Record<string, string> = {
  teen: '0 8px 32px rgba(34, 211, 238, 0.3)',
  student: '0 8px 32px rgba(99, 102, 241, 0.3)',
  young_adult: '0 8px 32px rgba(236, 72, 153, 0.3)',
  parent: '0 8px 32px rgba(249, 115, 22, 0.3)',
};

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
  const [showAllGames, setShowAllGames] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredPersona, setHoveredPersona] = useState<string | null>(null);

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

  if (loading) return <div style={{ minHeight: '100vh', background: dk.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: dk.textSecondary }}>{t('common.loading')}</p></div>;
  if (!user) return <div style={{ minHeight: '100vh', background: dk.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: dk.textSecondary }}>{t('dashboard.redirecting')}</p></div>;

  const visibleGames = showAllGames ? games : games.slice(0, 4);

  return (
    <div style={{ minHeight: '100vh', background: dk.background }}>
      {/* Dark gradient header */}
      <div style={{
        background: dk.primaryGradient,
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
              minHeight: 44, transition: 'all 0.2s',
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
            <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, color: dk.textPrimary, marginBottom: 16 }}>
              {t('home.yourGames') || 'Your Games'}
            </h2>
            {visibleGames.map(game => {
              const gradient = PERSONA_GRADIENTS[game.persona] || dk.cardGradient;
              const glow = PERSONA_GLOWS[game.persona] || dk.shadowBankCard;
              const isHovered = hoveredCard === game.id;
              return (
                <div
                  key={game.id}
                  onClick={() => router.push(`/game/${game.id}`)}
                  onMouseEnter={() => setHoveredCard(game.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: gradient,
                    borderRadius: radius.lg,
                    padding: isMobile ? 16 : 20,
                    marginBottom: 14,
                    cursor: 'pointer',
                    boxShadow: isHovered ? glow : dk.shadowCard,
                    color: '#FFFFFF',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {/* Decorative circles */}
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, background: 'rgba(255,255,255,0.08)' }} />
                  <div style={{ position: 'absolute', bottom: -30, right: 40, width: 100, height: 100, borderRadius: 50, background: 'rgba(255,255,255,0.05)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14 }}>
                      <span style={{ fontSize: isMobile ? 32 : 40 }}>{PERSONAS.find(p => p.id === game.persona)?.emoji || '🎮'}</span>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: isMobile ? 15 : 17, margin: 0, textTransform: 'capitalize' }}>{game.persona.replace('_', ' ')}</p>
                        <p style={{ fontSize: 13, opacity: 0.85, margin: '2px 0 0' }}>{t('game.level', { level: game.level })} · {game.xp} XP</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 13, opacity: 0.7, margin: 0 }}>{game.currency}</p>
                      <span style={{
                        display: 'inline-block', marginTop: 4, padding: '3px 10px', borderRadius: radius.pill,
                        fontSize: 12, fontWeight: 500,
                        background: game.status === 'active' ? 'rgba(52,211,153,0.25)' : 'rgba(255,255,255,0.15)',
                      }}>
                        {game.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Show more / Show less */}
            {games.length > 4 && (
              <button
                onClick={() => setShowAllGames(!showAllGames)}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: radius.md,
                  background: 'transparent', border: `1px solid ${dk.border}`,
                  cursor: 'pointer', fontSize: 14, fontWeight: 600, color: dk.primary,
                  transition: 'all 0.2s', marginTop: 4,
                }}
              >
                {showAllGames ? 'Show less' : `Show more (${games.length - 4} more)`}
              </button>
            )}
          </div>
        )}

        {/* Welcome card when no games */}
        {games.length === 0 && !showNewGame && (
          <div style={{
            background: dk.surface, borderRadius: radius.xl, padding: isMobile ? 24 : 32,
            boxShadow: dk.shadowElevated, textAlign: 'center', marginBottom: 24,
            border: `1px solid ${dk.border}`,
          }}>
            <span style={{ fontSize: isMobile ? 44 : 56 }}>🎮</span>
            <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, color: dk.textPrimary, margin: '16px 0 8px' }}>
              {t('dashboard.welcomeTitle') || 'Welcome to MoneyLife!'}
            </h2>
            <p style={{ fontSize: 15, color: dk.textSecondary, lineHeight: '1.6', margin: '0 0 24px', maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
              {t('dashboard.welcomeDesc') || 'Start your first financial journey. Choose a persona, make smart money decisions, and level up your financial skills!'}
            </p>
            <button onClick={() => setShowNewGame(true)} style={{
              padding: '14px 32px', borderRadius: radius.md, background: dk.primaryGradient,
              color: '#FFFFFF', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
              height: 52, width: isMobile ? '100%' : 'auto',
              boxShadow: dk.glowPrimary,
            }}>
              {t('dashboard.createFirst') || 'Create Your First Game'}
            </button>
          </div>
        )}

        {/* New Game button / panel */}
        {!showNewGame && games.length > 0 && (
          <button onClick={() => setShowNewGame(true)} style={{
            width: '100%', padding: 20, borderRadius: radius.lg,
            background: dk.surface, border: `2px dashed ${dk.border}`,
            cursor: 'pointer', fontSize: 16, fontWeight: 600, color: dk.primary,
            boxShadow: dk.shadowCard, minHeight: 52,
            transition: 'all 0.2s',
          }}>
            🎮 {t('home.startNewGame') || 'Start New Game'}
          </button>
        )}
        {showNewGame && (
          <div style={{
            background: dk.surface, borderRadius: radius.xl, padding: isMobile ? 20 : 28,
            boxShadow: dk.shadowElevated, border: `1px solid ${dk.border}`,
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: dk.textPrimary, marginBottom: 20 }}>
              {t('onboarding.personaSelect') || 'Choose Your Persona'}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {PERSONAS.map(p => {
                const isSelected = selectedPersona === p.id;
                const isHovered = hoveredPersona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id)}
                    onMouseEnter={() => setHoveredPersona(p.id)}
                    onMouseLeave={() => setHoveredPersona(null)}
                    style={{
                      display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 8,
                      padding: isMobile ? 14 : 18, borderRadius: radius.md,
                      border: `2px solid ${isSelected ? dk.primary : dk.border}`,
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : dk.surfaceElevated,
                      cursor: 'pointer', transition: 'all 0.2s', minHeight: 44,
                      boxShadow: isSelected ? dk.glowPrimary : (isHovered ? '0 0 10px rgba(99, 102, 241, 0.2)' : 'none'),
                      transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 28 : 32 }}>{p.emoji}</span>
                    <span style={{ fontWeight: 600, fontSize: 14, color: isSelected ? dk.primary : dk.textPrimary, textTransform: 'capitalize' }}>
                      {t(`onboarding.persona${p.id.charAt(0).toUpperCase() + p.id.slice(1).replace('_a', 'A')}`) || p.id.replace('_', ' ')}
                    </span>
                  </button>
                );
              })}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 600, color: dk.textPrimary, margin: '24px 0 12px' }}>
              {t('onboarding.selectDifficulty') || 'Difficulty'}
            </h3>
            <div style={{ display: 'flex', gap: 10 }}>
              {DIFFICULTIES.map(d => (
                <button key={d} onClick={() => setSelectedDifficulty(d)} style={{
                  flex: 1, padding: '12px 16px', borderRadius: radius.pill,
                  border: `2px solid ${selectedDifficulty === d ? dk.primary : dk.border}`,
                  background: selectedDifficulty === d ? 'rgba(99, 102, 241, 0.15)' : dk.surfaceElevated,
                  cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
                  color: selectedDifficulty === d ? dk.primary : dk.textSecondary,
                  textTransform: 'capitalize', minHeight: 44,
                }}>
                  {t(`onboarding.difficulty${d.charAt(0).toUpperCase() + d.slice(1)}`) || d}
                </button>
              ))}
            </div>

            {error && <p style={{ color: dk.danger, marginTop: 16, fontSize: 14, padding: '10px 14px', background: 'rgba(251, 113, 133, 0.1)', borderRadius: radius.sm, border: `1px solid rgba(251, 113, 133, 0.2)` }}>{error}</p>}

            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexDirection: isMobile ? 'column-reverse' : 'row' }}>
              <button onClick={handleCreateGame} disabled={creating} style={{
                flex: 1, height: 52, borderRadius: radius.md, background: dk.primaryGradient,
                color: '#FFFFFF', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer',
                opacity: creating ? 0.7 : 1, boxShadow: dk.glowPrimary,
              }}>
                {creating ? t('dashboard.creating') : (t('onboarding.startGame') || '🚀 Start Game')}
              </button>
              <button onClick={() => setShowNewGame(false)} style={{
                padding: '0 24px', height: 52, borderRadius: radius.md,
                background: dk.surfaceElevated, color: dk.textSecondary,
                fontSize: 16, fontWeight: 600, border: `1px solid ${dk.border}`, cursor: 'pointer',
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
        background: 'rgba(33, 27, 58, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: `1px solid ${dk.border}`,
        padding: '10px 0 14px', display: 'flex', justifyContent: 'space-around',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom, 14px)',
      }}>
        {[
          { icon: '🏠', label: isMobile ? '' : 'Home', href: '/dashboard', active: true },
          { icon: '👥', label: isMobile ? '' : 'Social', href: '/social' },
          { icon: '🏆', label: isMobile ? '' : 'Leaderboard', href: '/leaderboard' },
          { icon: '🛒', label: isMobile ? '' : 'Shop', href: '/shop' },
        ].map(tab => (
          <Link key={tab.href} href={tab.href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            textDecoration: 'none',
            color: tab.active ? dk.primary : dk.textMuted,
            minWidth: 44, minHeight: 44, justifyContent: 'center',
            textShadow: tab.active ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none',
          }}>
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            {tab.label && <span style={{ fontSize: 11, fontWeight: tab.active ? 600 : 400 }}>{tab.label}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../src/lib/auth-context';
import { api, type GameResponse } from '../../../../src/lib/api';
import { radius } from '../../../../src/lib/design-tokens';
import { getPetState, getPetStage, getPetSpecies, getPetMoodText, getPetName, getHabitatElements, SPECIES_COLORS } from '../../../../src/lib/pet-utils';
import VirtualPet from '../../../../src/components/VirtualPet';
import PetHabitat from '../../../../src/components/PetHabitat';
import { useIsMobile } from '../../../../src/hooks/useIsMobile';

const dk = {
  background: '#0F0B1E',
  surface: '#211B3A',
  surfaceHover: '#2A2248',
  surfaceElevated: '#2D2545',
  textPrimary: '#F1F0FF',
  textSecondary: '#A5A0C8',
  textMuted: '#6B6490',
  border: '#2D2545',
  primary: '#6366F1',
  primaryGradient: 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #818CF8 100%)',
  accentCyan: '#22D3EE',
  accentGold: '#FCD34D',
  glowPrimary: '0 0 20px rgba(99, 102, 241, 0.4)',
  shadowCard: '0 2px 12px rgba(0, 0, 0, 0.3)',
  shadowElevated: '0 8px 32px rgba(0, 0, 0, 0.4)',
};

const STAGE_LABELS: Record<number, string> = { 1: 'Baby', 2: 'Adolescent', 3: 'Majestic' };
const SPECIES_EMOJI: Record<string, string> = { fox: '🦊', owl: '🦉', wolf: '🐺', dragon: '🐉' };

export default function PetPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<GameResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (user && gameId) {
      api.game.get(gameId).then(res => {
        if (res.ok && res.data) setGame(res.data);
        setLoading(false);
      });
    }
  }, [user, authLoading, router, gameId]);

  if (loading || authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: dk.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: dk.textSecondary }}>Loading...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div style={{ minHeight: '100vh', background: dk.background, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: dk.textMuted }}>Game not found</p>
      </div>
    );
  }

  const petState = getPetState(game);
  const petStage = getPetStage(game.level);
  const petSpecies = getPetSpecies(game.persona);
  const petName = getPetName(game.persona, petStage);
  const mood = getPetMoodText(petState);
  const speciesColors = SPECIES_COLORS[petSpecies];
  const habitatElements = getHabitatElements(game.level);
  const daysPlayed = game.currentDate ? Math.max(1, new Date(game.currentDate).getDate()) : 1;

  // Next stage preview
  const nextStage = petStage < 3 ? petStage + 1 : null;
  const nextStageName = nextStage ? STAGE_LABELS[nextStage] : null;
  const nextStageLevel = petStage === 1 ? 4 : petStage === 2 ? 7 : null;

  return (
    <div style={{ minHeight: '100vh', background: dk.background }}>
      {/* Header */}
      <div style={{
        background: dk.primaryGradient,
        padding: isMobile ? '16px 16px 20px' : '20px 24px 24px',
        borderRadius: `0 0 ${radius.xl}px ${radius.xl}px`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 800, margin: '0 auto' }}>
          <button onClick={() => router.push(`/game/${gameId}`)} style={{
            width: 44, height: 44, borderRadius: radius.sm,
            border: 'none', background: 'rgba(255,255,255,0.2)', color: '#FFF',
            fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>←</button>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <span style={{ fontSize: 28 }}>{SPECIES_EMOJI[petSpecies]}</span>
            <h1 style={{ margin: '4px 0 0', fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#FFF' }}>
              {petName}
            </h1>
          </div>
          <div style={{ width: 44 }} />
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: isMobile ? '16px 16px 100px' : '24px 24px 100px' }}>
        {/* Large habitat */}
        <PetHabitat game={game} height={isMobile ? 300 : 400} showStats={false} />

        {/* Pet stats cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          marginBottom: 20,
        }}>
          {/* Mood */}
          <div style={{
            padding: 16,
            borderRadius: radius.lg,
            background: dk.surface,
            border: `1px solid ${dk.border}`,
            textAlign: 'center',
            boxShadow: dk.shadowCard,
          }}>
            <span style={{ fontSize: 28 }}>{mood.emoji}</span>
            <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 600, color: dk.textSecondary }}>Mood</p>
            <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: dk.textPrimary }}>{mood.text}</p>
          </div>
          {/* Days Together */}
          <div style={{
            padding: 16,
            borderRadius: radius.lg,
            background: dk.surface,
            border: `1px solid ${dk.border}`,
            textAlign: 'center',
            boxShadow: dk.shadowCard,
          }}>
            <span style={{ fontSize: 28 }}>📅</span>
            <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 600, color: dk.textSecondary }}>Days Together</p>
            <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: dk.textPrimary }}>{daysPlayed}</p>
          </div>
          {/* Evolution */}
          <div style={{
            padding: 16,
            borderRadius: radius.lg,
            background: dk.surface,
            border: `1px solid ${dk.border}`,
            textAlign: 'center',
            boxShadow: dk.shadowCard,
          }}>
            <span style={{ fontSize: 28 }}>✨</span>
            <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 600, color: dk.textSecondary }}>Stage</p>
            <p style={{ margin: '2px 0 0', fontSize: 14, fontWeight: 700, color: speciesColors.primary }}>{STAGE_LABELS[petStage]}</p>
          </div>
        </div>

        {/* Unlocked habitat elements */}
        <div style={{
          padding: 16,
          borderRadius: radius.lg,
          background: dk.surface,
          border: `1px solid ${dk.border}`,
          marginBottom: 20,
          boxShadow: dk.shadowCard,
        }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: dk.textPrimary }}>
            🏡 Habitat Unlocks
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              { key: 'ground', label: 'Ground', emoji: '🌿', level: 1 },
              { key: 'sky', label: 'Sky', emoji: '🌌', level: 1 },
              { key: 'tree', label: 'Tree', emoji: '🌳', level: 2 },
              { key: 'house', label: 'House', emoji: '🏠', level: 4 },
              { key: 'decorations', label: 'Decorations', emoji: '🌸', level: 6 },
              { key: 'palace', label: 'Palace', emoji: '🏰', level: 8 },
            ].map(item => {
              const unlocked = habitatElements.includes(item.key);
              return (
                <div key={item.key} style={{
                  padding: '6px 12px',
                  borderRadius: radius.pill,
                  background: unlocked ? `${speciesColors.primary}20` : dk.surfaceElevated,
                  border: `1px solid ${unlocked ? speciesColors.primary + '40' : dk.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  opacity: unlocked ? 1 : 0.4,
                }}>
                  <span style={{ fontSize: 14 }}>{item.emoji}</span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: unlocked ? dk.textPrimary : dk.textMuted,
                  }}>
                    {item.label}
                  </span>
                  {!unlocked && (
                    <span style={{ fontSize: 10, color: dk.textMuted }}>Lv.{item.level}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Next evolution preview */}
        {nextStage && nextStageLevel && (
          <div style={{
            padding: 20,
            borderRadius: radius.lg,
            background: dk.surface,
            border: `1px solid ${dk.border}`,
            marginBottom: 20,
            boxShadow: dk.shadowCard,
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: dk.textPrimary }}>
              🔮 Next Evolution
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Grayed out silhouette of next stage */}
              <div style={{
                opacity: 0.2,
                filter: 'brightness(0.3) contrast(0.5)',
              }}>
                <VirtualPet
                  species={petSpecies}
                  stage={nextStage as 1 | 2 | 3}
                  state="healthy"
                  size="mini"
                />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: dk.textPrimary }}>
                  {nextStageName} {petName.split(' ')[0]}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: dk.textSecondary }}>
                  Reach Level {nextStageLevel} to evolve
                </p>
                {/* Progress to next stage */}
                <div style={{
                  marginTop: 8,
                  height: 6,
                  borderRadius: 3,
                  background: dk.surfaceElevated,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    borderRadius: 3,
                    width: `${Math.min(100, ((game.level - (nextStageLevel - 3)) / 3) * 100)}%`,
                    background: speciesColors.primary,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: dk.textMuted }}>
                  Level {game.level} / {nextStageLevel}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back to game button */}
        <Link href={`/game/${gameId}`} style={{
          display: 'block',
          textAlign: 'center',
          padding: '14px 28px',
          borderRadius: radius.md,
          background: dk.primaryGradient,
          color: '#FFF',
          fontSize: 16,
          fontWeight: 700,
          textDecoration: 'none',
          boxShadow: dk.glowPrimary,
        }}>
          Back to Game
        </Link>
      </div>

      {/* Bottom Nav */}
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
          { icon: '🏠', label: isMobile ? '' : 'Home', href: '/dashboard' },
          { icon: '🐾', label: isMobile ? '' : 'Pet', href: `/pet/${gameId}`, active: true },
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

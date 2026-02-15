'use client';

import React from 'react';
import type { GameResponse } from '../lib/api';
import { radius } from '../lib/design-tokens';
import { getPetState, getPetStage, getPetSpecies, getPetMoodText, getPetName, getHabitatElements, SPECIES_COLORS } from '../lib/pet-utils';
import type { PetState } from '../lib/pet-utils';
import VirtualPet from './VirtualPet';
import { useIsMobile } from '../hooks/useIsMobile';

const dk = {
  surface: '#211B3A',
  surfaceElevated: '#2D2545',
  textPrimary: '#F1F0FF',
  textSecondary: '#A5A0C8',
  textMuted: '#6B6490',
  border: '#2D2545',
  primary: '#6366F1',
  accentCyan: '#22D3EE',
  accentGold: '#FCD34D',
  glowCyan: '0 0 15px rgba(34, 211, 238, 0.3)',
  shadowCard: '0 2px 12px rgba(0, 0, 0, 0.3)',
};

interface PetHabitatProps {
  game: GameResponse;
  height?: number;
  showStats?: boolean;
}

function HabitatScene({ level, state, streakDays, height }: { level: number; state: PetState; streakDays: number; height: number }): React.ReactElement {
  const elements = getHabitatElements(level);
  const hasTree = elements.includes('tree');
  const hasHouse = elements.includes('house');
  const hasDecorations = elements.includes('decorations');
  const hasPalace = elements.includes('palace');

  return (
    <svg viewBox="0 0 400 220" width="100%" height={height} preserveAspectRatio="xMidYMax meet" style={{ display: 'block' }}>
      {/* Sky */}
      <defs>
        <linearGradient id="sky-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          {state === 'struggling' ? (
            <>
              <stop offset="0%" stopColor="#1a1a2e" />
              <stop offset="40%" stopColor="#2d2045" />
              <stop offset="100%" stopColor="#3a2060" />
            </>
          ) : streakDays === 0 ? (
            <>
              <stop offset="0%" stopColor="#2d1b4e" />
              <stop offset="40%" stopColor="#4a2040" />
              <stop offset="100%" stopColor="#6b3a2a" />
            </>
          ) : state === 'worried' ? (
            <>
              <stop offset="0%" stopColor="#1e1845" />
              <stop offset="40%" stopColor="#2d2560" />
              <stop offset="100%" stopColor="#3a3070" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#0c1445" />
              <stop offset="40%" stopColor="#1a2565" />
              <stop offset="100%" stopColor="#2d3a80" />
            </>
          )}
        </linearGradient>
        <linearGradient id="ground-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a3a20" />
          <stop offset="100%" stopColor="#0f2815" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="400" height="220" fill="url(#sky-grad)" />

      {/* Stars */}
      {[
        { x: 30, y: 20, r: 1.5 }, { x: 80, y: 35, r: 1 }, { x: 150, y: 15, r: 1.8 },
        { x: 220, y: 28, r: 1.2 }, { x: 290, y: 12, r: 1.5 }, { x: 350, y: 38, r: 1 },
        { x: 370, y: 18, r: 1.3 }, { x: 120, y: 42, r: 0.8 }, { x: 310, y: 30, r: 1.1 },
      ].map((star, i) => (
        <circle key={i} cx={star.x} cy={star.y} r={star.r} fill="#FFFFFF" opacity={state === 'struggling' ? 0.2 : 0.5} />
      ))}

      {/* Clouds */}
      {state !== 'struggling' && (
        <g opacity="0.15">
          <ellipse cx="80" cy="55" rx="30" ry="10" fill="#FFFFFF" style={{ animation: 'habitatCloud 30s linear infinite' }} />
          <ellipse cx="300" cy="40" rx="25" ry="8" fill="#FFFFFF" style={{ animation: 'habitatCloud 35s linear 10s infinite' }} />
        </g>
      )}

      {/* Storm clouds for struggling */}
      {state === 'struggling' && (
        <g opacity="0.3">
          <ellipse cx="100" cy="50" rx="50" ry="15" fill="#333" />
          <ellipse cx="130" cy="48" rx="40" ry="12" fill="#2a2a3a" />
          <ellipse cx="280" cy="45" rx="45" ry="14" fill="#333" />
          <ellipse cx="310" cy="43" rx="35" ry="11" fill="#2a2a3a" />
        </g>
      )}

      {/* Ground — grassy hill */}
      <path d="M0,170 Q100,155 200,165 Q300,155 400,170 L400,220 L0,220 Z" fill="url(#ground-grad)" />
      {/* Grass top highlight */}
      <path d="M0,170 Q100,155 200,165 Q300,155 400,170" fill="none" stroke="#2a5a30" strokeWidth="2" opacity="0.5" />

      {/* Grass tufts */}
      {[30, 70, 130, 250, 320, 370].map((x, i) => (
        <g key={i} opacity="0.4">
          <line x1={x} y1={168 - Math.sin(x / 50) * 5} x2={x - 3} y2={162 - Math.sin(x / 50) * 5} stroke="#3a8a40" strokeWidth="1.5" />
          <line x1={x} y1={168 - Math.sin(x / 50) * 5} x2={x + 3} y2={163 - Math.sin(x / 50) * 5} stroke="#3a8a40" strokeWidth="1.5" />
        </g>
      ))}

      {/* Tree (level 2+) */}
      {hasTree && (
        <g>
          <rect x="55" y="130" width="8" height="38" rx="3" fill="#4a3020" />
          <circle cx="59" cy="118" r="20" fill="#1a6a25" opacity="0.8" />
          <circle cx="50" cy="125" r="14" fill="#1a6a25" opacity="0.7" />
          <circle cx="68" cy="122" r="16" fill="#228a30" opacity="0.6" />
          {/* Fruits/detail */}
          {state === 'thriving' && (
            <>
              <circle cx="48" cy="120" r="3" fill="#EF4444" opacity="0.7" />
              <circle cx="70" cy="115" r="2.5" fill="#EF4444" opacity="0.6" />
            </>
          )}
        </g>
      )}

      {/* House (level 4+) */}
      {hasHouse && !hasPalace && (
        <g>
          <rect x="300" y="140" width="40" height="30" rx="2" fill="#3a2845" />
          <polygon points="295,140 320,118 345,140" fill="#5a2030" />
          {/* Door */}
          <rect x="315" y="155" width="10" height="15" rx="2" fill="#2a1835" />
          <circle cx="323" cy="163" r="1" fill="#FCD34D" opacity="0.6" />
          {/* Window */}
          <rect x="305" y="148" width="8" height="8" rx="1" fill="#FCD34D" opacity="0.3" />
          {/* Chimney */}
          <rect x="330" y="120" width="6" height="18" rx="1" fill="#4a3050" />
        </g>
      )}

      {/* Palace (level 8) */}
      {hasPalace && (
        <g>
          <rect x="290" y="130" width="55" height="40" rx="3" fill="#4a3855" />
          {/* Towers */}
          <rect x="286" y="115" width="14" height="55" rx="2" fill="#5a4065" />
          <rect x="336" y="115" width="14" height="55" rx="2" fill="#5a4065" />
          {/* Tower caps */}
          <polygon points="283,115 293,98 303,115" fill="#FCD34D" opacity="0.5" />
          <polygon points="333,115 343,98 353,115" fill="#FCD34D" opacity="0.5" />
          {/* Main roof */}
          <polygon points="286,130 318,105 350,130" fill="#FCD34D" opacity="0.4" />
          {/* Windows */}
          <rect x="302" y="138" width="8" height="10" rx="4" fill="#FCD34D" opacity="0.25" />
          <rect x="316" y="138" width="8" height="10" rx="4" fill="#FCD34D" opacity="0.25" />
          <rect x="330" y="138" width="8" height="10" rx="4" fill="#FCD34D" opacity="0.25" />
          {/* Grand door */}
          <rect x="310" y="152" width="16" height="18" rx="8" fill="#3a2845" />
          <circle cx="324" cy="162" r="1.5" fill="#FCD34D" opacity="0.6" />
          {/* Flag */}
          <line x1="318" y1="105" x2="318" y2="90" stroke="#FCD34D" strokeWidth="1" opacity="0.6" />
          <polygon points="318,90 330,95 318,100" fill="#FCD34D" opacity="0.4" />
        </g>
      )}

      {/* Decorations (level 6+) */}
      {hasDecorations && (
        <g opacity="0.5">
          {/* Flowers */}
          <circle cx="140" cy="168" r="3" fill="#F472B6" />
          <circle cx="140" cy="168" r="1.5" fill="#FCD34D" />
          <circle cx="260" cy="165" r="3" fill="#818CF8" />
          <circle cx="260" cy="165" r="1.5" fill="#FCD34D" />
          <circle cx="170" cy="172" r="2.5" fill="#22D3EE" />
          <circle cx="170" cy="172" r="1.2" fill="#FFF" />
          {/* Fence */}
          {[220, 230, 240].map(x => (
            <g key={x}>
              <rect x={x} y="160" width="3" height="12" rx="1" fill="#5a4a30" opacity="0.4" />
            </g>
          ))}
          <rect x="218" y="164" width="28" height="2" rx="1" fill="#5a4a30" opacity="0.3" />
        </g>
      )}

      {/* Path to pet */}
      <path d="M200,185 Q200,180 200,175" fill="none" stroke="#2a4a2a" strokeWidth="20" strokeLinecap="round" opacity="0.2" />
    </svg>
  );
}

export default function PetHabitat({ game, height = 220, showStats = true }: PetHabitatProps): React.ReactElement {
  const isMobile = useIsMobile();
  const petState = getPetState(game);
  const petStage = getPetStage(game.level);
  const petSpecies = getPetSpecies(game.persona);
  const petName = getPetName(game.persona, petStage);
  const mood = getPetMoodText(petState);
  const speciesColors = SPECIES_COLORS[petSpecies];
  const streakDays = game.streakDays ?? 0;

  const xpPct = game.xpToNextLevel ? Math.min(100, (game.xp / game.xpToNextLevel) * 100) : 0;
  const xpNearMax = xpPct > 80;

  return (
    <div style={{
      borderRadius: radius.lg,
      overflow: 'hidden',
      background: dk.surface,
      boxShadow: dk.shadowCard,
      border: `1px solid ${dk.border}`,
      marginBottom: 20,
    }}>
      {/* Habitat scene with pet overlay */}
      <div style={{ position: 'relative', height, overflow: 'hidden' }}>
        <HabitatScene level={game.level} state={petState} streakDays={streakDays} height={height} />
        {/* Pet centered on ground */}
        <div style={{
          position: 'absolute',
          bottom: height * 0.1,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2,
        }}>
          <VirtualPet
            species={petSpecies}
            stage={petStage}
            state={petState}
            size="normal"
            interactive
          />
        </div>
      </div>

      {/* Pet info bar */}
      {showStats && (
        <div style={{ padding: isMobile ? '12px 14px' : '14px 20px' }}>
          {/* Name + Level + Mood */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: isMobile ? 16 : 18,
                fontWeight: 700,
                color: dk.textPrimary,
              }}>{petName}</span>
              <span style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: radius.pill,
                background: speciesColors.glow,
                color: speciesColors.primary,
                fontSize: 11,
                fontWeight: 700,
              }}>Lv.{game.level}</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 10px',
              borderRadius: radius.pill,
              background: dk.surfaceElevated,
            }}>
              <span style={{ fontSize: 14 }}>{mood.emoji}</span>
              <span style={{
                fontSize: 12,
                fontWeight: 600,
                color: petState === 'thriving' ? dk.accentGold : petState === 'struggling' ? '#FB7185' : dk.textSecondary,
              }}>{mood.text}</span>
            </div>
          </div>

          {/* XP progress bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: dk.textMuted }}>XP to next level</span>
              <span style={{ fontSize: 11, color: dk.textMuted }}>{game.xp}{game.xpToNextLevel ? ` / ${game.xpToNextLevel}` : ''}</span>
            </div>
            <div style={{
              height: 6,
              borderRadius: 3,
              background: dk.surfaceElevated,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                borderRadius: 3,
                width: `${xpPct}%`,
                background: dk.accentCyan,
                boxShadow: xpNearMax ? dk.glowCyan : 'none',
                animation: xpNearMax ? 'pulse 1.5s ease-in-out infinite' : 'none',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

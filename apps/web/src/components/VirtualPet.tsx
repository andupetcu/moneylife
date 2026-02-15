'use client';

import React, { useState } from 'react';
import type { PetState, PetStage, PetSpecies } from '../lib/pet-utils';
import { SPECIES_COLORS } from '../lib/pet-utils';

interface VirtualPetProps {
  species: PetSpecies;
  stage: PetStage;
  state: PetState;
  size?: 'mini' | 'normal' | 'large';
  interactive?: boolean;
  evolving?: boolean;
}

const SIZE_MAP = { mini: 64, normal: 160, large: 240 };

const STATE_ANIMATION: Record<PetState, string> = {
  thriving: 'petBounce 2s ease-in-out infinite',
  healthy: 'petFloat 3s ease-in-out infinite',
  worried: 'petShiver 2s ease-in-out infinite',
  struggling: 'petSad 3s ease-in-out infinite',
};

export default function VirtualPet({ species, stage, state, size = 'normal', interactive = false, evolving = false }: VirtualPetProps): React.ReactElement {
  const [interacting, setInteracting] = useState(false);
  const px = SIZE_MAP[size];
  const c = SPECIES_COLORS[species];

  const handleClick = () => {
    if (interactive && !interacting) {
      setInteracting(true);
      setTimeout(() => setInteracting(false), 800);
    }
  };

  const anim = evolving
    ? 'petEvolve 1.2s ease-in-out'
    : interacting
      ? 'petInteract 0.8s ease-in-out'
      : STATE_ANIMATION[state];

  const muted = state === 'struggling' ? 0.7 : 1;

  return (
    <div
      onClick={handleClick}
      style={{
        width: px,
        height: px,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: interactive ? 'pointer' : 'default',
      }}
    >
      {/* Glow behind pet */}
      {size !== 'mini' && (
        <div style={{
          position: 'absolute',
          width: px * 0.6,
          height: px * 0.3,
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${c.glow}, transparent 70%)`,
          opacity: state === 'thriving' ? 0.8 : state === 'struggling' ? 0.2 : 0.5,
        }} />
      )}

      {/* Pet SVG */}
      <svg
        viewBox="0 0 200 200"
        width={px}
        height={px}
        style={{
          animation: anim,
          opacity: muted,
          filter: state === 'struggling' ? 'saturate(0.5)' : 'none',
        }}
      >
        <defs>
          <radialGradient id={`glow-${species}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={c.primary} stopOpacity="0.3" />
            <stop offset="100%" stopColor={c.primary} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`body-${species}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.primary} />
            <stop offset="100%" stopColor={c.secondary} />
          </linearGradient>
          <linearGradient id={`belly-${species}`} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {species === 'fox' && <FoxSVG stage={stage} state={state} c={c} />}
        {species === 'owl' && <OwlSVG stage={stage} state={state} c={c} />}
        {species === 'wolf' && <WolfSVG stage={stage} state={state} c={c} />}
        {species === 'dragon' && <DragonSVG stage={stage} state={state} c={c} />}
      </svg>

      {/* Sparkle particles (thriving only) */}
      {state === 'thriving' && size !== 'mini' && (
        <>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              position: 'absolute',
              width: 6,
              height: 6,
              borderRadius: 3,
              background: c.secondary,
              top: `${15 + Math.sin(i * 1.05) * 30}%`,
              left: `${20 + Math.cos(i * 1.05) * 30}%`,
              animation: `petSparkle 2s ease-in-out ${i * 0.3}s infinite`,
              boxShadow: `0 0 4px ${c.secondary}`,
            }} />
          ))}
        </>
      )}

      {/* Rain particles (struggling only) */}
      {state === 'struggling' && size !== 'mini' && (
        <>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{
              position: 'absolute',
              width: 2,
              height: 8,
              borderRadius: 1,
              background: 'rgba(100, 130, 180, 0.5)',
              top: '5%',
              left: `${25 + i * 12}%`,
              animation: `petRain 1.5s linear ${i * 0.3}s infinite`,
            }} />
          ))}
        </>
      )}
    </div>
  );
}

// ─── Shared helpers ────────────────────────────────────────────

interface PetSVGProps {
  stage: PetStage;
  state: PetState;
  c: { primary: string; secondary: string; glow: string };
}

function Eyes({ cx1, cx2, cy, r, state }: { cx1: number; cx2: number; cy: number; r: number; state: PetState }): React.ReactElement {
  const pupilR = r * 0.5;
  const eyeSquint = state === 'struggling' ? 0.6 : 1;

  return (
    <g>
      {/* Eye whites */}
      <ellipse cx={cx1} cy={cy} rx={r} ry={r * eyeSquint} fill="#FFFFFF" />
      <ellipse cx={cx2} cy={cy} rx={r} ry={r * eyeSquint} fill="#FFFFFF" />
      {/* Pupils */}
      <g style={{ animation: 'petBlink 4s ease-in-out infinite' }}>
        <circle cx={cx1 + 1} cy={cy} r={pupilR} fill="#1a1333" />
        <circle cx={cx2 + 1} cy={cy} r={pupilR} fill="#1a1333" />
        {/* Shine */}
        <circle cx={cx1 + 2} cy={cy - 2} r={pupilR * 0.3} fill="#FFFFFF" opacity="0.8" />
        <circle cx={cx2 + 2} cy={cy - 2} r={pupilR * 0.3} fill="#FFFFFF" opacity="0.8" />
      </g>
      {/* Blush (thriving) */}
      {state === 'thriving' && (
        <>
          <ellipse cx={cx1 - r * 0.8} cy={cy + r * 1.2} rx={r * 0.7} ry={r * 0.35} fill="#FF6B9D" opacity="0.25" />
          <ellipse cx={cx2 + r * 0.8} cy={cy + r * 1.2} rx={r * 0.7} ry={r * 0.35} fill="#FF6B9D" opacity="0.25" />
        </>
      )}
    </g>
  );
}

function Mouth({ cx, cy, state, width }: { cx: number; cy: number; state: PetState; width: number }): React.ReactElement {
  if (state === 'thriving') {
    return (
      <path d={`M${cx - width / 2},${cy} Q${cx},${cy + width * 0.6} ${cx + width / 2},${cy}`} fill="none" stroke="#1a1333" strokeWidth="2" strokeLinecap="round" />
    );
  }
  if (state === 'healthy') {
    return (
      <path d={`M${cx - width / 2.5},${cy} Q${cx},${cy + width * 0.35} ${cx + width / 2.5},${cy}`} fill="none" stroke="#1a1333" strokeWidth="1.8" strokeLinecap="round" />
    );
  }
  if (state === 'worried') {
    return (
      <path d={`M${cx - width / 3},${cy + 2} Q${cx},${cy - width * 0.15} ${cx + width / 3},${cy + 2}`} fill="none" stroke="#1a1333" strokeWidth="1.8" strokeLinecap="round" />
    );
  }
  // struggling
  return (
    <path d={`M${cx - width / 3},${cy + 4} Q${cx},${cy - width * 0.3} ${cx + width / 3},${cy + 4}`} fill="none" stroke="#1a1333" strokeWidth="2" strokeLinecap="round" />
  );
}

// ─── FOX 🦊 ───────────────────────────────────────────────────

function FoxSVG({ stage, state, c }: PetSVGProps): React.ReactElement {
  if (stage === 1) {
    // Baby fox: very round, tiny, big head
    return (
      <g>
        {/* Body */}
        <ellipse cx="100" cy="140" rx="35" ry="30" fill={`url(#body-fox)`} />
        {/* Belly */}
        <ellipse cx="100" cy="145" rx="22" ry="20" fill={`url(#belly-fox)`} />
        {/* Head */}
        <circle cx="100" cy="100" r="32" fill={c.primary} />
        {/* Face patch */}
        <ellipse cx="100" cy="108" rx="20" ry="18" fill={c.secondary} opacity="0.5" />
        {/* Ears (small triangles) */}
        <polygon points="75,78 68,55 88,72" fill={c.primary} />
        <polygon points="125,78 132,55 112,72" fill={c.primary} />
        <polygon points="77,76 72,62 86,73" fill="#FF9E80" opacity="0.6" />
        <polygon points="123,76 128,62 114,73" fill="#FF9E80" opacity="0.6" />
        {/* Eyes */}
        <Eyes cx1={88} cx2={112} cy={97} r={7} state={state} />
        {/* Nose */}
        <ellipse cx="100" cy="110" rx="4" ry="3" fill="#1a1333" />
        {/* Mouth */}
        <Mouth cx={100} cy={117} state={state} width={18} />
        {/* Tiny tail */}
        <g style={{ transformOrigin: '130px 140px', animation: state === 'thriving' ? 'petTailWag 0.6s ease-in-out infinite' : 'none' }}>
          <path d="M130,140 Q150,125 148,138" fill={c.primary} stroke={c.secondary} strokeWidth="1" />
          <circle cx="148" cy="135" r="5" fill="#FFFFFF" opacity="0.5" />
        </g>
        {/* Paws */}
        <ellipse cx="82" cy="168" rx="10" ry="6" fill={c.primary} />
        <ellipse cx="118" cy="168" rx="10" ry="6" fill={c.primary} />
      </g>
    );
  }
  if (stage === 2) {
    // Teen fox: longer body, more detail, scarf accessory
    return (
      <g>
        {/* Body */}
        <ellipse cx="100" cy="138" rx="38" ry="35" fill={`url(#body-fox)`} />
        {/* Belly */}
        <ellipse cx="100" cy="145" rx="24" ry="24" fill={`url(#belly-fox)`} />
        {/* Head */}
        <ellipse cx="100" cy="90" rx="34" ry="30" fill={c.primary} />
        {/* Face patch */}
        <ellipse cx="100" cy="100" rx="22" ry="20" fill={c.secondary} opacity="0.4" />
        {/* Ears */}
        <polygon points="72,72 60,38 90,62" fill={c.primary} />
        <polygon points="128,72 140,38 110,62" fill={c.primary} />
        <polygon points="74,68 65,48 87,63" fill="#FF9E80" opacity="0.5" />
        <polygon points="126,68 135,48 113,63" fill="#FF9E80" opacity="0.5" />
        {/* Eyes */}
        <Eyes cx1={86} cx2={114} cy={87} r={8} state={state} />
        {/* Nose */}
        <ellipse cx="100" cy="101" rx="5" ry="3.5" fill="#1a1333" />
        {/* Mouth */}
        <Mouth cx={100} cy={109} state={state} width={20} />
        {/* Whiskers */}
        <line x1="75" y1="102" x2="56" y2="98" stroke={c.secondary} strokeWidth="1" opacity="0.5" />
        <line x1="75" y1="106" x2="56" y2="108" stroke={c.secondary} strokeWidth="1" opacity="0.5" />
        <line x1="125" y1="102" x2="144" y2="98" stroke={c.secondary} strokeWidth="1" opacity="0.5" />
        <line x1="125" y1="106" x2="144" y2="108" stroke={c.secondary} strokeWidth="1" opacity="0.5" />
        {/* Scarf accessory */}
        <path d="M72,118 Q100,130 128,118" fill="none" stroke="#22D3EE" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        <rect x="120" y="118" width="6" height="18" rx="3" fill="#22D3EE" opacity="0.7" />
        {/* Fluffy tail */}
        <g style={{ transformOrigin: '135px 135px', animation: state === 'thriving' ? 'petTailWag 0.5s ease-in-out infinite' : 'none' }}>
          <path d="M132,135 Q162,105 158,130 Q155,145 140,145" fill={c.primary} />
          <path d="M155,125 Q152,138 142,142" fill="#FFFFFF" opacity="0.4" />
        </g>
        {/* Legs */}
        <rect x="78" y="165" width="12" height="14" rx="6" fill={c.primary} />
        <rect x="110" y="165" width="12" height="14" rx="6" fill={c.primary} />
      </g>
    );
  }
  // Stage 3: Majestic adult fox
  return (
    <g>
      {/* Glow aura */}
      <circle cx="100" cy="110" r="70" fill={`url(#glow-fox)`} />
      {/* Body */}
      <ellipse cx="100" cy="135" rx="42" ry="38" fill={`url(#body-fox)`} />
      {/* Belly */}
      <ellipse cx="100" cy="142" rx="28" ry="28" fill={`url(#belly-fox)`} />
      {/* Chest ruff */}
      <path d="M68,115 Q80,108 100,112 Q120,108 132,115 Q125,125 100,128 Q75,125 68,115" fill={c.secondary} opacity="0.5" />
      {/* Head */}
      <ellipse cx="100" cy="82" rx="36" ry="32" fill={c.primary} />
      {/* Face patch */}
      <ellipse cx="100" cy="92" rx="24" ry="22" fill={c.secondary} opacity="0.35" />
      {/* Ears (tall, elegant) */}
      <polygon points="70,65 55,25 92,55" fill={c.primary} />
      <polygon points="130,65 145,25 108,55" fill={c.primary} />
      <polygon points="72,62 60,35 88,55" fill="#FF9E80" opacity="0.5" />
      <polygon points="128,62 140,35 112,55" fill="#FF9E80" opacity="0.5" />
      {/* Ear tufts */}
      <line x1="58" y1="30" x2="52" y2="20" stroke={c.secondary} strokeWidth="2" strokeLinecap="round" />
      <line x1="142" y1="30" x2="148" y2="20" stroke={c.secondary} strokeWidth="2" strokeLinecap="round" />
      {/* Eyes */}
      <Eyes cx1={84} cx2={116} cy={80} r={9} state={state} />
      {/* Nose */}
      <ellipse cx="100" cy="95" rx="5" ry="4" fill="#1a1333" />
      {/* Mouth */}
      <Mouth cx={100} cy={104} state={state} width={22} />
      {/* Whiskers */}
      <line x1="72" y1="95" x2="48" y2="90" stroke={c.secondary} strokeWidth="1.2" opacity="0.4" />
      <line x1="72" y1="100" x2="48" y2="102" stroke={c.secondary} strokeWidth="1.2" opacity="0.4" />
      <line x1="128" y1="95" x2="152" y2="90" stroke={c.secondary} strokeWidth="1.2" opacity="0.4" />
      <line x1="128" y1="100" x2="152" y2="102" stroke={c.secondary} strokeWidth="1.2" opacity="0.4" />
      {/* Crown/headpiece */}
      <path d="M82,58 L88,48 L94,55 L100,42 L106,55 L112,48 L118,58" fill={c.secondary} stroke={c.primary} strokeWidth="1" />
      <circle cx="100" cy="45" r="3" fill="#FFF" opacity="0.8" />
      {/* Majestic multi-tail (kitsune inspired) */}
      <g style={{ transformOrigin: '140px 130px', animation: state === 'thriving' ? 'petTailWag 0.8s ease-in-out infinite' : 'none' }}>
        <path d="M135,130 Q168,90 165,120 Q163,140 145,145" fill={c.primary} opacity="0.9" />
        <path d="M135,135 Q175,100 170,130 Q167,148 148,148" fill={c.secondary} opacity="0.6" />
        <path d="M135,140 Q160,115 160,140 Q158,150 145,152" fill={c.primary} opacity="0.7" />
        {/* Tail tips glow */}
        <circle cx="165" cy="118" r="4" fill="#FFF" opacity="0.4" />
        <circle cx="170" cy="128" r="3" fill="#FFF" opacity="0.3" />
      </g>
      {/* Legs */}
      <rect x="74" y="168" width="14" height="16" rx="7" fill={c.primary} />
      <rect x="112" y="168" width="14" height="16" rx="7" fill={c.primary} />
      {/* Paw markings */}
      <ellipse cx="81" cy="182" rx="6" ry="3" fill={c.secondary} opacity="0.3" />
      <ellipse cx="119" cy="182" rx="6" ry="3" fill={c.secondary} opacity="0.3" />
    </g>
  );
}

// ─── OWL 🦉 ───────────────────────────────────────────────────

function OwlSVG({ stage, state, c }: PetSVGProps): React.ReactElement {
  if (stage === 1) {
    // Baby owl: round fluffball
    return (
      <g>
        {/* Body */}
        <ellipse cx="100" cy="128" rx="32" ry="35" fill={c.primary} />
        {/* Belly feathers */}
        <ellipse cx="100" cy="138" rx="22" ry="25" fill={`url(#belly-owl)`} />
        {/* Feather pattern */}
        <path d="M85,130 Q90,125 95,130 Q100,125 105,130 Q110,125 115,130" fill="none" stroke={c.secondary} strokeWidth="1" opacity="0.3" />
        {/* Head (big for baby) */}
        <circle cx="100" cy="92" r="30" fill={c.primary} />
        {/* Face disc */}
        <circle cx="100" cy="95" r="24" fill={c.secondary} opacity="0.2" />
        {/* Ear tufts */}
        <ellipse cx="78" cy="68" rx="4" ry="12" fill={c.primary} transform="rotate(-15 78 68)" />
        <ellipse cx="122" cy="68" rx="4" ry="12" fill={c.primary} transform="rotate(15 122 68)" />
        {/* Big owl eyes */}
        <Eyes cx1={87} cx2={113} cy={92} r={10} state={state} />
        {/* Beak */}
        <polygon points="97,103 100,110 103,103" fill="#FFA726" />
        {/* Mouth area */}
        <Mouth cx={100} cy={114} state={state} width={14} />
        {/* Tiny wings */}
        <ellipse cx="68" cy="130" rx="10" ry="18" fill={c.secondary} opacity="0.5" transform="rotate(10 68 130)" />
        <ellipse cx="132" cy="130" rx="10" ry="18" fill={c.secondary} opacity="0.5" transform="rotate(-10 132 130)" />
        {/* Feet */}
        <path d="M88,162 L85,170 L88,168 L91,170 L88,162" fill="#FFA726" />
        <path d="M112,162 L109,170 L112,168 L115,170 L112,162" fill="#FFA726" />
      </g>
    );
  }
  if (stage === 2) {
    // Teen owl: taller, wing detail, glasses accessory
    return (
      <g>
        {/* Body */}
        <ellipse cx="100" cy="132" rx="35" ry="38" fill={c.primary} />
        {/* Belly feathers */}
        <ellipse cx="100" cy="142" rx="24" ry="28" fill={`url(#belly-owl)`} />
        {/* Feather V pattern */}
        {[0, 1, 2, 3].map(i => (
          <path key={i} d={`M${88 + i * 2},${128 + i * 8} L${100},${124 + i * 8} L${112 - i * 2},${128 + i * 8}`} fill="none" stroke={c.secondary} strokeWidth="1" opacity="0.25" />
        ))}
        {/* Head */}
        <ellipse cx="100" cy="88" rx="32" ry="28" fill={c.primary} />
        {/* Face disc */}
        <circle cx="100" cy="92" r="24" fill={c.secondary} opacity="0.15" />
        {/* Ear tufts (bigger) */}
        <polygon points="74,68 68,42 84,62" fill={c.primary} />
        <polygon points="126,68 132,42 116,62" fill={c.primary} />
        {/* Eyes */}
        <Eyes cx1={86} cx2={114} cy={88} r={10} state={state} />
        {/* Glasses accessory */}
        <circle cx="86" cy="88" r="13" fill="none" stroke={c.secondary} strokeWidth="1.5" opacity="0.6" />
        <circle cx="114" cy="88" r="13" fill="none" stroke={c.secondary} strokeWidth="1.5" opacity="0.6" />
        <line x1="99" y1="88" x2="101" y2="88" stroke={c.secondary} strokeWidth="1.5" opacity="0.6" />
        {/* Beak */}
        <polygon points="96,100 100,108 104,100" fill="#FFA726" />
        <Mouth cx={100} cy={113} state={state} width={16} />
        {/* Wings */}
        <path d="M64,118 Q55,135 60,158 Q65,150 68,138 L68,118" fill={c.secondary} opacity="0.6" />
        <path d="M136,118 Q145,135 140,158 Q135,150 132,138 L132,118" fill={c.secondary} opacity="0.6" />
        {/* Feet */}
        <path d="M86,168 L82,178 L86,175 L90,178 L94,175 L90,168" fill="#FFA726" />
        <path d="M110,168 L106,178 L110,175 L114,178 L118,175 L114,168" fill="#FFA726" />
      </g>
    );
  }
  // Stage 3: Majestic wise owl
  return (
    <g>
      {/* Glow aura */}
      <circle cx="100" cy="110" r="75" fill={`url(#glow-owl)`} />
      {/* Body */}
      <ellipse cx="100" cy="130" rx="40" ry="42" fill={c.primary} />
      {/* Belly feathers with intricate pattern */}
      <ellipse cx="100" cy="140" rx="28" ry="32" fill={`url(#belly-owl)`} />
      {[0, 1, 2, 3, 4].map(i => (
        <path key={i} d={`M${86 + i},${120 + i * 9} Q${100},${116 + i * 9} ${114 - i},${120 + i * 9}`} fill="none" stroke={c.secondary} strokeWidth="1.2" opacity="0.2" />
      ))}
      {/* Head */}
      <ellipse cx="100" cy="82" rx="36" ry="32" fill={c.primary} />
      {/* Face disc (detailed) */}
      <circle cx="100" cy="86" r="28" fill={c.secondary} opacity="0.12" />
      <circle cx="100" cy="86" r="22" fill={c.secondary} opacity="0.08" />
      {/* Tall ear tufts */}
      <polygon points="70,62 58,25 88,52" fill={c.primary} />
      <polygon points="130,62 142,25 112,52" fill={c.primary} />
      <polygon points="72,60 63,35 85,52" fill={c.secondary} opacity="0.3" />
      <polygon points="128,60 137,35 115,52" fill={c.secondary} opacity="0.3" />
      {/* Eyes */}
      <Eyes cx1={84} cx2={116} cy={82} r={11} state={state} />
      {/* Wise brow markings */}
      <path d="M72,72 Q84,68 92,72" fill="none" stroke={c.secondary} strokeWidth="2" opacity="0.4" />
      <path d="M108,72 Q116,68 128,72" fill="none" stroke={c.secondary} strokeWidth="2" opacity="0.4" />
      {/* Beak */}
      <polygon points="95,95 100,105 105,95" fill="#FFA726" />
      <Mouth cx={100} cy={110} state={state} width={18} />
      {/* Scholar hat */}
      <rect x="78" y="53" width="44" height="5" rx="2" fill="#1a1333" opacity="0.7" />
      <rect x="86" y="40" width="28" height="14" rx="3" fill="#1a1333" opacity="0.7" />
      <rect x="108" y="38" width="3" height="3" rx="1.5" fill={c.secondary} opacity="0.8" />
      {/* Grand wings spread */}
      <path d="M58,112 Q40,125 38,155 Q48,145 55,140 Q52,150 50,162 Q60,148 65,140 L65,112" fill={c.secondary} opacity="0.5" />
      <path d="M142,112 Q160,125 162,155 Q152,145 145,140 Q148,150 150,162 Q140,148 135,140 L135,112" fill={c.secondary} opacity="0.5" />
      {/* Feet */}
      <path d="M84,170 L78,182 L84,178 L90,182 L96,178 L90,170" fill="#FFA726" />
      <path d="M110,170 L104,182 L110,178 L116,182 L122,178 L116,170" fill="#FFA726" />
      {/* Wisdom sparkles */}
      <circle cx="60" cy="70" r="2" fill={c.secondary} opacity="0.5" />
      <circle cx="140" cy="65" r="2.5" fill={c.secondary} opacity="0.4" />
    </g>
  );
}

// ─── WOLF 🐺 ──────────────────────────────────────────────────

function WolfSVG({ stage, state, c }: PetSVGProps): React.ReactElement {
  if (stage === 1) {
    // Baby wolf pup: round fluffy pup
    return (
      <g>
        {/* Body */}
        <ellipse cx="100" cy="140" rx="30" ry="28" fill={c.primary} />
        {/* Belly */}
        <ellipse cx="100" cy="146" rx="20" ry="18" fill={`url(#belly-wolf)`} />
        {/* Head */}
        <circle cx="100" cy="102" r="30" fill={c.primary} />
        {/* Muzzle */}
        <ellipse cx="100" cy="112" rx="16" ry="12" fill={c.secondary} opacity="0.3" />
        {/* Ears (floppy for baby) */}
        <ellipse cx="75" cy="78" rx="8" ry="14" fill={c.primary} transform="rotate(-20 75 78)" />
        <ellipse cx="125" cy="78" rx="8" ry="14" fill={c.primary} transform="rotate(20 125 78)" />
        <ellipse cx="76" cy="80" rx="5" ry="10" fill="#FF9E80" opacity="0.3" transform="rotate(-20 76 80)" />
        <ellipse cx="124" cy="80" rx="5" ry="10" fill="#FF9E80" opacity="0.3" transform="rotate(20 124 80)" />
        {/* Eyes */}
        <Eyes cx1={88} cx2={112} cy={98} r={7} state={state} />
        {/* Nose */}
        <ellipse cx="100" cy="110" rx="5" ry="4" fill="#1a1333" />
        <Mouth cx={100} cy={118} state={state} width={16} />
        {/* Tail (small wagging) */}
        <g style={{ transformOrigin: '128px 142px', animation: state === 'thriving' ? 'petTailWag 0.4s ease-in-out infinite' : 'none' }}>
          <path d="M128,140 Q145,128 142,140" fill={c.primary} />
        </g>
        {/* Paws */}
        <ellipse cx="84" cy="166" rx="10" ry="6" fill={c.primary} />
        <ellipse cx="116" cy="166" rx="10" ry="6" fill={c.primary} />
      </g>
    );
  }
  if (stage === 2) {
    // Adolescent wolf: leaner, bandana accessory
    return (
      <g>
        {/* Body (leaner) */}
        <ellipse cx="100" cy="138" rx="34" ry="34" fill={c.primary} />
        {/* Belly */}
        <ellipse cx="100" cy="145" rx="22" ry="24" fill={`url(#belly-wolf)`} />
        {/* Head */}
        <ellipse cx="100" cy="90" rx="32" ry="28" fill={c.primary} />
        {/* Muzzle */}
        <ellipse cx="100" cy="102" rx="18" ry="14" fill={c.secondary} opacity="0.25" />
        {/* Ears (upright) */}
        <polygon points="72,70 62,38 88,60" fill={c.primary} />
        <polygon points="128,70 138,38 112,60" fill={c.primary} />
        <polygon points="74,67 66,45 86,60" fill={c.secondary} opacity="0.2" />
        <polygon points="126,67 134,45 114,60" fill={c.secondary} opacity="0.2" />
        {/* Eyes */}
        <Eyes cx1={86} cx2={114} cy={87} r={8} state={state} />
        {/* Nose */}
        <ellipse cx="100" cy="100" rx="5" ry="4" fill="#1a1333" />
        <Mouth cx={100} cy={110} state={state} width={18} />
        {/* Bandana */}
        <path d="M70,115 Q100,125 130,115" fill="none" stroke="#6366F1" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        <polygon points="98,122 100,138 102,122" fill="#6366F1" opacity="0.7" />
        {/* Fluffy tail */}
        <g style={{ transformOrigin: '135px 135px', animation: state === 'thriving' ? 'petTailWag 0.5s ease-in-out infinite' : 'none' }}>
          <path d="M132,132 Q160,108 158,130 Q156,142 142,145" fill={c.primary} />
          <path d="M155,128 Q152,136 144,142" fill="#FFFFFF" opacity="0.2" />
        </g>
        {/* Legs */}
        <rect x="78" y="166" width="12" height="14" rx="6" fill={c.primary} />
        <rect x="110" y="166" width="12" height="14" rx="6" fill={c.primary} />
      </g>
    );
  }
  // Stage 3: Majestic alpha wolf
  return (
    <g>
      {/* Glow aura */}
      <circle cx="100" cy="110" r="72" fill={`url(#glow-wolf)`} />
      {/* Body */}
      <ellipse cx="100" cy="132" rx="40" ry="40" fill={c.primary} />
      {/* Belly */}
      <ellipse cx="100" cy="140" rx="26" ry="28" fill={`url(#belly-wolf)`} />
      {/* Chest mane */}
      <path d="M65,112 Q75,105 100,108 Q125,105 135,112 Q128,122 100,126 Q72,122 65,112" fill={c.secondary} opacity="0.4" />
      {/* Head */}
      <ellipse cx="100" cy="82" rx="36" ry="30" fill={c.primary} />
      {/* Muzzle */}
      <ellipse cx="100" cy="95" rx="20" ry="15" fill={c.secondary} opacity="0.2" />
      {/* Ears (tall, proud) */}
      <polygon points="68,60 54,22 90,50" fill={c.primary} />
      <polygon points="132,60 146,22 110,50" fill={c.primary} />
      <polygon points="70,58 58,30 88,50" fill={c.secondary} opacity="0.15" />
      <polygon points="130,58 142,30 112,50" fill={c.secondary} opacity="0.15" />
      {/* Eyes */}
      <Eyes cx1={84} cx2={116} cy={80} r={9} state={state} />
      {/* Nose */}
      <ellipse cx="100" cy="95" rx="6" ry="4.5" fill="#1a1333" />
      <Mouth cx={100} cy={105} state={state} width={22} />
      {/* Moon marking on forehead */}
      <path d="M95,62 Q100,55 105,62 Q102,58 100,60 Q98,58 95,62" fill={c.secondary} opacity="0.6" />
      {/* Flowing mane behind ears */}
      <path d="M56,30 Q50,50 55,70" fill="none" stroke={c.secondary} strokeWidth="3" opacity="0.3" />
      <path d="M144,30 Q150,50 145,70" fill="none" stroke={c.secondary} strokeWidth="3" opacity="0.3" />
      {/* Majestic tail */}
      <g style={{ transformOrigin: '138px 128px', animation: state === 'thriving' ? 'petTailWag 0.7s ease-in-out infinite' : 'none' }}>
        <path d="M135,128 Q170,90 168,120 Q166,140 148,148" fill={c.primary} />
        <path d="M165,115 Q160,132 150,145" fill={c.secondary} opacity="0.3" />
        <path d="M168,118 Q164,128 155,140" fill="#FFFFFF" opacity="0.15" />
      </g>
      {/* Legs */}
      <rect x="72" y="168" width="14" height="16" rx="7" fill={c.primary} />
      <rect x="114" y="168" width="14" height="16" rx="7" fill={c.primary} />
      {/* Star on chest */}
      <polygon points="100,120 102,126 108,126 103,130 105,136 100,132 95,136 97,130 92,126 98,126" fill={c.secondary} opacity="0.5" />
    </g>
  );
}

// ─── DRAGON 🐉 ────────────────────────────────────────────────

function DragonSVG({ stage, state, c }: PetSVGProps): React.ReactElement {
  if (stage === 1) {
    // Baby dragon: chubby, stubby wings, tiny horns
    return (
      <g>
        {/* Body */}
        <ellipse cx="100" cy="138" rx="32" ry="30" fill={c.primary} />
        {/* Belly */}
        <ellipse cx="100" cy="145" rx="22" ry="22" fill={`url(#belly-dragon)`} />
        {/* Belly scales */}
        {[0, 1, 2].map(i => (
          <path key={i} d={`M${88},${134 + i * 8} Q${100},${132 + i * 8} ${112},${134 + i * 8}`} fill="none" stroke={c.secondary} strokeWidth="1" opacity="0.2" />
        ))}
        {/* Head */}
        <circle cx="100" cy="100" r="30" fill={c.primary} />
        {/* Snout */}
        <ellipse cx="100" cy="112" rx="14" ry="10" fill={c.secondary} opacity="0.25" />
        {/* Tiny horns */}
        <ellipse cx="80" cy="76" rx="3" ry="8" fill={c.secondary} transform="rotate(-15 80 76)" />
        <ellipse cx="120" cy="76" rx="3" ry="8" fill={c.secondary} transform="rotate(15 120 76)" />
        {/* Eyes */}
        <Eyes cx1={88} cx2={112} cy={96} r={8} state={state} />
        {/* Nostrils */}
        <circle cx="95" cy="110" r="2" fill="#1a1333" opacity="0.5" />
        <circle cx="105" cy="110" r="2" fill="#1a1333" opacity="0.5" />
        <Mouth cx={100} cy={118} state={state} width={16} />
        {/* Tiny wings (stubs) */}
        <path d="M65,125 Q55,110 60,100 Q62,115 68,125" fill={c.secondary} opacity="0.5" />
        <path d="M135,125 Q145,110 140,100 Q138,115 132,125" fill={c.secondary} opacity="0.5" />
        {/* Tail */}
        <path d="M130,145 Q148,150 150,138 Q145,142 142,145" fill={c.primary} />
        {/* Paws */}
        <ellipse cx="82" cy="166" rx="10" ry="6" fill={c.primary} />
        <ellipse cx="118" cy="166" rx="10" ry="6" fill={c.primary} />
      </g>
    );
  }
  if (stage === 2) {
    // Teen dragon: longer neck, real wings, spikes
    return (
      <g>
        {/* Body */}
        <ellipse cx="100" cy="140" rx="36" ry="32" fill={c.primary} />
        {/* Belly */}
        <ellipse cx="100" cy="148" rx="24" ry="24" fill={`url(#belly-dragon)`} />
        {/* Belly scales */}
        {[0, 1, 2, 3].map(i => (
          <path key={i} d={`M${86},${132 + i * 7} Q${100},${130 + i * 7} ${114},${132 + i * 7}`} fill="none" stroke={c.secondary} strokeWidth="1" opacity="0.2" />
        ))}
        {/* Neck */}
        <path d="M85,118 Q90,100 95,92 L105,92 Q110,100 115,118" fill={c.primary} />
        {/* Head */}
        <ellipse cx="100" cy="82" rx="30" ry="26" fill={c.primary} />
        {/* Snout */}
        <ellipse cx="100" cy="95" rx="16" ry="12" fill={c.secondary} opacity="0.2" />
        {/* Horns (curved) */}
        <path d="M78,65 Q72,45 68,42" fill="none" stroke={c.secondary} strokeWidth="4" strokeLinecap="round" />
        <path d="M122,65 Q128,45 132,42" fill="none" stroke={c.secondary} strokeWidth="4" strokeLinecap="round" />
        {/* Back spikes */}
        <polygon points="92,78 95,68 98,78" fill={c.secondary} opacity="0.5" />
        <polygon points="98,76 100,64 102,76" fill={c.secondary} opacity="0.5" />
        <polygon points="102,78 105,68 108,78" fill={c.secondary} opacity="0.5" />
        {/* Eyes */}
        <Eyes cx1={86} cx2={114} cy={80} r={8} state={state} />
        {/* Nostrils */}
        <circle cx="94" cy="95" r="2.5" fill="#1a1333" opacity="0.5" />
        <circle cx="106" cy="95" r="2.5" fill="#1a1333" opacity="0.5" />
        <Mouth cx={100} cy={104} state={state} width={20} />
        {/* Wings (medium) */}
        <path d="M62,120 Q42,95 38,80 Q45,90 52,92 Q48,85 50,75 Q55,88 58,95 L62,115" fill={c.secondary} opacity="0.45" />
        <path d="M138,120 Q158,95 162,80 Q155,90 148,92 Q152,85 150,75 Q145,88 142,95 L138,115" fill={c.secondary} opacity="0.45" />
        {/* Tail with spike */}
        <path d="M132,148 Q155,150 160,138 Q158,145 155,148 L152,142" fill={c.primary} />
        <polygon points="160,136 165,132 162,140" fill={c.secondary} opacity="0.6" />
        {/* Legs */}
        <rect x="76" y="168" width="12" height="14" rx="6" fill={c.primary} />
        <rect x="112" y="168" width="12" height="14" rx="6" fill={c.primary} />
      </g>
    );
  }
  // Stage 3: Majestic golden dragon
  return (
    <g>
      {/* Glow aura */}
      <circle cx="100" cy="108" r="78" fill={`url(#glow-dragon)`} />
      {/* Body */}
      <ellipse cx="100" cy="138" rx="40" ry="36" fill={c.primary} />
      {/* Belly */}
      <ellipse cx="100" cy="146" rx="28" ry="28" fill={`url(#belly-dragon)`} />
      {/* Belly scales detailed */}
      {[0, 1, 2, 3, 4].map(i => (
        <path key={i} d={`M${84},${128 + i * 7} Q${100},${126 + i * 7} ${116},${128 + i * 7}`} fill="none" stroke={c.secondary} strokeWidth="1.2" opacity="0.2" />
      ))}
      {/* Neck */}
      <path d="M82,118 Q88,95 94,85 L106,85 Q112,95 118,118" fill={c.primary} />
      {/* Neck scales */}
      <path d="M90,110 Q100,108 110,110" fill="none" stroke={c.secondary} strokeWidth="1" opacity="0.2" />
      <path d="M88,102 Q100,100 112,102" fill="none" stroke={c.secondary} strokeWidth="1" opacity="0.2" />
      {/* Head */}
      <ellipse cx="100" cy="75" rx="32" ry="28" fill={c.primary} />
      {/* Snout */}
      <ellipse cx="100" cy="90" rx="18" ry="14" fill={c.secondary} opacity="0.2" />
      {/* Grand horns */}
      <path d="M74,58 Q64,32 58,22" fill="none" stroke={c.secondary} strokeWidth="5" strokeLinecap="round" />
      <path d="M126,58 Q136,32 142,22" fill="none" stroke={c.secondary} strokeWidth="5" strokeLinecap="round" />
      {/* Horn ridges */}
      <path d="M70,50 Q68,42 66,35" fill="none" stroke={c.primary} strokeWidth="1.5" opacity="0.5" />
      <path d="M130,50 Q132,42 134,35" fill="none" stroke={c.primary} strokeWidth="1.5" opacity="0.5" />
      {/* Crown jewel between horns */}
      <circle cx="100" cy="50" r="5" fill={c.secondary} />
      <circle cx="100" cy="50" r="3" fill="#FFF" opacity="0.5" />
      {/* Back spikes (larger) */}
      <polygon points="88,72 92,58 96,72" fill={c.secondary} opacity="0.5" />
      <polygon points="95,68 100,52 105,68" fill={c.secondary} opacity="0.6" />
      <polygon points="104,72 108,58 112,72" fill={c.secondary} opacity="0.5" />
      {/* Eyes */}
      <Eyes cx1={84} cx2={116} cy={72} r={10} state={state} />
      {/* Nostrils with smoke */}
      <circle cx="92" cy="90" r="3" fill="#1a1333" opacity="0.5" />
      <circle cx="108" cy="90" r="3" fill="#1a1333" opacity="0.5" />
      {state === 'thriving' && (
        <>
          <circle cx="88" cy="84" r="3" fill={c.secondary} opacity="0.15" />
          <circle cx="85" cy="80" r="4" fill={c.secondary} opacity="0.1" />
          <circle cx="112" cy="84" r="3" fill={c.secondary} opacity="0.15" />
          <circle cx="115" cy="80" r="4" fill={c.secondary} opacity="0.1" />
        </>
      )}
      <Mouth cx={100} cy={100} state={state} width={22} />
      {/* Grand wings */}
      <path d="M58,115 Q30,82 22,55 Q32,72 42,78 Q35,65 30,50 Q40,68 48,75 Q44,60 42,48 Q50,65 55,78 L58,110" fill={c.secondary} opacity="0.4" />
      <path d="M142,115 Q170,82 178,55 Q168,72 158,78 Q165,65 170,50 Q160,68 152,75 Q156,60 158,48 Q150,65 145,78 L142,110" fill={c.secondary} opacity="0.4" />
      {/* Wing membrane lines */}
      <line x1="55" y1="110" x2="32" y2="72" stroke={c.primary} strokeWidth="1" opacity="0.2" />
      <line x1="55" y1="105" x2="40" y2="68" stroke={c.primary} strokeWidth="1" opacity="0.2" />
      <line x1="145" y1="110" x2="168" y2="72" stroke={c.primary} strokeWidth="1" opacity="0.2" />
      <line x1="145" y1="105" x2="160" y2="68" stroke={c.primary} strokeWidth="1" opacity="0.2" />
      {/* Tail (long, curled with spade tip) */}
      <path d="M138,148 Q165,148 172,132 Q168,142 165,145 Q170,135 175,125" fill={c.primary} />
      <path d="M175,122 L180,115 L178,128 Z" fill={c.secondary} opacity="0.7" />
      {/* Legs */}
      <rect x="70" y="170" width="16" height="16" rx="8" fill={c.primary} />
      <rect x="114" y="170" width="16" height="16" rx="8" fill={c.primary} />
      {/* Claw marks */}
      <line x1="72" y1="184" x2="72" y2="188" stroke={c.secondary} strokeWidth="1" opacity="0.3" />
      <line x1="78" y1="184" x2="78" y2="188" stroke={c.secondary} strokeWidth="1" opacity="0.3" />
      <line x1="84" y1="184" x2="84" y2="188" stroke={c.secondary} strokeWidth="1" opacity="0.3" />
      <line x1="116" y1="184" x2="116" y2="188" stroke={c.secondary} strokeWidth="1" opacity="0.3" />
      <line x1="122" y1="184" x2="122" y2="188" stroke={c.secondary} strokeWidth="1" opacity="0.3" />
      <line x1="128" y1="184" x2="128" y2="188" stroke={c.secondary} strokeWidth="1" opacity="0.3" />
    </g>
  );
}

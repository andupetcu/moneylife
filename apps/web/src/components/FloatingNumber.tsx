'use client';

import React from 'react';
import { colors } from '../lib/design-tokens';

type FloatingVariant = 'xp' | 'coins' | 'gain' | 'cost';

const VARIANT_COLORS: Record<FloatingVariant, string> = {
  xp: colors.accentCyan,
  coins: colors.accentGold,
  gain: colors.success,
  cost: colors.danger,
};

interface FloatingNumberProps {
  text: string;
  variant?: FloatingVariant;
}

export default function FloatingNumber({ text, variant = 'gain' }: FloatingNumberProps): React.ReactElement {
  const color = VARIANT_COLORS[variant];
  return (
    <span style={{
      display: 'inline-block',
      fontWeight: 700,
      fontSize: 14,
      color,
      textShadow: `0 0 8px ${color}`,
      animation: 'coinFloat 1s ease-out forwards',
      pointerEvents: 'none',
    }}>
      {text}
    </span>
  );
}

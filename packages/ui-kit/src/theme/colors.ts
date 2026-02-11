/**
 * MoneyLife color palette.
 * All components must use these tokens via ThemeProvider — never hardcode colors.
 */
export const colors = {
  primary: '#2563EB',
  primaryLight: '#60A5FA',
  primaryDark: '#1D4ED8',

  secondary: '#10B981',
  secondaryLight: '#6EE7B7',
  secondaryDark: '#059669',

  accent: '#F59E0B',
  accentLight: '#FCD34D',
  accentDark: '#D97706',

  danger: '#EF4444',
  dangerLight: '#FCA5A5',
  dangerDark: '#DC2626',

  warning: '#F59E0B',
  warningLight: '#FDE68A',
  warningDark: '#B45309',

  success: '#10B981',
  successLight: '#A7F3D0',
  successDark: '#047857',

  background: '#FFFFFF',
  backgroundSecondary: '#F3F4F6',
  backgroundTertiary: '#E5E7EB',

  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  border: '#D1D5DB',
  borderLight: '#E5E7EB',

  overlay: 'rgba(0, 0, 0, 0.5)',

  // Rarity colors for badges
  rarityCommon: '#9CA3AF',
  rarityRare: '#3B82F6',
  rarityEpic: '#8B5CF6',
  rarityLegendary: '#F59E0B',

  // Credit Health gauge colors
  creditExcellent: '#10B981',
  creditGood: '#34D399',
  creditFair: '#FBBF24',
  creditPoor: '#F97316',
  creditVeryPoor: '#EF4444',

  transparent: 'transparent',
} as const;

export type ColorToken = keyof typeof colors;

import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  default: 'System',
});

/**
 * Typography scale. All text styles derive from these tokens.
 */
export const typography: Record<string, TextStyle> = {
  displayLarge: {
    fontFamily,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontFamily,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  displaySmall: {
    fontFamily,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
  },
  headlineLarge: {
    fontFamily,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600',
  },
  headlineMedium: {
    fontFamily,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
  },
  headlineSmall: {
    fontFamily,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  bodyLarge: {
    fontFamily,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyMedium: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  bodySmall: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  labelLarge: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  labelMedium: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  labelSmall: {
    fontFamily,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  caption: {
    fontFamily,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400',
  },
  button: {
    fontFamily,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.25,
  },
  buttonSmall: {
    fontFamily,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
} as const;

export type TypographyToken = keyof typeof typography;

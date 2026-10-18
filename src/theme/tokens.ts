import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Design tokens for Daniruk. The brand color is gold (rethemed 2026-10-18
 * from the original green extracted in SPEC.md §Design System); screens
 * consume these tokens — no magic numbers in components.
 */

export const colors = {
  gold: {
    950: '#231D0F', // headings / near-black text (warm)
    900: '#3E3212', // onboarding background (deep bronze)
    800: '#57451A', // wallet card
    700: '#8A6D1F', // primary buttons, active states, links, eyebrows (light bg)
    100: '#F3E7C1', // transaction icon tint
    50: '#FBF4DC', // airtime icon tile
  },
  accent: {
    400: '#F2C24B', // accent: CTA on dark, logo badge, trade banner
  },
  surface: {
    page: '#ECE9E2', // outer page background
    base: '#F7F5F0', // home background, inactive toggle
    subtle: '#F8F6F1', // lock-note / info rows
    card: '#FFFFFF', // cards, inputs, tab bar
  },
  text: {
    primary: '#231D0F',
    body: '#635E52',
    muted: '#9D988C',
    inverse: '#FFFFFF',
  },
  purple: {
    200: '#E7E2FD', // referral card
    100: '#EFEBFE', // flights tile
    600: '#7869BA', // referral illustration
  },
  yellow: {
    100: '#FDF3D9', // electricity tile
  },
  blue: {
    100: '#EAF2FE', // data tile
  },
  avatar: {
    bg: '#E9E2D0',
  },
  status: {
    success: '#2A5A4A',
    pending: '#B7791F',
    error: '#C0392B',
  },
  overlay: {
    onDark: 'rgba(255,255,255,0.12)', // Receive/Withdraw buttons on wallet card
  },
} as const;

/** Inter families loaded by ThemeProvider via @expo-google-fonts/inter. */
export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  display: { fontFamily: fontFamily.bold, fontSize: 34, lineHeight: 40 },
  h1: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 34 },
  h2: { fontFamily: fontFamily.bold, fontSize: 20, lineHeight: 26 },
  balance: { fontFamily: fontFamily.bold, fontSize: 32, lineHeight: 38 },
  body: { fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 22 },
  bodyMedium: { fontFamily: fontFamily.medium, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fontFamily.semiBold, fontSize: 14, lineHeight: 20 },
  button: { fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 22 },
  eyebrow: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  caption: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16 },
} as const satisfies Record<string, TextStyle>;

/** 4pt spacing scale. Screen padding is `spacing[6]` (24); card padding is `spacing[5]` (20). */
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export const screenPadding = spacing[6];
export const cardPadding = spacing[5];

export const radius = {
  sm: 8,
  md: 14, // inputs
  lg: 20, // cards
  xl: 28, // sheets, hero
  pill: 999,
} as const;

/** Minimum hit target for interactive elements (pt). */
export const hitTarget = 44;

/**
 * The single `card` shadow: soft, low-opacity warm-black.
 * iOS gets shadow props; Android gets elevation.
 */
export function cardShadow(): ViewStyle {
  return (
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: colors.gold[950],
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 3 },
      default: {},
    }) ?? {}
  );
}

export const tokens = { colors, fontFamily, typography, spacing, radius, screenPadding, cardPadding, hitTarget } as const;

export type Tokens = typeof tokens;

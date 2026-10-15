import { Platform, type TextStyle, type ViewStyle } from 'react-native';

/**
 * Design tokens for Daniruk, extracted from the design files (SPEC.md §Design System).
 * Screens consume these tokens — no magic numbers in components.
 */

export const colors = {
  green: {
    950: '#15221D', // headings / near-black text
    900: '#193A31', // onboarding background
    800: '#21493C', // wallet card
    700: '#2A5A4A', // primary buttons, active states, links, eyebrows (light bg)
    100: '#DFF1EA', // transaction icon tint
    50: '#E6F5EE', // airtime icon tile
  },
  lime: {
    400: '#C5EA82', // accent: CTA on dark, logo badge, trade banner
  },
  surface: {
    page: '#E7EBE8', // outer page background
    base: '#F5F7F5', // home background, inactive toggle
    subtle: '#F7F8F6', // lock-note / info rows
    card: '#FFFFFF', // cards, inputs, tab bar
  },
  text: {
    primary: '#15221D',
    body: '#56645E',
    muted: '#969E9B',
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
    bg: '#D9E5DF',
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
 * The single `card` shadow: soft, low-opacity green-black.
 * iOS gets shadow props; Android gets elevation.
 */
export function cardShadow(): ViewStyle {
  return (
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: colors.green[950],
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

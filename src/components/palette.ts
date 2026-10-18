import { colors } from '@/theme/tokens';

/**
 * Component-level colors that have no token in `@/theme/tokens`.
 * `border` is sampled from the auth screen input borders in 2.png/5.png and
 * used consistently for every hairline border in the component library.
 */
export const componentColors = {
  /** Input borders, hairlines, outlined IconButton (warmed for the gold theme). */
  border: '#E8E5DE',
  /** Failed StatusBadge / ErrorState tint background. */
  errorTint: '#F9E3E0',
  /** Data ServiceTile icon (tokens only define blue.100 as a tile background). */
  blue600: '#2F6FED',
  /** Bitcoin mark on the wallet card crypto row. */
  btcOrange: '#F7931A',
  /** Secondary text/icons on dark-gold surfaces (wallet card, onboarding). */
  mutedOnDark: 'rgba(255,255,255,0.72)',
  /** Outlines on dark-gold surfaces (Secured pill). */
  borderOnDark: 'rgba(255,255,255,0.28)',
  /** BottomSheet backdrop dim (gold.950 at ~48%). */
  backdrop: 'rgba(35, 29, 15, 0.48)',
  /** Skeleton placeholder blocks. */
  skeleton: colors.surface.page,
} as const;

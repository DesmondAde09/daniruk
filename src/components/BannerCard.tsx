import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cardPadding, colors, radius, spacing, typography } from '@/theme/tokens';

import { Icon } from './Icon';

interface BannerCardBaseProps {
  onPress?: () => void;
}

export interface TradeBannerProps extends BannerCardBaseProps {
  variant: 'trade';
  eyebrow?: string;
  title?: string;
  caption?: string;
}

export interface ReferralBannerProps extends BannerCardBaseProps {
  variant: 'referral';
  eyebrow?: string;
  title?: string;
  linkLabel?: string;
}

export type BannerCardProps = TradeBannerProps | ReferralBannerProps;

/**
 * Home banners: `trade` is the lime gift-card banner; `referral` is the purple
 * refer-and-earn card with decorative rotated tiles.
 */
export function BannerCard(props: BannerCardProps) {
  if (props.variant === 'trade') {
    const {
      eyebrow = 'TRADE GIFT CARDS',
      title = 'Get paid in Naira or crypto',
      caption = 'Competitive rates. Fast settlement.',
      onPress,
    } = props;
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [styles.tradeCard, pressed && styles.pressed]}
      >
        <View style={styles.tradeIconTile}>
          <Icon name="gift" size={24} color={colors.lime[400]} />
        </View>
        <View style={styles.tradeText}>
          <Text style={styles.tradeEyebrow}>{eyebrow}</Text>
          <Text style={styles.tradeTitle}>{title}</Text>
          <Text style={styles.tradeCaption}>{caption}</Text>
        </View>
        <Icon name="arrow-right" size={20} color={colors.green[900]} />
      </Pressable>
    );
  }

  const {
    eyebrow = 'REFER & EARN',
    title = 'Bring your people.\nEarn together.',
    linkLabel = 'Learn more',
    onPress,
  } = props;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.referralCard, pressed && styles.pressed]}
    >
      <View style={styles.referralText}>
        <Text style={styles.referralEyebrow}>{eyebrow}</Text>
        <Text style={styles.referralTitle}>{title}</Text>
        <View style={styles.referralLink}>
          <Text style={styles.referralLinkLabel}>{linkLabel}</Text>
          <Icon name="arrow-right" size={16} color={colors.green[700]} />
        </View>
      </View>
      <View style={styles.referralArt} pointerEvents="none">
        <View style={styles.purpleTile} />
        <View style={styles.greenTile}>
          <Text style={styles.nairaGlyph}>₦</Text>
        </View>
      </View>
    </Pressable>
  );
}

const TILE = 72;

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.85,
  },
  tradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.lime[400],
    borderRadius: radius.lg,
    padding: cardPadding,
    alignSelf: 'stretch',
  },
  tradeIconTile: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.green[800],
    alignItems: 'center',
    justifyContent: 'center',
  },
  tradeText: {
    flex: 1,
    gap: spacing[1],
  },
  tradeEyebrow: {
    ...typography.eyebrow,
    color: colors.green[800],
  },
  tradeTitle: {
    ...typography.button,
    color: colors.green[950],
  },
  tradeCaption: {
    ...typography.caption,
    color: colors.green[800],
  },
  referralCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.purple[200],
    borderRadius: radius.lg,
    padding: cardPadding,
    alignSelf: 'stretch',
    overflow: 'hidden',
  },
  referralText: {
    flex: 1,
    gap: spacing[2],
  },
  referralEyebrow: {
    ...typography.eyebrow,
    color: colors.purple[600],
  },
  referralTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  referralLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  referralLinkLabel: {
    ...typography.label,
    color: colors.green[700],
  },
  referralArt: {
    width: TILE * 1.6,
    height: TILE * 1.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purpleTile: {
    position: 'absolute',
    width: TILE,
    height: TILE,
    borderRadius: radius.lg,
    backgroundColor: colors.purple[600],
    transform: [{ rotate: '-14deg' }, { translateX: 12 }, { translateY: 10 }],
  },
  greenTile: {
    position: 'absolute',
    width: TILE,
    height: TILE,
    borderRadius: radius.lg,
    backgroundColor: colors.green[800],
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '8deg' }, { translateX: -10 }, { translateY: -8 }],
  },
  nairaGlyph: {
    ...typography.h1,
    color: colors.lime[400],
  },
});

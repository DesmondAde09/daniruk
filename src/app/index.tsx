import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, Logo, Pill } from '@/components';
import { componentColors } from '@/components/palette';
import { cardShadow, colors, radius, spacing, typography } from '@/theme/tokens';

/** White floating chip (gift cards / digital services) overlapping the hero card. */
function FloatingChip({
  icon,
  title,
  subtitle,
  style,
}: {
  icon: 'gift' | 'bolt';
  title: string;
  subtitle: string;
  style?: object;
}) {
  return (
    <View style={[styles.chip, style]}>
      <Icon name={icon} size={22} color={colors.green[700]} />
      <View>
        <Text style={styles.chipTitle}>{title}</Text>
        <Text style={styles.chipSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

/**
 * Hero illustration from 1.png rebuilt with RN views: a tilted white card with
 * the green "D" badge, a gray placeholder bar, the ₦348,200 balance and three
 * pastel squares, plus two floating feature chips, over a dark radial glow.
 */
function HeroCard() {
  return (
    <View style={styles.hero}>
      <View style={styles.glowOuter} />
      <View style={styles.glowInner} />
      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeLetter}>D</Text>
        </View>
        <View style={styles.heroBar} />
        <Text style={styles.heroBalance}>₦ 348,200</Text>
        <View style={styles.heroSquares}>
          <View style={[styles.heroSquare, { backgroundColor: colors.green[50] }]} />
          <View style={[styles.heroSquare, { backgroundColor: colors.yellow[100] }]} />
          <View style={[styles.heroSquare, { backgroundColor: colors.purple[100] }]} />
        </View>
      </View>
      <FloatingChip
        icon="gift"
        title="Gift cards"
        subtitle="Fast payouts"
        style={styles.chipLeft}
      />
      <FloatingChip
        icon="bolt"
        title="Digital services"
        subtitle="All in one place"
        style={styles.chipRight}
      />
    </View>
  );
}

/** Onboarding / welcome screen (design 1.png). */
export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing[2] }]}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Logo variant="dark" />
        <Pill label="Secured" />
      </View>

      <View style={styles.heroArea}>
        <HeroCard />
      </View>

      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Money, made simple</Text>
        <Text style={styles.headline}>Trade. Pay.{'\n'}Move forward.</Text>
        <Text style={styles.body}>
          Turn gift cards into cash, manage money and pay for everyday services—all with Daniruk.
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing[2] }]}>
        <Button
          title="Get started"
          variant="accent"
          showArrow
          onPress={() => router.push('/(auth)/signup')}
        />
        <Pressable
          onPress={() => router.push('/(auth)/login')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.loginLink, pressed && styles.pressed]}
        >
          <Text style={styles.loginLinkText}>I already have an account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const HERO_CARD_WIDTH = 210;
const HERO_CARD_HEIGHT = 272;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.green[900],
    paddingHorizontal: spacing[6],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    width: HERO_CARD_WIDTH + 120,
    height: HERO_CARD_HEIGHT + 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  glowInner: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(21, 34, 29, 0.5)',
  },
  heroCard: {
    width: HERO_CARD_WIDTH,
    height: HERO_CARD_HEIGHT,
    backgroundColor: colors.surface.card,
    borderRadius: radius.xl,
    padding: spacing[6],
    transform: [{ rotate: '5deg' }],
    ...cardShadow(),
  },
  heroBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.sm + 2,
    backgroundColor: colors.green[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeLetter: {
    ...typography.h2,
    fontSize: 18,
    lineHeight: 24,
    color: colors.lime[400],
  },
  heroBar: {
    marginTop: spacing[4],
    width: '55%',
    height: 8,
    borderRadius: radius.sm / 2,
    backgroundColor: componentColors.border,
  },
  heroBalance: {
    marginTop: spacing[3],
    ...typography.h2,
    color: colors.text.primary,
  },
  heroSquares: {
    marginTop: spacing[5],
    flexDirection: 'row',
    gap: spacing[3],
  },
  heroSquare: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  chip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.surface.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    ...cardShadow(),
  },
  chipLeft: {
    left: 0,
    top: 64,
    transform: [{ rotate: '-4deg' }],
  },
  chipRight: {
    right: 0,
    bottom: 56,
    transform: [{ rotate: '3deg' }],
  },
  chipTitle: {
    ...typography.caption,
    color: colors.text.body,
  },
  chipSubtitle: {
    ...typography.label,
    color: colors.text.primary,
  },
  copy: {
    gap: spacing[3],
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.lime[400],
  },
  headline: {
    ...typography.display,
    color: colors.text.inverse,
  },
  body: {
    ...typography.body,
    color: componentColors.mutedOnDark,
  },
  footer: {
    marginTop: spacing[8],
    gap: spacing[2],
  },
  loginLink: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginLinkText: {
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },
  pressed: {
    opacity: 0.85,
  },
});

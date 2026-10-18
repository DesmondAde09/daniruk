import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BottomTabBarProps } from 'expo-router/js-tabs';

import { cardShadow, colors, fontFamily, spacing, typography } from '@/theme/tokens';

import { Icon, type IconName } from './Icon';
import { componentColors } from './palette';

const TAB_CONFIG: Record<string, { icon: IconName; label: string }> = {
  index: { icon: 'home', label: 'Home' },
  trade: { icon: 'gift', label: 'Trade' },
  services: { icon: 'grid', label: 'Services' },
  transactions: { icon: 'receipt', label: 'Transactions' },
  profile: { icon: 'user', label: 'Profile' },
};

/**
 * Custom bottom tab bar (designs 3.png/4.png). Wire via the `tabBar` prop on
 * `Tabs` from `expo-router/js-tabs`: `tabBar={(props) => <TabBar {...props} />}`.
 * The center Trade tab renders as a raised gold.700 circle without a label.
 */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const centerIndex = Math.floor(state.routes.length / 2);

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing[2]) }]}>
      {state.routes.map((route, index) => {
        const config = TAB_CONFIG[route.name] ?? { icon: 'grid' as IconName, label: route.name };
        const options = descriptors[route.key]?.options;
        const label =
          typeof options?.title === 'string' ? options.title : config.label;
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        if (index === centerIndex) {
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: focused }}
              style={({ pressed }) => [styles.centerTab, pressed && styles.pressed]}
            >
              <View style={[styles.centerButton, cardShadow()]}>
                <Icon name="gift" size={26} color={colors.text.inverse} />
              </View>
            </Pressable>
          );
        }

        const color = focused ? colors.gold[700] : colors.text.muted;
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: focused }}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <Icon name={config.icon} size={24} color={color} />
            <Text style={[styles.tabLabel, { color }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const CENTER_SIZE = 56;

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface.card,
    borderTopWidth: 1,
    borderTopColor: componentColors.border,
    paddingTop: spacing[2],
    paddingHorizontal: spacing[2],
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    paddingVertical: spacing[1],
  },
  tabLabel: {
    ...typography.caption,
    fontFamily: fontFamily.medium,
  },
  centerTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: colors.gold[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
  pressed: {
    opacity: 0.85,
  },
});

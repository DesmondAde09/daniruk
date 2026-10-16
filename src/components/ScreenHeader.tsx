import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { hitTarget, spacing } from '@/theme/tokens';

import { Avatar } from './Avatar';
import { IconButton } from './IconButton';
import { Logo } from './Logo';

export type ScreenHeaderProps =
  | { variant: 'auth'; onBack?: () => void }
  | {
      variant: 'home';
      initials: string;
      hasUnread?: boolean;
      onPressBell?: () => void;
      onPressAvatar?: () => void;
    };

/**
 * `auth`: round back button left, centered logo (designs 2.png/5.png).
 * `home`: logo left, bell (with unread dot) + avatar right (design 4.png).
 */
export function ScreenHeader(props: ScreenHeaderProps) {
  if (props.variant === 'auth') {
    return (
      <View style={styles.container}>
        <View style={styles.side}>
          {props.onBack ? (
            <IconButton
              icon="chevron-left"
              variant="outline"
              onPress={props.onBack}
              accessibilityLabel="Go back"
            />
          ) : null}
        </View>
        <View style={styles.center}>
          <Logo variant="light" />
        </View>
        <View style={styles.side} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Logo variant="light" />
      <View style={styles.homeRight}>
        <IconButton
          icon="bell"
          unreadDot={props.hasUnread}
          onPress={props.onPressBell}
          accessibilityLabel="Notifications"
        />
        <Pressable
          onPress={props.onPressAvatar}
          accessibilityRole="button"
          accessibilityLabel="Profile"
          hitSlop={4}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Avatar initials={props.initials} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    minHeight: hitTarget,
  },
  side: {
    width: hitTarget,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  homeRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[3],
  },
  pressed: {
    opacity: 0.85,
  },
});

import React, { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

/**
 * Shared keyboard-avoidance wrapper for form screens (SPEC.md "Platform
 * handling"): iOS pads, Android resizes via height. Wrap a screen's content
 * (below the SafeAreaView) so text fields are never covered by the keyboard.
 */
export function KeyboardAvoiding({ children }: { children: ReactNode }) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});

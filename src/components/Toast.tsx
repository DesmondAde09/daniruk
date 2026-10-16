import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cardShadow, colors, radius, spacing, typography } from '@/theme/tokens';

import { Icon } from './Icon';

export type ToastVariant = 'success' | 'error';

export interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 3000;

interface ActiveToast {
  id: number;
  message: string;
  variant: ToastVariant;
}

/**
 * Provides `useToast().show(message, variant)`. The toast slides in at the top,
 * under the safe area, and dismisses itself after ~3s.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ActiveToast | null>(null);
  const [translateY] = useState(() => new Animated.Value(-120));

  const show = useCallback((message: string, variant: ToastVariant = 'success') => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  useEffect(() => {
    if (!toast) return;
    translateY.setValue(-120);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
    const timer = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: -120,
        duration: 220,
        useNativeDriver: true,
      }).start(() => setToast(null));
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [toast, translateY]);

  return (
    <ToastContext.Provider value={{ show }}>
      <View style={styles.root}>
        {children}
        {toast && (
          <View
            pointerEvents="none"
            style={[styles.toastArea, { top: insets.top + spacing[2] }]}
          >
            <Animated.View
              testID="toast"
              style={[
                styles.toast,
                toast.variant === 'success' ? styles.toastSuccess : styles.toastError,
                { transform: [{ translateY }] },
              ]}
            >
              <Icon
                name={toast.variant === 'success' ? 'check' : 'close'}
                size={18}
                color={colors.text.inverse}
              />
              <Text style={styles.message}>{toast.message}</Text>
            </Animated.View>
          </View>
        )}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  toastArea: {
    position: 'absolute',
    left: spacing[6],
    right: spacing[6],
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    ...cardShadow(),
  },
  toastSuccess: {
    backgroundColor: colors.green[700],
  },
  toastError: {
    backgroundColor: colors.status.error,
  },
  message: {
    flex: 1,
    ...typography.bodyMedium,
    color: colors.text.inverse,
  },
});

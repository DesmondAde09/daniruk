import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { tokens, type Tokens } from './tokens';

const ThemeContext = createContext<Tokens>(tokens);

/**
 * Loads the Inter font families and provides design tokens via context.
 * Renders nothing until the fonts are ready, so screens never flash
 * fallback fonts (critical for the ₦ glyph).
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const value = useMemo<Tokens>(() => tokens, []);

  if (!fontsLoaded) {
    return null;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Tokens {
  return useContext(ThemeContext);
}

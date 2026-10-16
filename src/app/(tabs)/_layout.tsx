import { Tabs } from 'expo-router/js-tabs';
import React from 'react';

import { TabBar } from '@/components';

/**
 * Five-tab shell with the custom TabBar (SDK 57: Tabs comes from
 * `expo-router/js-tabs`, not the root export). TabBar raises the center
 * slot (index 2), so `trade` is declared third to keep the raised button
 * on the Trade route — the PNGs sketch Trade one slot left of center,
 * but the fixed component + SPEC.md ("raised center tab") win.
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="services" options={{ title: 'Services' }} />
      <Tabs.Screen name="trade" options={{ title: 'Trade' }} />
      <Tabs.Screen name="transactions" options={{ title: 'Transactions' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

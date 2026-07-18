import type { ComponentType } from 'react';
import { Tabs } from 'expo-router';
import { HouseIcon, DocIcon, colors, type IconProps } from '@krpc-starter/app';

/**
 * Bottom tabs (routing belongs to the shell; the web counterpart is app/_components/tab-bar).
 * Uses the shared icons + neutral palette. expo-router Tabs owns routing here.
 */
export default function TabsLayout() {
  const icon =
    (Icon: ComponentType<IconProps>) =>
    ({ color, size }: { color: string; size: number }) =>
      <Icon size={size} color={color} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand500,
        tabBarInactiveTintColor: colors.inkMuted,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon(HouseIcon) }} />
      <Tabs.Screen name="catalog" options={{ title: 'Catalog', tabBarIcon: icon(DocIcon) }} />
    </Tabs>
  );
}

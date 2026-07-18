import type { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors } from '../theme';

/**
 * Brand gradient backdrop (hero) — cross-platform.
 *
 * Uses react-native-svg's LinearGradient (valid on native + web via RNW) instead of a CSS
 * `bg-gradient-*` (which NativeWind flags as an invalid background-image on native). Equivalent
 * to `linear-gradient(135deg, heroFrom, heroTo)`.
 *
 * The outer View takes `className` (padding/height); the SVG fills behind, children stack on top.
 */
export function BrandGradient({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <View className={className}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" pointerEvents="none">
        <Defs>
          <LinearGradient id="brandHero" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.heroFrom} />
            <Stop offset="1" stopColor={colors.heroTo} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#brandHero)" />
      </Svg>
      {children}
    </View>
  );
}

import type { ReactNode } from 'react';
import { View, ScrollView, type ScrollViewProps } from 'react-native';

/**
 * Screen scaffolding primitives.
 *
 * {@link Screen} = a fixed-height `flex-1` root with the page background (default `bg-bg`),
 * for hosting a header + sticky footer + conditionally-mounted overlays.
 * {@link ScrollScreen} = the scrollable variant (ScrollView); `contentContainerClassName` and the
 * other ScrollView props pass through.
 */
export interface ScreenProps {
  children?: ReactNode;
  /** Override the page background (default bg-bg). */
  className?: string;
  testID?: string;
}

export function Screen({ children, className, testID }: ScreenProps) {
  return (
    <View className={`flex-1 ${className ?? 'bg-bg'}`} testID={testID}>
      {children}
    </View>
  );
}

export type ScrollScreenProps = ScrollViewProps & { className?: string };

export function ScrollScreen({ className, children, ...rest }: ScrollScreenProps) {
  return (
    <ScrollView className={`flex-1 ${className ?? 'bg-bg'}`} {...rest}>
      {children}
    </ScrollView>
  );
}

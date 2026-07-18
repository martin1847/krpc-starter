import type { ReactNode } from 'react';
import { View, Pressable, type ViewProps, type PressableProps } from 'react-native';

/**
 * Surface card primitive: rounded, white, soft shadow (`rounded-2xl bg-surface shadow-card`).
 *
 * Structural classes are built in; spacing/layout is passed via `className`. Pass `onPress` to
 * render a pressable card, otherwise it's a plain View. Under react-native-web both render as a
 * div with the same classes, so they look identical.
 */
const BASE = 'rounded-2xl bg-surface shadow-card';

export interface CardProps {
  className?: string;
  children?: ReactNode;
  /** Pass to render a pressable (tappable) card; omit for a plain display card. */
  onPress?: PressableProps['onPress'];
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

export function Card({ className, children, onPress, disabled, testID, accessibilityLabel }: CardProps) {
  const cls = className ? `${BASE} ${className}` : BASE;
  if (onPress != null) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        className={cls}
      >
        {children}
      </Pressable>
    );
  }
  const viewProps: ViewProps = { testID, accessibilityLabel, className: cls };
  return <View {...viewProps}>{children}</View>;
}

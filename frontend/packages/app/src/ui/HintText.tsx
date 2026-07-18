import type { ReactNode } from 'react';
import { Text } from 'react-native';

/**
 * Centered status text (loading / error / empty states):
 * `text-center text-sm text-ink-muted`. Vertical padding is passed via `className`
 * (default `py-16`).
 */
const BASE = 'text-center text-sm text-ink-muted';

export interface HintTextProps {
  children?: ReactNode;
  /** Override vertical padding etc. (default py-16). */
  className?: string;
  testID?: string;
}

export function HintText({ children, className, testID }: HintTextProps) {
  const cls = `${BASE} ${className ?? 'py-16'}`;
  return (
    <Text className={cls} testID={testID}>
      {children}
    </Text>
  );
}

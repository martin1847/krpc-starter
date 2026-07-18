import type { ReactNode } from 'react';
import { View, Text } from 'react-native';

/**
 * Small badge / tag. Only `rounded` is fixed; background + padding via `className`, font size +
 * color via `textClassName`. Defaults to the common brand-tint small tag.
 */
export interface TagProps {
  children?: ReactNode;
  /** Container background + padding (default `bg-brand-50 px-2 py-0.5`). */
  className?: string;
  /** Text size + color (default `text-xs text-brand-600`). */
  textClassName?: string;
}

export function Tag({ children, className, textClassName }: TagProps) {
  return (
    <View className={`rounded ${className ?? 'bg-brand-50 px-2 py-0.5'}`}>
      <Text className={textClassName ?? 'text-xs text-brand-600'}>{children}</Text>
    </View>
  );
}

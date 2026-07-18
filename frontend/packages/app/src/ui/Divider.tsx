import { View } from 'react-native';

/**
 * Thin divider line (`h-px bg-line`). Default is a 1px horizontal rule; override via `className`.
 */
const BASE = 'h-px bg-line';

export function Divider({ className }: { className?: string }) {
  return <View className={className ? `${BASE} ${className}` : BASE} />;
}

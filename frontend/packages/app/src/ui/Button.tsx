import type { ReactNode } from 'react';
import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native';
import { colors } from '../features/theme';

/**
 * Button primitive (three variants): primary (filled), secondary (outlined), text (plain).
 *
 * The shape (`rounded-full flex-row items-center justify-center gap-2`) is fixed; sizing/padding
 * is passed through via `className`. `loading` prepends an ActivityIndicator; `disabled` uses a
 * muted fill/label for the primary variant.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'text';

export interface ButtonProps {
  variant?: ButtonVariant;
  onPress?: PressableProps['onPress'];
  disabled?: boolean;
  loading?: boolean;
  children?: ReactNode;
  /** Sizing/padding passthrough (e.g. py-3 / px-10 py-3). */
  className?: string;
  /** Override text classes (default: text-base font-medium + variant color). */
  textClassName?: string;
  testID?: string;
  accessibilityLabel?: string;
}

const BASE = 'flex-row items-center justify-center gap-2 rounded-full';

function variantClasses(variant: ButtonVariant, disabled: boolean) {
  switch (variant) {
    case 'secondary':
      return {
        container: 'border border-line bg-surface',
        text: 'text-ink-muted',
        spinner: colors.inkMuted,
      };
    case 'text':
      return { container: '', text: 'text-ink-muted', spinner: colors.inkMuted };
    case 'primary':
    default:
      return {
        container: disabled ? 'bg-line' : 'bg-brand-500',
        text: disabled ? 'text-ink-muted' : 'text-white',
        spinner: colors.white,
      };
  }
}

export function Button({
  variant = 'primary',
  onPress,
  disabled = false,
  loading = false,
  children,
  className,
  textClassName,
  testID,
  accessibilityLabel,
}: ButtonProps) {
  const v = variantClasses(variant, disabled);
  const container = [BASE, v.container, className].filter(Boolean).join(' ');
  const text = textClassName ?? `text-base font-medium ${v.text}`;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      className={container}
    >
      {loading && <ActivityIndicator size="small" color={v.spinner} />}
      <Text className={text}>{children}</Text>
    </Pressable>
  );
}

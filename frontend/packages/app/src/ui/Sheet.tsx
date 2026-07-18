import type { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';

/**
 * Bottom sheet scaffold: a translucent backdrop + a rounded-top panel with a title / cancel header.
 *
 * Built from plain RN primitives (not RN Modal) for the most stable cross-platform behavior.
 * Must be rendered inside a `flex-1` container (as a sibling of the content) so it fills the screen.
 * z-index via `zClassName`; panel height/padding via `panelClassName`. The body is `children`.
 */
export interface SheetProps {
  /** Header title (bold). */
  title: string;
  /** Close handler (shared by backdrop tap + header cancel). */
  onClose: () => void;
  /** "Cancel" label (header cancel; also the default backdrop accessibilityLabel). */
  cancelLabel: string;
  /** Backdrop accessibilityLabel (defaults to cancelLabel). */
  backdropLabel?: string;
  children?: ReactNode;
  /** Outer backdrop testID. */
  testID?: string;
  /** Header close-button testID. */
  closeTestID?: string;
  /** z-index class (default z-50; nested sheets pass a higher layer). */
  zClassName?: string;
  /** Panel height + padding (default `max-h-[80%] px-4 pb-20 pt-4`). */
  panelClassName?: string;
}

export function Sheet({
  title,
  onClose,
  cancelLabel,
  backdropLabel,
  children,
  testID,
  closeTestID,
  zClassName = 'z-50',
  panelClassName = 'max-h-[80%] px-4 pb-20 pt-4',
}: SheetProps) {
  return (
    <View className={`absolute inset-0 ${zClassName} justify-end bg-black/40`} testID={testID}>
      <Pressable className="absolute inset-0" onPress={onClose} accessibilityLabel={backdropLabel ?? cancelLabel} />
      <View className={`rounded-t-3xl bg-surface ${panelClassName}`}>
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-ink">{title}</Text>
          <Pressable onPress={onClose} testID={closeTestID} hitSlop={8}>
            <Text className="text-sm text-ink-muted">{cancelLabel}</Text>
          </Pressable>
        </View>
        {children}
      </View>
    </View>
  );
}

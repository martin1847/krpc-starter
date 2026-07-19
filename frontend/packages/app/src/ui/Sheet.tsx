import type { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';

/**
 * Bottom sheet scaffold: a translucent backdrop + a rounded-top panel with a title / cancel header.
 *
 * Built from plain RN primitives (not RN Modal) for the most stable cross-platform behavior.
 * Must be rendered inside a `flex-1` container (as a sibling of the content) so it fills the screen.
 * z-index via `zClassName`; panel height/padding via `panelClassName`. The body is `children`.
 *
 * Three opt-in props cover sheets with a non-standard header/backdrop (all defaults keep the base
 * behavior byte-for-byte):
 *  - `showHeader=false` — skip the default header (title + top-right cancel); the caller supplies its
 *    own header/subtitle/footer inside `children` (e.g. a login gate or a forced bind-phone dialog).
 *  - `dismissable=false` — do not render the backdrop-tap-to-close Pressable (for blocking dialogs).
 *  - `backdropClassName` — override the backdrop tint (default `bg-black/40`).
 */
export interface SheetProps {
  /** Header title (bold). Unused when `showHeader=false`. */
  title?: string;
  /** Close handler (shared by backdrop tap + header cancel). */
  onClose: () => void;
  /** "Cancel" label (header cancel; also the default backdrop accessibilityLabel). */
  cancelLabel?: string;
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
  /** Render the default header (title + top-right cancel)? false ⇒ children supply their own. Default true. */
  showHeader?: boolean;
  /** Allow backdrop tap to close? false ⇒ no backdrop Pressable (blocking dialogs). Default true. */
  dismissable?: boolean;
  /** Backdrop tint class (default `bg-black/40`). */
  backdropClassName?: string;
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
  showHeader = true,
  dismissable = true,
  backdropClassName = 'bg-black/40',
}: SheetProps) {
  return (
    <View className={`absolute inset-0 ${zClassName} justify-end ${backdropClassName}`} testID={testID}>
      {dismissable && (
        <Pressable className="absolute inset-0" onPress={onClose} accessibilityLabel={backdropLabel ?? cancelLabel} />
      )}
      <View className={`rounded-t-3xl bg-surface ${panelClassName}`}>
        {showHeader && (
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-ink">{title}</Text>
            <Pressable onPress={onClose} testID={closeTestID} hitSlop={8}>
              <Text className="text-sm text-ink-muted">{cancelLabel}</Text>
            </Pressable>
          </View>
        )}
        {children}
      </View>
    </View>
  );
}

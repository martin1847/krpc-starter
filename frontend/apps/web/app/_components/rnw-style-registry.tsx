'use client';

import { useRef } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
// IMPORTANT: import StyleSheet via the `react-native` alias (next.config.mjs maps `react-native$`
// -> react-native-web's ESM absolute path) so it is the SAME module instance the shared
// packages/app components use. Otherwise each side holds its own StyleSheet singleton and extracts
// an empty sheet. RNW ships no types, so getSheet's shape is asserted inline.
import { StyleSheet as RNStyleSheet } from 'react-native';
import type { ReactNode } from 'react';

const StyleSheet = RNStyleSheet as unknown as {
  getSheet(): { id: string; textContent: string };
};

/**
 * react-native-web SSR style extraction (fixes first-paint FOUC).
 *
 * RNW's base styles (`.css-*`, including `display:flex`) and atomic styles (`.r-*`) are injected at
 * runtime via CSSOM insertRule — they aren't in the server HTML. Before hydration those rules are
 * missing, so tailwind's flex utilities lose their `display:flex` base and layouts collapse (FOUC).
 *
 * Fix: RNW's StyleSheet is a module-level singleton that accumulates rules in memory even during
 * SSR (getSheet().textContent comes from in-memory groups, not CSSOM). We flush that accumulated
 * sheet into the SSR HTML via App Router's useServerInsertedHTML. The id matches RNW's client
 * singleton, so on hydration RNW reuses the existing <style> instead of re-injecting — no mismatch.
 */
export function RNWStyleRegistry({ children }: { children: ReactNode }) {
  // useServerInsertedHTML fires once per flush boundary; getSheet returns the full accumulated
  // sheet each time. De-dupe by emitted length so the same sheet isn't written repeatedly.
  const emittedLen = useRef(0);
  useServerInsertedHTML(() => {
    const sheet = StyleSheet.getSheet();
    if (!sheet.textContent || sheet.textContent.length <= emittedLen.current) return null;
    emittedLen.current = sheet.textContent.length;
    return (
      <style
        id={sheet.id}
        // RNW's own getStyleElement also uses dangerouslySetInnerHTML (CSS text isn't escaped).
        dangerouslySetInnerHTML={{ __html: sheet.textContent }}
      />
    );
  });
  return <>{children}</>;
}

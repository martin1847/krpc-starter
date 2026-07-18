/**
 * Runtime color values (for icon `color` props and other places that need a hex, not a className).
 * Kept aligned with the tailwind palette in apps/web/tailwind.config.cjs — the DS-drift gate
 * (scripts/check-ds-drift.mjs) fails CI if this mirror drifts.
 *
 * This is a brand-NEUTRAL placeholder palette (slate). Swap these values (and the matching tokens
 * in the tailwind config) for your own brand colors.
 */
export const colors = {
  ink: '#1e293b',
  inkMuted: '#64748b',
  white: '#ffffff',
  brand200: '#cbd5e1',
  brand500: '#475569',
  brand600: '#334155',
  star: '#f59e0b',
  badgeSale: '#ef4444',
  decoPurple: '#94a3b8',
  heroFrom: '#475569',
  heroTo: '#1e293b',
} as const;

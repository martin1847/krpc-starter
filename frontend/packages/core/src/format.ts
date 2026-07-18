/**
 * Display formatting (pure logic, zero UI). Cross-platform, unit-tested.
 * Derived display values live here so screens don't each re-implement (and drift) them.
 */

/** Distance in metres -> "X.XXkm" for list/detail rows. */
export function formatDistanceKm(meters: number): string {
  return `${(meters / 1000).toFixed(2)}km`;
}

/**
 * Epoch milliseconds -> "YYYY-MM-DD HH:mm:ss" in UTC (stable across machine timezones).
 * Returns '' for missing / invalid input so callers can degrade instead of throwing.
 */
export function formatTimestamp(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return '';
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())} ` +
    `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`
  );
}

/** Truncate a string to `max` chars, appending an ellipsis when cut. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1))}…`;
}

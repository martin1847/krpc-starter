import { describe, it, expect } from 'vitest';
import { formatDistanceKm, formatTimestamp, truncate } from './format';

describe('formatDistanceKm', () => {
  it('formats metres as kilometres with 2 decimals', () => {
    expect(formatDistanceKm(1500)).toBe('1.50km');
    expect(formatDistanceKm(50)).toBe('0.05km');
  });
});

describe('formatTimestamp', () => {
  it('formats epoch millis as a stable UTC string', () => {
    expect(formatTimestamp(0)).toBe('1970-01-01 00:00:00 UTC');
    expect(formatTimestamp(1784367832267)).toBe('2026-07-18 09:43:52 UTC');
  });
  it('returns empty string for missing / invalid input', () => {
    expect(formatTimestamp(null)).toBe('');
    expect(formatTimestamp(undefined)).toBe('');
    expect(formatTimestamp(Number.NaN)).toBe('');
  });
});

describe('truncate', () => {
  it('leaves short strings untouched', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });
  it('cuts long strings with an ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hell…');
  });
});

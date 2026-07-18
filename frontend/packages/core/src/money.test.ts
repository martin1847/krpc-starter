import { describe, it, expect } from 'vitest';
import { centsToMajor, majorToCents, sumCents } from './money';

describe('centsToMajor', () => {
  it('formats whole and fractional amounts with 2 decimals', () => {
    expect(centsToMajor(19800)).toBe('198.00');
    expect(centsToMajor(20805)).toBe('208.05');
    expect(centsToMajor(7)).toBe('0.07');
    expect(centsToMajor(0)).toBe('0.00');
  });
  it('keeps the sign for negatives', () => {
    expect(centsToMajor(-150)).toBe('-1.50');
  });
});

describe('majorToCents', () => {
  it('parses major-unit strings to integer cents, ignoring currency glyphs', () => {
    expect(majorToCents('198')).toBe(19800);
    expect(majorToCents('$198.00')).toBe(19800);
    expect(majorToCents('208.5')).toBe(20850);
  });
  it('truncates beyond 2 fractional digits (no float drift)', () => {
    expect(majorToCents('1.999')).toBe(199);
  });
});

describe('sumCents', () => {
  it('sums price*qty in integer cents', () => {
    expect(sumCents([{ priceCents: 19800, qty: 2 }, { priceCents: 20800, qty: 1 }])).toBe(60400);
  });
  it('is 0 for an empty cart', () => {
    expect(sumCents([])).toBe(0);
  });
});

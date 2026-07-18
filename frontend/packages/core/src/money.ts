/**
 * Money helpers: represent every amount as an integer number of cents.
 * Never do arithmetic on floating-point currency values.
 * Large integer ids should be carried as strings (see DTO conventions).
 */
export type Cents = number;

export function centsToMajor(cents: Cents): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

export function majorToCents(major: string): Cents {
  const [int, frac = ''] = major.replace(/[^\d.-]/g, '').split('.');
  const cents = Number(int) * 100 + Number((frac + '00').slice(0, 2));
  return Math.trunc(cents);
}

/** Sum price * qty in integer cents (avoids float drift). */
export function sumCents(items: ReadonlyArray<{ priceCents: Cents; qty: number }>): Cents {
  return items.reduce((acc, it) => acc + it.priceCents * it.qty, 0);
}

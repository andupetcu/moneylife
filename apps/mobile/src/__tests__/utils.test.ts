import { formatCurrency, formatCurrencySigned, getCurrencyDecimals } from '@moneylife/ui-kit';
import { formatGameDate, formatGameDateShort, formatMonthYear, getDayOfWeek } from '@moneylife/ui-kit';

describe('formatCurrency (from mobile context)', () => {
  it('formats RON', () => expect(formatCurrency(500000, 'RON')).toContain('5'));
  it('formats USD', () => expect(formatCurrency(1500, 'USD')).toContain('$'));
  it('formats EUR', () => expect(formatCurrency(10000, 'EUR')).toContain('€'));
  it('formats GBP', () => expect(formatCurrency(2500, 'GBP')).toContain('£'));
  it('formats HUF with no decimals', () => expect(formatCurrency(5000, 'HUF')).toContain('5'));
  it('formats PLN', () => expect(formatCurrency(10000, 'PLN')).toContain('100'));
  it('formats CZK', () => expect(formatCurrency(10000, 'CZK')).toContain('100'));
  it('handles zero', () => expect(formatCurrency(0, 'USD')).toContain('0'));
  it('handles unknown currency', () => expect(formatCurrency(100, 'XYZ')).toBe('100 XYZ'));
  it('formatCurrencySigned positive', () => expect(formatCurrencySigned(1000, 'USD')).toMatch(/^\+/));
  it('formatCurrencySigned negative', () => expect(formatCurrencySigned(-1000, 'USD')).toContain('-'));
  it('getCurrencyDecimals USD', () => expect(getCurrencyDecimals('USD')).toBe(2));
  it('getCurrencyDecimals HUF', () => expect(getCurrencyDecimals('HUF')).toBe(0));
});

describe('date formatters (from mobile context)', () => {
  const date = { year: 2026, month: 3, day: 15 };

  it('formatGameDate', () => {
    const result = formatGameDate(date, 'en');
    expect(result).toContain('March');
    expect(result).toContain('15');
  });

  it('formatGameDateShort', () => {
    const result = formatGameDateShort(date, 'en');
    expect(result).toContain('Mar');
  });

  it('formatMonthYear', () => {
    expect(formatMonthYear(6, 2026, 'en')).toContain('June');
  });

  it('getDayOfWeek', () => {
    // March 15, 2026 is a Sunday
    expect(getDayOfWeek(date, 'en')).toBe('Sunday');
  });

  it('formatGameDate different months', () => {
    expect(formatGameDate({ year: 2026, month: 12, day: 25 }, 'en')).toContain('December');
  });

  it('formatGameDate January', () => {
    expect(formatGameDate({ year: 2026, month: 1, day: 1 }, 'en')).toContain('January');
  });

  it('formatMonthYear February', () => {
    expect(formatMonthYear(2, 2026, 'en')).toContain('February');
  });

  it('formatGameDateShort December', () => {
    expect(formatGameDateShort({ year: 2026, month: 12, day: 31 }, 'en')).toContain('Dec');
  });
});

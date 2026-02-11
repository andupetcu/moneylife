import { formatCurrency, formatCurrencySigned, getCurrencyDecimals } from '@moneylife/ui-kit';
import { formatGameDate, formatMonthYear, getDayOfWeek } from '@moneylife/ui-kit';

describe('Shared utilities (web context)', () => {
  it('formatCurrency RON', () => expect(formatCurrency(350000, 'RON')).toContain('3'));
  it('formatCurrency USD', () => expect(formatCurrency(5000, 'USD')).toContain('50'));
  it('formatCurrency EUR', () => expect(formatCurrency(10000, 'EUR')).toContain('100'));
  it('formatCurrency GBP', () => expect(formatCurrency(2500, 'GBP')).toContain('£'));
  it('formatCurrency zero', () => expect(formatCurrency(0, 'USD')).toContain('0'));
  it('formatCurrencySigned positive', () => expect(formatCurrencySigned(500, 'USD')).toMatch(/^\+/));
  it('getCurrencyDecimals', () => expect(getCurrencyDecimals('RON')).toBe(2));
  it('formatGameDate', () => expect(formatGameDate({ year: 2026, month: 5, day: 10 }, 'en')).toContain('May'));
  it('formatMonthYear', () => expect(formatMonthYear(7, 2026, 'en')).toContain('July'));
  it('getDayOfWeek', () => expect(typeof getDayOfWeek({ year: 2026, month: 1, day: 1 }, 'en')).toBe('string'));
});

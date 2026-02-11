import { formatCurrency, formatCurrencySigned, getCurrencyDecimals } from '../src/utils/currency-formatter';

describe('currency-formatter', () => {
  describe('formatCurrency', () => {
    it('formats RON correctly', () => {
      const result = formatCurrency(500000, 'RON');
      expect(result).toContain('5');
      expect(result).toContain('000');
    });

    it('formats USD correctly', () => {
      const result = formatCurrency(1500, 'USD');
      expect(result).toContain('$');
      expect(result).toContain('15');
    });

    it('formats HUF with no decimals', () => {
      const result = formatCurrency(5000, 'HUF');
      expect(result).toContain('5');
    });

    it('formats GBP correctly', () => {
      const result = formatCurrency(2500, 'GBP');
      expect(result).toContain('£');
      expect(result).toContain('25');
    });

    it('formats EUR correctly', () => {
      const result = formatCurrency(10050, 'EUR');
      expect(result).toContain('€');
      expect(result).toContain('100');
    });

    it('handles unknown currency gracefully', () => {
      const result = formatCurrency(1000, 'XYZ');
      expect(result).toBe('1000 XYZ');
    });

    it('handles zero amount', () => {
      const result = formatCurrency(0, 'USD');
      expect(result).toContain('$');
      expect(result).toContain('0');
    });

    it('handles negative amounts', () => {
      const result = formatCurrency(-5000, 'USD');
      expect(result).toContain('50');
    });
  });

  describe('formatCurrencySigned', () => {
    it('adds + prefix for positive amounts', () => {
      const result = formatCurrencySigned(5000, 'USD');
      expect(result.startsWith('+')).toBe(true);
    });

    it('has - for negative amounts', () => {
      const result = formatCurrencySigned(-5000, 'USD');
      expect(result).toContain('-');
    });
  });

  describe('getCurrencyDecimals', () => {
    it('returns 2 for USD', () => {
      expect(getCurrencyDecimals('USD')).toBe(2);
    });

    it('returns 0 for HUF', () => {
      expect(getCurrencyDecimals('HUF')).toBe(0);
    });

    it('returns 2 for unknown', () => {
      expect(getCurrencyDecimals('XYZ')).toBe(2);
    });
  });
});

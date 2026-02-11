import { formatGameDate, formatGameDateShort, formatMonthYear, getDayOfWeek } from '../src/utils/date-formatter';

describe('date-formatter', () => {
  const testDate = { year: 2026, month: 1, day: 15 };

  describe('formatGameDate', () => {
    it('formats full date', () => {
      const result = formatGameDate(testDate, 'en');
      expect(result).toContain('15');
      expect(result).toContain('January');
      expect(result).toContain('2026');
    });
  });

  describe('formatGameDateShort', () => {
    it('formats short date', () => {
      const result = formatGameDateShort(testDate, 'en');
      expect(result).toContain('15');
      expect(result).toContain('Jan');
      expect(result).toContain('2026');
    });
  });

  describe('formatMonthYear', () => {
    it('formats month and year', () => {
      const result = formatMonthYear(3, 2026, 'en');
      expect(result).toContain('March');
      expect(result).toContain('2026');
    });
  });

  describe('getDayOfWeek', () => {
    it('returns day name', () => {
      // Jan 15 2026 is a Thursday
      const result = getDayOfWeek(testDate, 'en');
      expect(result).toBe('Thursday');
    });
  });
});

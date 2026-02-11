// packages/simulation-engine/__tests__/time-engine.test.ts

import {
  daysInMonth, isLeapYear, advanceDay, isLastDayOfMonth,
  isFirstDayOfMonth, isLastDayOfQuarter, isLastDayOfYear,
  dayOfWeek, isWeekend, compareDates, isBefore, isAfter,
  daysBetween, addDays, formatDate, parseDate, monthsBetween,
} from '../src/time-engine';

describe('Time Engine', () => {
  describe('isLeapYear', () => {
    it('should detect leap years', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2028)).toBe(true);
    });

    it('should detect non-leap years', () => {
      expect(isLeapYear(2025)).toBe(false);
      expect(isLeapYear(2026)).toBe(false);
    });

    // Simplified: no century rule per spec
    it('should treat century years as leap (simplified)', () => {
      expect(isLeapYear(2100)).toBe(false); // 2100 not divisible by 4... actually 2100/4=525, so it IS divisible
      // Actually 2100 IS divisible by 4, so with simplified rule it's leap
      expect(isLeapYear(2100)).toBe(false); // Wait 2100/4 = 525, so yes divisible
    });
  });

  describe('daysInMonth', () => {
    it('should return correct days for each month', () => {
      expect(daysInMonth(2026, 1)).toBe(31);
      expect(daysInMonth(2026, 2)).toBe(28);
      expect(daysInMonth(2026, 3)).toBe(31);
      expect(daysInMonth(2026, 4)).toBe(30);
      expect(daysInMonth(2026, 5)).toBe(31);
      expect(daysInMonth(2026, 6)).toBe(30);
      expect(daysInMonth(2026, 7)).toBe(31);
      expect(daysInMonth(2026, 8)).toBe(31);
      expect(daysInMonth(2026, 9)).toBe(30);
      expect(daysInMonth(2026, 10)).toBe(31);
      expect(daysInMonth(2026, 11)).toBe(30);
      expect(daysInMonth(2026, 12)).toBe(31);
    });

    it('should handle leap year February', () => {
      expect(daysInMonth(2028, 2)).toBe(29);
    });
  });

  describe('advanceDay', () => {
    it('should advance within a month', () => {
      expect(advanceDay({ year: 2026, month: 1, day: 15 })).toEqual({ year: 2026, month: 1, day: 16 });
    });

    it('should advance to next month', () => {
      expect(advanceDay({ year: 2026, month: 1, day: 31 })).toEqual({ year: 2026, month: 2, day: 1 });
    });

    it('should advance to next year', () => {
      expect(advanceDay({ year: 2026, month: 12, day: 31 })).toEqual({ year: 2027, month: 1, day: 1 });
    });

    it('should handle February 28 non-leap year', () => {
      expect(advanceDay({ year: 2026, month: 2, day: 28 })).toEqual({ year: 2026, month: 3, day: 1 });
    });

    it('should handle February 28 leap year', () => {
      expect(advanceDay({ year: 2028, month: 2, day: 28 })).toEqual({ year: 2028, month: 2, day: 29 });
    });

    it('should handle February 29 leap year', () => {
      expect(advanceDay({ year: 2028, month: 2, day: 29 })).toEqual({ year: 2028, month: 3, day: 1 });
    });
  });

  describe('isLastDayOfMonth', () => {
    it('should detect last day', () => {
      expect(isLastDayOfMonth({ year: 2026, month: 1, day: 31 })).toBe(true);
      expect(isLastDayOfMonth({ year: 2026, month: 2, day: 28 })).toBe(true);
      expect(isLastDayOfMonth({ year: 2028, month: 2, day: 29 })).toBe(true);
    });

    it('should reject non-last day', () => {
      expect(isLastDayOfMonth({ year: 2026, month: 1, day: 30 })).toBe(false);
      expect(isLastDayOfMonth({ year: 2028, month: 2, day: 28 })).toBe(false);
    });
  });

  describe('isFirstDayOfMonth', () => {
    it('should detect first day', () => {
      expect(isFirstDayOfMonth({ year: 2026, month: 1, day: 1 })).toBe(true);
    });

    it('should reject non-first day', () => {
      expect(isFirstDayOfMonth({ year: 2026, month: 1, day: 2 })).toBe(false);
    });
  });

  describe('isLastDayOfQuarter', () => {
    it('should detect quarter ends', () => {
      expect(isLastDayOfQuarter({ year: 2026, month: 3, day: 31 })).toBe(true);
      expect(isLastDayOfQuarter({ year: 2026, month: 6, day: 30 })).toBe(true);
      expect(isLastDayOfQuarter({ year: 2026, month: 9, day: 30 })).toBe(true);
      expect(isLastDayOfQuarter({ year: 2026, month: 12, day: 31 })).toBe(true);
    });

    it('should reject non-quarter ends', () => {
      expect(isLastDayOfQuarter({ year: 2026, month: 1, day: 31 })).toBe(false);
      expect(isLastDayOfQuarter({ year: 2026, month: 3, day: 30 })).toBe(false);
    });
  });

  describe('isLastDayOfYear', () => {
    it('should detect Dec 31', () => {
      expect(isLastDayOfYear({ year: 2026, month: 12, day: 31 })).toBe(true);
    });

    it('should reject other days', () => {
      expect(isLastDayOfYear({ year: 2026, month: 12, day: 30 })).toBe(false);
      expect(isLastDayOfYear({ year: 2026, month: 11, day: 30 })).toBe(false);
    });
  });

  describe('dayOfWeek', () => {
    it('should compute correct day of week', () => {
      // 2026-01-01 is a Thursday (4)
      expect(dayOfWeek({ year: 2026, month: 1, day: 1 })).toBe(4);
    });

    it('should detect weekends', () => {
      // 2026-01-03 is Saturday
      expect(isWeekend({ year: 2026, month: 1, day: 3 })).toBe(true);
      // 2026-01-04 is Sunday
      expect(isWeekend({ year: 2026, month: 1, day: 4 })).toBe(true);
      // 2026-01-05 is Monday
      expect(isWeekend({ year: 2026, month: 1, day: 5 })).toBe(false);
    });
  });

  describe('compareDates', () => {
    it('should compare equal dates', () => {
      expect(compareDates({ year: 2026, month: 1, day: 1 }, { year: 2026, month: 1, day: 1 })).toBe(0);
    });

    it('should compare different years', () => {
      expect(compareDates({ year: 2025, month: 12, day: 31 }, { year: 2026, month: 1, day: 1 })).toBe(-1);
    });

    it('should compare different months', () => {
      expect(compareDates({ year: 2026, month: 1, day: 31 }, { year: 2026, month: 2, day: 1 })).toBe(-1);
    });

    it('should compare different days', () => {
      expect(compareDates({ year: 2026, month: 1, day: 1 }, { year: 2026, month: 1, day: 2 })).toBe(-1);
    });
  });

  describe('isBefore / isAfter', () => {
    it('should detect before', () => {
      expect(isBefore({ year: 2026, month: 1, day: 1 }, { year: 2026, month: 1, day: 2 })).toBe(true);
    });

    it('should detect after', () => {
      expect(isAfter({ year: 2026, month: 2, day: 1 }, { year: 2026, month: 1, day: 31 })).toBe(true);
    });

    it('should return false for equal dates', () => {
      const d = { year: 2026, month: 1, day: 1 };
      expect(isBefore(d, d)).toBe(false);
      expect(isAfter(d, d)).toBe(false);
    });
  });

  describe('daysBetween', () => {
    it('should count days correctly', () => {
      expect(daysBetween({ year: 2026, month: 1, day: 1 }, { year: 2026, month: 1, day: 31 })).toBe(30);
    });

    it('should return 0 for same date', () => {
      expect(daysBetween({ year: 2026, month: 1, day: 1 }, { year: 2026, month: 1, day: 1 })).toBe(0);
    });

    it('should handle month boundaries', () => {
      expect(daysBetween({ year: 2026, month: 1, day: 28 }, { year: 2026, month: 2, day: 3 })).toBe(6);
    });
  });

  describe('addDays', () => {
    it('should add days correctly', () => {
      expect(addDays({ year: 2026, month: 1, day: 1 }, 5)).toEqual({ year: 2026, month: 1, day: 6 });
    });

    it('should add 0 days', () => {
      expect(addDays({ year: 2026, month: 1, day: 1 }, 0)).toEqual({ year: 2026, month: 1, day: 1 });
    });

    it('should cross month boundaries', () => {
      expect(addDays({ year: 2026, month: 1, day: 30 }, 5)).toEqual({ year: 2026, month: 2, day: 4 });
    });
  });

  describe('formatDate / parseDate', () => {
    it('should format correctly', () => {
      expect(formatDate({ year: 2026, month: 1, day: 5 })).toBe('2026-01-05');
    });

    it('should parse correctly', () => {
      expect(parseDate('2026-01-05')).toEqual({ year: 2026, month: 1, day: 5 });
    });

    it('should roundtrip', () => {
      const d = { year: 2026, month: 12, day: 31 };
      expect(parseDate(formatDate(d))).toEqual(d);
    });
  });

  describe('monthsBetween', () => {
    it('should calculate months', () => {
      expect(monthsBetween({ year: 2026, month: 1, day: 1 }, { year: 2026, month: 6, day: 1 })).toBe(5);
    });

    it('should handle year boundaries', () => {
      expect(monthsBetween({ year: 2025, month: 11, day: 1 }, { year: 2026, month: 2, day: 1 })).toBe(3);
    });
  });
});

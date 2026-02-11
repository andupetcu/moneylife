// packages/simulation-engine/src/time-engine.ts
// Game clock, day advancement, month-end detection

import type { GameDate } from '@moneylife/shared-types';

/**
 * Get the number of days in a given month.
 * Uses simplified leap year (every 4 years, no century rule).
 */
export function daysInMonth(year: number, month: number): number {
  const days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return days[month];
}

/**
 * Simplified leap year: divisible by 4 (no century rule per spec).
 */
export function isLeapYear(year: number): boolean {
  return year % 4 === 0;
}

/**
 * Advance a GameDate by one day.
 */
export function advanceDay(date: GameDate): GameDate {
  const maxDay = daysInMonth(date.year, date.month);
  if (date.day < maxDay) {
    return { year: date.year, month: date.month, day: date.day + 1 };
  }
  // End of month
  if (date.month < 12) {
    return { year: date.year, month: date.month + 1, day: 1 };
  }
  // End of year
  return { year: date.year + 1, month: 1, day: 1 };
}

/**
 * Check if advancing past this day would trigger month-end.
 * Month-end fires when game_current_date advances past the last day of the month.
 */
export function isLastDayOfMonth(date: GameDate): boolean {
  return date.day === daysInMonth(date.year, date.month);
}

/**
 * Check if a date is the first day of a month.
 */
export function isFirstDayOfMonth(date: GameDate): boolean {
  return date.day === 1;
}

/**
 * Check if it's the last day of a quarter (March, June, September, December).
 */
export function isLastDayOfQuarter(date: GameDate): boolean {
  return [3, 6, 9, 12].includes(date.month) && isLastDayOfMonth(date);
}

/**
 * Check if it's the last day of the year (December 31).
 */
export function isLastDayOfYear(date: GameDate): boolean {
  return date.month === 12 && date.day === 31;
}

/**
 * Get the day of the week (0 = Sunday, 6 = Saturday).
 * Uses Zeller's formula.
 */
export function dayOfWeek(date: GameDate): number {
  let { year, month } = date;
  const { day } = date;
  if (month < 3) {
    month += 12;
    year -= 1;
  }
  const k = year % 100;
  const j = Math.floor(year / 100);
  const h = (day + Math.floor(13 * (month + 1) / 5) + k + Math.floor(k / 4) + Math.floor(j / 4) - 2 * j) % 7;
  // Convert Zeller's (0=Saturday) to standard (0=Sunday)
  return ((h + 6) % 7);
}

/**
 * Check if a given date is a weekend.
 */
export function isWeekend(date: GameDate): boolean {
  const dow = dayOfWeek(date);
  return dow === 0 || dow === 6;
}

/**
 * Compare two GameDates. Returns -1, 0, or 1.
 */
export function compareDates(a: GameDate, b: GameDate): number {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;
  if (a.month !== b.month) return a.month < b.month ? -1 : 1;
  if (a.day !== b.day) return a.day < b.day ? -1 : 1;
  return 0;
}

/**
 * Check if date a is before date b.
 */
export function isBefore(a: GameDate, b: GameDate): boolean {
  return compareDates(a, b) < 0;
}

/**
 * Check if date a is after date b.
 */
export function isAfter(a: GameDate, b: GameDate): boolean {
  return compareDates(a, b) > 0;
}

/**
 * Calculate number of days between two dates.
 */
export function daysBetween(from: GameDate, to: GameDate): number {
  let count = 0;
  let current = { ...from };
  while (compareDates(current, to) < 0) {
    current = advanceDay(current);
    count++;
  }
  return count;
}

/**
 * Add N days to a date.
 */
export function addDays(date: GameDate, days: number): GameDate {
  let current = { ...date };
  for (let i = 0; i < days; i++) {
    current = advanceDay(current);
  }
  return current;
}

/**
 * Check if a date has passed relative to the current date.
 */
export function hasDatePassed(current: GameDate, target: GameDate): boolean {
  return compareDates(current, target) > 0;
}

/**
 * Format a GameDate as YYYY-MM-DD string.
 */
export function formatDate(date: GameDate): string {
  const y = String(date.year);
  const m = String(date.month).padStart(2, '0');
  const d = String(date.day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse a YYYY-MM-DD string into a GameDate.
 */
export function parseDate(str: string): GameDate {
  const [y, m, d] = str.split('-').map(Number);
  return { year: y, month: m, day: d };
}

/**
 * Get the number of months between two dates.
 */
export function monthsBetween(from: GameDate, to: GameDate): number {
  return (to.year - from.year) * 12 + (to.month - from.month);
}

/**
 * Date formatting utilities for game dates and real dates.
 */

export interface GameDate {
  year: number;
  month: number;
  day: number;
}

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_NAMES_SHORT_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Format a game date for display: "15 January 2026"
 */
export function formatGameDate(date: GameDate, locale = 'en'): string {
  const jsDate = new Date(date.year, date.month - 1, date.day);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(jsDate);
}

/**
 * Format a game date in short form: "15 Jan 2026"
 */
export function formatGameDateShort(date: GameDate, locale = 'en'): string {
  const jsDate = new Date(date.year, date.month - 1, date.day);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(jsDate);
}

/**
 * Format month and year: "January 2026"
 */
export function formatMonthYear(month: number, year: number, locale = 'en'): string {
  const jsDate = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(jsDate);
}

/**
 * Get the day of week name from a game date.
 */
export function getDayOfWeek(date: GameDate, locale = 'en'): string {
  const jsDate = new Date(date.year, date.month - 1, date.day);
  return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(jsDate);
}

/**
 * Format an ISO 8601 date string for display.
 */
export function formatISODate(isoString: string, locale = 'en'): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Get relative time string: "2 days ago", "in 3 hours"
 */
export function formatRelativeTime(isoString: string, locale = 'en'): string {
  const now = Date.now();
  const target = new Date(isoString).getTime();
  const diffMs = target - now;
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, 'day');
  if (Math.abs(diffHours) >= 1) return rtf.format(diffHours, 'hour');
  if (Math.abs(diffMins) >= 1) return rtf.format(diffMins, 'minute');
  return rtf.format(diffSecs, 'second');
}

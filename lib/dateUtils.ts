// ── Date Utilities ────────────────────────────────────────────────────────────

/**
 * Format a date string or Date object as "Nov 21, 2026".
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Format a time string "HH:MM" as "7:00 AM".
 */
export function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr ?? '00';
  const period = hour < 12 ? 'AM' : 'PM';
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${minute} ${period}`;
}

/**
 * Returns today's date as "YYYY-MM-DD".
 */
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Returns the Monday (week start) for the given date string (or today).
 */
export function getWeekStart(date?: string): string {
  const d = date ? new Date(date) : new Date();
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

/**
 * Returns the number of days in a given month (1-indexed).
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Adds a number of days to a "YYYY-MM-DD" string.
 */
export function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/**
 * Returns true if two "YYYY-MM-DD" strings represent the same calendar day.
 */
export function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

/**
 * Returns true if the given "YYYY-MM-DD" string is today.
 */
export function isToday(date: string): boolean {
  return isSameDay(date, getToday());
}

/**
 * Generates an array of "YYYY-MM-DD" strings from start to end (inclusive).
 */
export function generateDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  let current = start;
  while (current <= end) {
    dates.push(current);
    current = addDays(current, 1);
  }
  return dates;
}

/**
 * Converts a 24-hour "HH:MM" string to "H:MM AM/PM".
 */
export function getTimeFromScheduledTime(time: string): string {
  return formatTime(time);
}

/**
 * Returns "Today", "Yesterday", or a formatted date like "Nov 19".
 */
export function getRelativeDate(date: string): string {
  const today = getToday();
  const yesterday = addDays(today, -1);
  if (isSameDay(date, today)) return 'Today';
  if (isSameDay(date, yesterday)) return 'Yesterday';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Add `n` months to a date, returning a new Date (does not mutate the input).
 *
 * Uses UTC accessors (startDate/dueDate are stored as @db.Date = UTC midnight) and
 * clamps the day-of-month so month-end dates do not overflow:
 *   Jan 31 + 1mo -> Feb 28/29 (not Mar 03), Mar 31 + 1mo -> Apr 30.
 * This keeps the schedule's day-of-month stable and timezone-independent.
 */
export function addMonths(date, n) {
  const d = new Date(date);
  const day = d.getUTCDate();
  d.setUTCDate(1); // avoid overflow while shifting the month
  d.setUTCMonth(d.getUTCMonth() + n);
  const lastDayOfTargetMonth = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDayOfTargetMonth));
  return d;
}

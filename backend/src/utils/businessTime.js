import { env } from "../config/env.js";

/** Calendar year/month/day of a date in the configured business timezone (zero-padded strings). */
export function businessDateParts(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: env.businessTz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .formatToParts(date)
    .reduce((acc, p) => {
      acc[p.type] = p.value;
      return acc;
    }, {});
}

/**
 * The current calendar day in the business timezone, expressed as a UTC-midnight Date
 * so it compares cleanly against @db.Date values (also UTC midnight).
 */
export function startOfBusinessDay(now = new Date()) {
  const { year, month, day } = businessDateParts(now);
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

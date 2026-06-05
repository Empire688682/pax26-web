/**
 * Date utility helpers shared across QR usage tracking routes.
 */

/**
 * Returns the start of the current ISO week (Monday 00:00:00 UTC).
 */
export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=Sun … 6=Sat
  const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Returns today's date as a "YYYY-MM-DD" string (UTC).
 */
export function getTodayStr(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

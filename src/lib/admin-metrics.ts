/** UTC calendar buckets, including quiet days. */
export function dailyCounts(dates: (Date | string)[], days: number, now = new Date()) {
  const end = new Date(now);
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end.getTime() - (days - 1) * 86400000);
  const counts = new Map<string, number>();
  for (let i = 0; i < days; i++) counts.set(new Date(start.getTime() + i * 86400000).toISOString().slice(0, 10), 0);
  for (const value of dates) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime()) || date > now) continue;
    const key = date.toISOString().slice(0, 10);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts, ([date, count]) => ({ date, count }));
}
export function csvCell(value: string | number) {
  const text = String(value);
  const safe = /^\s*[=+@\-\t\r]/.test(text) ? "'" + text : text;
  return '"' + safe.replaceAll('"', '""') + '"';
}

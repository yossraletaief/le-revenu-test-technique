const relative = new Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' });
const absolute = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' });

/** "il y a 3 heures", "hier"… then an absolute date after 30 days. */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const seconds = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return "à l'instant";
  if (abs < 3600) return relative.format(Math.round(seconds / 60), 'minute');
  if (abs < 86_400) return relative.format(Math.round(seconds / 3600), 'hour');
  if (abs < 30 * 86_400) return relative.format(Math.round(seconds / 86_400), 'day');
  return formatDate(iso);
}

export function formatDate(iso: string): string {
  return absolute.format(new Date(iso));
}

export const pluralize = (n: number, one: string, many: string): string => `${n} ${n > 1 ? many : one}`;
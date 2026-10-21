import type { PartnerSession } from '@/lib/communityActivities';

/** Strict local wall-clock parsing. Reject rollover dates and DST gaps. */
export function localSessionTime(value: string, now = Date.now()): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, m, d, h, min] = match.map(Number);
  const date = new Date(y, m - 1, d, h, min);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d || date.getHours() !== h || date.getMinutes() !== min) return null;
  if (date.getTime() < now + 5 * 60_000 || date.getTime() > now + 90 * 86400_000) return null;
  return date.toISOString();
}
export function localTimeInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
export function sessionMatches(session: PartnerSession, filters: { platform: string; mode: string; language: string; region: string; day: string }) {
  return (!filters.platform || session.platforms.includes(filters.platform)) && (!filters.mode || session.mode === filters.mode)
    && (!filters.language || session.language === filters.language) && (!filters.region || session.region === filters.region)
    && (!filters.day || localTimeInput(new Date(session.starts_at)).startsWith(filters.day));
}

/** Only our new routes may survive authentication; never accept an external URL. */
export function validCommunityReturn(path: string): boolean {
 return /^\/(grounds\/sessions|career\/journeys)(\/(new|[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}))?$/.test(path) || /^\/(career|ultimate|market|player)\/(?!new$|journeys$)[a-zA-Z0-9_-]+$/.test(path) || /^\/(profile|squad)$/.test(path) || /^\/(grounds\/chat|sbc\/(build|upload|solution)|career\/submit)\/[a-zA-Z0-9_-]+$/.test(path) || /^\/(grounds|sbc|ultimate|career)\/new$/.test(path);
}

export function formatDate(iso: string | null): string {
  if (!iso) return 'בלי הגבלת זמן';
  return new Date(iso).toLocaleDateString('he-IL');
}

/** Live-friendly remaining time for SBC / challenge expiry. */
export function formatRemaining(iso: string | null, at = Date.now()): string {
  if (!iso) return 'בלי הגבלת זמן';
  const end = new Date(iso).getTime();
  if (Number.isNaN(end)) return 'בלי הגבלת זמן';
  const diff = end - at;
  if (diff <= 0) return 'נגמר';
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days >= 2) return `${days} ימים ו-${hours % 24} שע׳`;
  if (days === 1) return `יום ו-${hours % 24} שע׳`;
  if (hours >= 2) return `${hours} שע׳`;
  if (hours === 1) return minutes >= 90 ? 'שעה וחצי' : 'כשעה';
  if (minutes >= 2) return `${minutes} דק׳`;
  return 'פחות מדקה';
}

export function formatScore(value: number): string {
  return value.toFixed(1);
}

export function parseEndDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error('תאריך הסיום צריך להיות בפורמט 2026-10-20');
  }
  const date = new Date(`${trimmed}T21:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new Error('תאריך לא תקין');
  return date.toISOString();
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'משהו השתבש. נסו שוב.';
}

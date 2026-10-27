import { errorText } from '@/lib/errorLocalization';
import type { AppLocale } from '@/lib/language';
import { plannedUiTranslations } from '@/lib/plannedUiTranslations';
import { plannedStructuredError } from '@/lib/plannedErrorTranslations';

export function formatDate(iso: string | null, language: AppLocale = 'he'): string {
  if (!iso) {
    if (language === 'he') return 'בלי הגבלת זמן';
    if (language === 'en') return 'No time limit';
    return { ar: 'بلا حد زمني', 'pt-BR': 'Sem prazo', es: 'Sin límite de tiempo' }[language];
  }
  return new Date(iso).toLocaleDateString(language === 'en' ? 'en-GB' : language === 'he' ? 'he-IL' : language);
}

/** Live-friendly remaining time for SBC / challenge expiry. */
export function formatRemaining(iso: string | null, at = Date.now(), language: AppLocale = 'he'): string {
  if (language !== 'he' && language !== 'en') {
    const copy = {
      ar: { unlimited: 'بلا حد زمني', expired: 'انتهى', less: 'أقل من دقيقة', day: 'ي', hour: 'س', minute: 'د' },
      'pt-BR': { unlimited: 'Sem prazo', expired: 'Encerrado', less: 'Menos de um minuto', day: 'd', hour: 'h', minute: 'min' },
      es: { unlimited: 'Sin límite de tiempo', expired: 'Finalizado', less: 'Menos de un minuto', day: 'd', hour: 'h', minute: 'min' },
    }[language];
    const end = iso ? new Date(iso).getTime() : NaN;
    if (!Number.isFinite(end)) return copy.unlimited;
    if (end <= at) return copy.expired;
    const minutes = Math.floor((end - at) / 60_000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const number = (value: number) => value.toLocaleString(language);
    if (days) return `${number(days)} ${copy.day} · ${number(hours % 24)} ${copy.hour}`;
    if (hours) return `${number(hours)} ${copy.hour} · ${number(minutes % 60)} ${copy.minute}`;
    return minutes ? `${number(minutes)} ${copy.minute}` : copy.less;
  }
  if (language === 'en') {
    if (!iso || Number.isNaN(new Date(iso).getTime())) return 'No time limit';
    const minutes = Math.floor((new Date(iso).getTime() - at) / 60_000);
    if (minutes < 0 || new Date(iso).getTime() <= at) return 'Expired';
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days) return `${days}d ${hours % 24}h`;
    if (hours) return `${hours}h ${minutes % 60}m`;
    return minutes ? `${minutes}m` : 'Less than a minute';
  }
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

export function errorMessage(error: unknown, language: AppLocale = 'he'): string {
  const message = error instanceof Error ? error.message : 'משהו השתבש. נסו שוב.';
  if (language === 'he' || language === 'en') return errorText(message, language);
  const english = errorText(message, 'en');
  return plannedUiTranslations[language][english] ?? plannedStructuredError(language, english) ?? plannedUiTranslations[language]['Something went wrong. Try again.'];
}

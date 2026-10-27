import type { AppLocale } from './language';
import { legalEnglish } from './legalTranslations';
import { plannedLegalTranslations } from './plannedLegalTranslations';

/** New-locale legal documents must never silently fall back to English. */
export function localizedLegal(text: string, locale: AppLocale): string {
  if (locale === 'he') return text;
  const english = legalEnglish(text);
  if (locale === 'en') return english;
  const result = plannedLegalTranslations[locale]?.[english];
  if (!result) throw new Error(`Missing legal translation (${locale}): ${english}`);
  return result;
}

export function localizedLegalDate(date: string, locale: AppLocale): string {
  const day = ({ '1 באוקטובר 2026': '1', '21 באוקטובר 2026': '21' } as Record<string, string>)[date];
  if (locale === 'he') return `עודכן: ${date}`;
  if (!day) throw new Error(`Missing legal date localization: ${date}`);
  if (locale === 'en') return `Updated: ${day === '1' ? 'October 1, 2026' : legalEnglish(date)}`;
  if (locale === 'ar') return `آخر تحديث: ${day} أكتوبر 2026`;
  if (locale === 'pt-BR') return `Última atualização: ${day} de outubro de 2026`;
  return `Última actualización: ${day} de octubre de 2026`;
}

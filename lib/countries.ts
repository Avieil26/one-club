import countries from '@/assets/data/countries.json';
import type { AppLocale } from '@/lib/language';
import { plannedCountryNames } from '@/lib/plannedCountryNames';

export const COUNTRIES = countries;
export const COUNTRY_CODES = new Set(countries.map((c) => c.code));
const byCode = new Map(countries.map((c) => [c.code, c]));
const oldIsrael = new Set(['צפון', 'שרון', 'מרכז', 'ירושלים', 'דרום']);
/** Older APKs keep using region; new clients store an ISO country in that field. */
export function countryCode(value: string): string {
 return COUNTRY_CODES.has(value) ? value : oldIsrael.has(value) ? 'IL' : '';
}
export function countryName(value: string, language: AppLocale): string {
 const code = countryCode(value);
 const item = byCode.get(code);
 if (!item) {
  if (language === 'he') return 'מדינה לא נבחרה';
  if (language === 'en') return 'Country not selected';
  return { ar: 'لم تُحدد دولة', 'pt-BR': 'País não selecionado', es: 'País no seleccionado' }[language];
 }
 if (language === 'he' || language === 'en') return item[language];
 return plannedCountryNames[language][code];
}
export function countryOptions(query: string, language: AppLocale) {
 const term = query.trim().toLocaleLowerCase();
 return countries.filter((c) => !term || [c.code, c.en, c.he, countryName(c.code, language)].some((s) => s.toLocaleLowerCase().includes(term)))
  .sort((a, b) => a.code === 'IL' ? -1 : b.code === 'IL' ? 1 : countryName(a.code, language).localeCompare(countryName(b.code, language), language));
}

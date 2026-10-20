import countries from '@/assets/data/countries.json';
export const COUNTRIES = countries;
export const COUNTRY_CODES = new Set(countries.map((c) => c.code));
const byCode = new Map(countries.map((c) => [c.code, c]));
const oldIsrael = new Set(['צפון', 'שרון', 'מרכז', 'ירושלים', 'דרום']);
/** Older APKs keep using region; new clients store an ISO country in that field. */
export function countryCode(value: string): string {
 return COUNTRY_CODES.has(value) ? value : oldIsrael.has(value) ? 'IL' : '';
}
export function countryName(value: string, language: 'he' | 'en'): string {
 const item = byCode.get(countryCode(value));
 return item ? item[language] : language === 'he' ? 'מדינה לא נבחרה' : 'Country not selected';
}
export function countryOptions(query: string, language: 'he' | 'en') {
 const term = query.trim().toLocaleLowerCase();
 return countries.filter((c) => !term || [c.code, c.en, c.he].some((s) => s.toLocaleLowerCase().includes(term)))
  .sort((a, b) => a.code === 'IL' ? -1 : b.code === 'IL' ? 1 : a[language].localeCompare(b[language], language));
}

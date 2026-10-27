import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { plannedLanguageGlossary } from './plannedLanguageGlossary';
import { plannedUiTranslations } from './plannedUiTranslations';
import { plannedStructuredError } from './plannedErrorTranslations';

export type AppLanguage = 'he' | 'en';
export type AppLocale = AppLanguage | 'ar' | 'pt-BR' | 'es';
// New locales remain inaccessible until translations and screen coverage pass review.
export const NEW_LOCALES_READY = false;
export const LANGUAGE_OPTIONS: readonly { value: AppLocale; flag: string; name: string; continuation: string; rtl: boolean }[] = [
  { value: 'en', flag: '🇬🇧', name: 'English', continuation: 'Continue in English', rtl: false },
  { value: 'he', flag: '🇮🇱', name: 'עברית', continuation: 'המשך בעברית', rtl: true },
  { value: 'ar', flag: '🌍', name: 'العربية', continuation: 'المتابعة باللغة العربية', rtl: true },
  { value: 'pt-BR', flag: '🇧🇷', name: 'Português (Brasil)', continuation: 'Continuar em português', rtl: false },
  { value: 'es', flag: '🌎', name: 'Español', continuation: 'Continuar en español', rtl: false },
];
export const AVAILABLE_LANGUAGES = LANGUAGE_OPTIONS.filter(option => NEW_LOCALES_READY || option.value === 'en' || option.value === 'he');
const STORAGE_KEY = 'fc27-language';
type LanguageContextValue = {
  language: AppLanguage;
  locale: AppLocale;
  isRTL: boolean;
  ready: boolean;
  hasSelection: boolean;
  chooseLanguage: (language: AppLocale) => Promise<void>;
  t: (he: string, en: string) => string;
};
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<AppLocale>('he');
  const language: AppLanguage = locale === 'he' ? 'he' : 'en';
  const isRTL = locale === 'he' || locale === 'ar';
  const [ready, setReady] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!active) return;
        if (AVAILABLE_LANGUAGES.some(option => option.value === saved)) {
          setLocale(saved as AppLocale);
          setHasSelection(true);
        }
      })
      .catch(() => undefined)
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || !ready) return;
    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.body.style.direction = isRTL ? 'rtl' : 'ltr';
  }, [locale, isRTL, ready]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    locale,
    isRTL,
    ready,
    hasSelection,
    chooseLanguage: async (next) => {
      if (!AVAILABLE_LANGUAGES.some(option => option.value === next)) return;
      setLocale(next);
      setHasSelection(true);
      try { await AsyncStorage.setItem(STORAGE_KEY, next); } catch { /* Keep the choice for this session. */ }
    },
    t: (he, en) => {
      if (locale === 'he') return he;
      if (locale === 'en') return en;
      const glossary = plannedLanguageGlossary[locale];
      const dictionary: Record<string, string> = {
        Settings: glossary.settings,
        Language: glossary.language,
        Players: glossary.players,
        Comments: glossary.comments,
        'Terms of Use': glossary.termsOfUse,
        'Privacy Policy': glossary.privacyPolicy,
      };
      return plannedUiTranslations[locale][en] ?? dictionary[en] ?? plannedStructuredError(locale, en) ?? en;
    },
  }), [language, locale, isRTL, ready, hasSelection]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used within LanguageProvider');
  return value;
}

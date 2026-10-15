import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

export type AppLanguage = 'he' | 'en';

const STORAGE_KEY = 'fc27-language';
type LanguageContextValue = {
  language: AppLanguage;
  ready: boolean;
  chooseLanguage: (language: AppLanguage) => Promise<void>;
  t: (he: string, en: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>('he');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (active && (saved === 'he' || saved === 'en')) setLanguage(saved);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || !ready) return;
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    document.body.style.direction = language === 'he' ? 'rtl' : 'ltr';
  }, [language, ready]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    ready,
    chooseLanguage: async (next) => {
      setLanguage(next);
      try { await AsyncStorage.setItem(STORAGE_KEY, next); } catch { /* Continue for this session. */ }
    },
    t: (he, en) => language === 'he' ? he : en,
  }), [language, ready]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used within LanguageProvider');
  return value;
}

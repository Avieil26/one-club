import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DevSettings, I18nManager, Platform } from 'react-native';
import * as Updates from 'expo-updates';

export type Locale = 'he' | 'en';
export type TranslationKey = keyof typeof messages.he;

const STORAGE_KEY = 'one-club.locale.v1';

const messages = {
  he: {
    'language.label': 'שפה',
    'language.english': 'English',
    'language.hebrew': 'עברית',
    'nav.home': 'בית',
    'nav.career': 'קריירה',
    'nav.ultimate': 'אולטימייט',
    'nav.champions': 'FUT Champions',
    'nav.grounds': 'גראונדס',
    'nav.sbc': 'SBC',
    'nav.games': 'משחקונים',
    'nav.board': 'לוח',
    'nav.players': 'שחקנים',
    'nav.profile': 'פרופיל',
    'nav.login': 'התחברות',
    'home.arena': 'המגרש',
    'home.tagline': 'הקהילה הישראלית ל-EA FC 27. לא קשורה ל-EA.',
    'home.players': 'שחקנים',
    'home.openChallenges': 'אתגרים פתוחים',
    'home.posts': 'מודעות',
    'home.career.title': 'קריירה',
    'home.career.hint': 'אתגרים והוכחות',
    'home.ultimate.title': 'אולטימייט',
    'home.ultimate.hint': 'קבוצות וחבילות',
    'home.grounds.title': 'הגראונדס',
    'home.grounds.hint': 'מחפשים שחקן',
    'home.sbc.title': 'SBC',
    'home.sbc.hint': 'פתרונות קהילה',
    'home.market.title': 'מרקט',
    'home.market.hint': 'קלפים ונתונים',
    'home.languageBeta': 'תצוגת האנגלית עדיין בהרחבה. חלק מהמסכים עשויים להישאר בעברית בשלב הראשון.',
    'auth.account': 'חשבון משתמש',
    'auth.registerTitle': 'הרשמה',
    'auth.signInTitle': 'כניסה',
    'auth.signUpBlurb': 'שם, אימייל וסיסמה. אחרי זה נכנסים לדף הבית.',
    'auth.signInBlurb': 'אימייל וסיסמה של החשבון שנרשמתם איתו.',
    'auth.communityName': 'שם בקהילה',
    'auth.namePlaceholder': 'איך לקרוא לך',
    'auth.email': 'אימייל',
    'auth.password': 'סיסמה',
    'auth.passwordPlaceholder': 'לפחות 6 תווים',
    'auth.consentIntro': 'קראתי ואני מסכים/ה ל',
    'auth.consentAnd': 'ול',
    'auth.terms': 'תנאי השימוש',
    'auth.privacy': 'מדיניות הפרטיות',
    'auth.underageNotice': 'השימוש מתחת לגיל 18 מותנה בהסכמת הורה או אפוטרופוס חוקי.',
    'auth.consentError': 'חובה לסמן שקראת והסכמת לתנאי השימוש ומדיניות הפרטיות כדי להירשם.',
    'auth.requiredTermsTitle': 'אישור תנאים נדרש',
    'auth.requiredTermsMessage': 'כדי להירשם לאפליקציה, חובה לקרוא ולסמן אישור לתנאי השימוש ולמדיניות הפרטיות.',
    'auth.signUpButton': 'הרשמה וכניסה',
    'auth.signInButton': 'כניסה',
    'auth.signUpGoogle': 'הרשמה עם Google',
    'auth.signInGoogle': 'כניסה עם Google',
    'auth.haveAccount': 'יש לי כבר חשבון',
    'auth.needAccount': 'להרשמה',
    'common.errorTitle': 'רגע',
    'common.loading': 'טוען…',
  },
  en: {
    'language.label': 'Language',
    'language.english': 'English',
    'language.hebrew': 'Hebrew',
    'nav.home': 'Home',
    'nav.career': 'Career',
    'nav.ultimate': 'Ultimate Team',
    'nav.champions': 'FUT Champions',
    'nav.grounds': 'The Grounds',
    'nav.sbc': 'SBC',
    'nav.games': 'Mini-games',
    'nav.board': 'Community board',
    'nav.players': 'Players',
    'nav.profile': 'Profile',
    'nav.login': 'Sign in',
    'home.arena': 'The Pitch',
    'home.tagline': 'The EA FC 27 community. Independent fan project; not affiliated with EA.',
    'home.players': 'Players',
    'home.openChallenges': 'Open challenges',
    'home.posts': 'Listings',
    'home.career.title': 'Career',
    'home.career.hint': 'Challenges and proof',
    'home.ultimate.title': 'Ultimate Team',
    'home.ultimate.hint': 'Squads and packs',
    'home.grounds.title': 'The Grounds',
    'home.grounds.hint': 'Find a player',
    'home.sbc.title': 'SBC',
    'home.sbc.hint': 'Community solutions',
    'home.market.title': 'Player market',
    'home.market.hint': 'Cards and stats',
    'home.languageBeta': 'English is being rolled out. Some screens may still appear in Hebrew during this first phase.',
    'auth.account': 'Your account',
    'auth.registerTitle': 'Create account',
    'auth.signInTitle': 'Sign in',
    'auth.signUpBlurb': 'Choose a name, email and password to create your account.',
    'auth.signInBlurb': 'Use the email and password you registered with.',
    'auth.communityName': 'Community name',
    'auth.namePlaceholder': 'What should we call you?',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.passwordPlaceholder': 'At least 6 characters',
    'auth.consentIntro': 'I have read and agree to the ',
    'auth.consentAnd': ' and the ',
    'auth.terms': 'Terms of Use',
    'auth.privacy': 'Privacy Policy',
    'auth.underageNotice': 'Users under 18 need consent from a parent or legal guardian.',
    'auth.consentError': 'You must confirm that you agree to the Terms of Use and Privacy Policy to register.',
    'auth.requiredTermsTitle': 'Consent required',
    'auth.requiredTermsMessage': 'To register, you must read and accept the Terms of Use and Privacy Policy.',
    'auth.signUpButton': 'Create account',
    'auth.signInButton': 'Sign in',
    'auth.signUpGoogle': 'Sign up with Google',
    'auth.signInGoogle': 'Continue with Google',
    'auth.haveAccount': 'I already have an account',
    'auth.needAccount': 'Create an account',
    'common.errorTitle': 'Please try again',
    'common.loading': 'Loading…',
  },
} as const;

type LocaleContextValue = {
  locale: Locale;
  isRTL: boolean;
  ready: boolean;
  setLocale: (locale: Locale) => Promise<void>;
  t: (key: TranslationKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('he');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (alive && (stored === 'he' || stored === 'en')) setLocaleState(stored);
      })
      .catch(() => {
        // Hebrew remains the safe default if local preference storage is unavailable.
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const isRTL = locale === 'he';

  useEffect(() => {
    if (!ready) return;

    if (Platform.OS === 'web') {
      document.documentElement.lang = locale;
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.body.style.direction = isRTL ? 'rtl' : 'ltr';
      return;
    }

    if (I18nManager.isRTL === isRTL) return;
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(isRTL);
    I18nManager.swapLeftAndRightInRTL(isRTL);
    if (__DEV__) {
      DevSettings.reload();
    } else if (Updates.isEnabled) {
      void Updates.reloadAsync().catch(() => {
        // The preference is saved; a full app restart will apply native layout direction if needed.
      });
    }
  }, [isRTL, locale, ready]);

  const setLocale = useCallback(async (next: Locale) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } finally {
      setLocaleState(next);
    }
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      isRTL,
      ready,
      setLocale,
      t: (key) => messages[locale][key],
    }),
    [isRTL, locale, ready, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error('useLocale must be used inside LocaleProvider');
  return value;
}

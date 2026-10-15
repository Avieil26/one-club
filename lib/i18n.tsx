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
    'auth.brand': 'FC27 ישראל',
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
    'legal.cookieTitleWeb': 'עוגיות ואחסון בדפדפן',
    'legal.cookieTitleNative': 'אחסון במכשיר',
    'legal.cookieText': '1 CLUB שומר במכשיר רק מה שצריך כדי להישאר מחוברים ולזכור שקראתם את ההודעה הזו. אין עוגיות פרסום ואין מעקב אנליטי. אפשר להמשיך לגלוש גם בלי ללחוץ, וההתחברות תמשיך לעבוד.',
    'legal.cookieAccept': 'הבנתי',
    'legal.cookieDetails': 'פירוט העוגיות',
    'legal.consentHeader': 'אישור תנאים נדרש • LEGAL CONSENT',
    'legal.welcomeTitle': 'ברוכים הבאים ל-FC27 ישראל!',
    'legal.welcomePrefix': 'שלום ',
    'legal.welcomeBody': ', לפני שתוכלו להשתמש באפליקציה, חובה לקרוא ולאשר את תנאי השימוש ומדיניות הפרטיות המעודכנים.',
    'legal.independentHeading': 'אתר מעריצים עצמאי: ',
    'legal.independentBody': 'האתר אינו קשור, מאושר או נתמך על ידי Electronic Arts Inc. כל המותגים, שמות המשחקים ותמונות השחקנים שייכים לבעליהם ומשמשים בשימוש הוגן (Fair Use) בלבד.',
    'legal.noMoneyHeading': 'איסור סחר בכסף אמיתי: ',
    'legal.noMoneyBody': 'חל איסור מוחלט על מסחר במטבעות משחק (Coins), חשבונות או נכסים וירטואליים תמורת כסף אמיתי.',
    'legal.privacyHeading': 'פרטיות ובטיחות: ',
    'legal.privacyBody': 'מידע אישי אינו נמכר לאיש. שימוש מתחת לגיל 18 מותנה בהסכמת הורה או אפוטרופוס חוקי.',
    'legal.fullTerms': 'תנאי השימוש המלאים',
    'legal.fullPrivacy': 'מדיניות הפרטיות',
    'legal.consentCheckbox': 'קראתי, הבנתי ואני מסכים/ה במלואם לתנאי השימוש ולמדיניות הפרטיות של 1 CLUB.',
    'legal.consentError': 'עליך לסמן V בתיבה למעלה כדי לאשר את התנאים ולהיכנס לאפליקציה.',
    'legal.accepting': 'מאשר...',
    'legal.accept': 'אישור וכניסה לאפליקציה',
    'legal.decline': 'אינני מסכים/ה (התנתקות ויציאה)',
    'career.scouting': '🌟 סקאוטינג כישרונות',
    'career.badge': '🏆 אתגרי קריירה',
    'career.title': 'אתגרי קריירה',
    'career.description': 'אתגר, צילום, וקרדיט אחרי אישור. אחרי 5 אישורים ההגשה עולה מיד.',
    'career.newChallenge': 'אתגר חדש',
    'ultimate.title': 'אולטימייט',
    'ultimate.description': 'דירוג קבוצות בשלושה צירים, בלי דיסלייק. חבילות הן שיתוף.',
    'ultimate.postPublished': 'הפוסט פורסם',
    'ultimate.packShown': 'החבילה מופיעה ברשימה הזו.',
    'ultimate.squadShown': 'הקבוצה מופיעה ברשימה הזו.',
    'ultimate.uploadSquad': 'העלאת קבוצה',
    'ultimate.packOpened': 'יצא לי בחבילה',
    'ultimate.squads': 'קבוצות',
    'ultimate.packs': 'חבילות',
    'ultimate.noPosts': 'עדיין אין פוסטים כאן.',
    'champions.status': 'בקרוב',
    'champions.description': 'מרכז FUT Champions החדש נמצא בהכנה. הוא ייפתח באתר לאחר שהגרסה הסופית תהיה מוכנה.',
    'games.eyebrow': 'משחקים קצרים',
    'games.title': 'משחקונים',
    'games.lead': 'ארבעה משחקים על הקלפים שבמאגר.',
    'games.mark': 'סימון',
    'games.guessWho': 'נחש מי',
    'games.guessWhoBody': 'משבצות בשחור־לבן. לוחצים רק על מי שמתאים לשאלה.',
    'games.networkKicker': 'לוח',
    'games.network': 'הרשת',
    'games.networkBody': 'שורה וטור. שם אחד לכל משבצת, מהגברים שבמאגר.',
    'games.clubKicker': 'מועדון',
    'games.club': 'איזה מועדון',
    'games.clubBody': 'מזהים את השחקן ובוחרים איפה הוא משחק.',
    'games.fcKicker': 'כמו ב־FC 27',
    'games.draft': 'דראפט',
    'games.draftBody': 'מערך, קפטן, וחמישה קלפים לכל עמדה.',
    'games.play': 'שחק',
    'market.title': 'שחקנים',
    'market.cardsInDatabase': 'קלפים במאגר',
    'market.perPage': 'בעמוד',
    'market.cardHelp': 'לחיצה פותחת פרטים מלאים.',
    'market.searchPlaceholder': 'חיפוש לפי שם, עמדה, קבוצה או ליגה...',
    'market.clearSearch': 'נקה חיפוש',
    'market.filter': 'סינון',
    'market.noResults': 'אין תוצאות',
    'market.showing': 'מציג',
    'market.of': 'מתוך',
    'market.noPlayersFound': 'לא נמצאו שחקנים לחיפוש הזה',
    'common.previous': 'הקודם',
    'common.next': 'הבא',
    'profile.title': 'פרופיל',
    'profile.changePhoto': 'החלפת תמונת פרופיל',
    'profile.demo': 'מצב הדגמה על המכשיר',
    'profile.connected': 'מחוברים לשרת',
    'profile.followers': 'עוקבים',
    'profile.following': 'עוקב',
    'profile.reputation': 'נקודות מוניטין. זה לא מטבע ולא פרס שאפשר למשוך.',
    'profile.approvedSubmissions': 'הגשות שאושרו:',
    'profile.editSquad': 'עריכת הקבוצה',
    'profile.buildSquad': 'בניית הקבוצה',
    'profile.squadHelp': 'בנו סגל משחקנים ומחליפים. מי שנכנס לפרופיל יראה את הקבוצה על המגרש.',
    'profile.badgesHelp': 'תגים מגיעים מאישורי קריירה וממודעות בגראונדס.',
    'profile.approvalQueue': 'תור אישור',
    'profile.resetDemo': 'איפוס נתוני הדגמה',
    'profile.signOut': 'יציאה',
    'common.loading': 'טוען…',
    'common.remaining': 'תווים שנותרו:',
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
    'auth.brand': 'EA FC 27 Community',
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
    'auth.consentAnd': 'and the ',
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
    'legal.cookieTitleWeb': 'Cookies and browser storage',
    'legal.cookieTitleNative': 'Device storage',
    'legal.cookieText': '1 CLUB stores only what is needed to keep you signed in and remember that you have seen this notice. We do not use advertising cookies or analytics tracking. You can continue browsing without accepting, and sign-in will keep working.',
    'legal.cookieAccept': 'Got it',
    'legal.cookieDetails': 'Cookie details',
    'legal.consentHeader': 'Consent required • LEGAL CONSENT',
    'legal.welcomeTitle': 'Welcome to FC27!',
    'legal.welcomePrefix': 'Hello ',
    'legal.welcomeBody': ', before using the app, please review and accept the updated Terms of Use and Privacy Policy.',
    'legal.independentHeading': 'Independent fan project: ',
    'legal.independentBody': 'This site is not affiliated with, endorsed by, or supported by Electronic Arts Inc. All brands, game names, and player images belong to their respective owners and are used under applicable fair-use principles.',
    'legal.noMoneyHeading': 'No real-money trading: ',
    'legal.noMoneyBody': 'Trading in game coins, accounts, or virtual assets for real money is strictly prohibited.',
    'legal.privacyHeading': 'Privacy and safety: ',
    'legal.privacyBody': 'Personal information is not sold. Users under 18 must have consent from a parent or legal guardian.',
    'legal.fullTerms': 'Full Terms of Use',
    'legal.fullPrivacy': 'Privacy Policy',
    'legal.consentCheckbox': 'I have read, understood and agree to the 1 CLUB Terms of Use and Privacy Policy.',
    'legal.consentError': 'Please check the box above to accept the terms and continue into the app.',
    'legal.accepting': 'Accepting…',
    'legal.accept': 'Accept and enter the app',
    'legal.decline': 'I do not agree (sign out and exit)',
    'career.scouting': '🌟 Talent scouting',
    'career.badge': '🏆 Career challenges',
    'career.title': 'Career challenges',
    'career.description': 'Complete a challenge, upload proof, and earn credit after approval. After five approvals, submissions are published immediately.',
    'career.newChallenge': 'New challenge',
    'ultimate.title': 'Ultimate Team',
    'ultimate.description': 'Rate squads across three dimensions, with no dislikes. Pack pulls are shared with the community.',
    'ultimate.postPublished': 'Post published',
    'ultimate.packShown': 'Your pack pull now appears in this list.',
    'ultimate.squadShown': 'Your squad now appears in this list.',
    'ultimate.uploadSquad': 'Share a squad',
    'ultimate.packOpened': 'Share a pack pull',
    'ultimate.squads': 'Squads',
    'ultimate.packs': 'Pack pulls',
    'ultimate.noPosts': 'There are no posts here yet.',
    'champions.status': 'Coming soon',
    'champions.description': 'The new FUT Champions hub is in development. It will open on the site when the final version is ready.',
    'games.eyebrow': 'Quick games',
    'games.title': 'Mini-games',
    'games.lead': 'Four games built around the player-card database.',
    'games.mark': 'Identify',
    'games.guessWho': 'Guess who',
    'games.guessWhoBody': 'Black-and-white tiles. Select only the players who match the question.',
    'games.networkKicker': 'Grid',
    'games.network': 'The Grid',
    'games.networkBody': 'One name per square. Match a player to each row and column.',
    'games.clubKicker': 'Club',
    'games.club': 'Which club?',
    'games.clubBody': 'Identify the player and choose where they play.',
    'games.fcKicker': 'Inspired by FC 27',
    'games.draft': 'Draft',
    'games.draftBody': 'Choose a formation, captain, and five cards for every position.',
    'games.play': 'Play',
    'market.title': 'Players',
    'market.cardsInDatabase': 'cards in the database',
    'market.perPage': 'per page',
    'market.cardHelp': 'Select a card to view full details.',
    'market.searchPlaceholder': 'Search by name, position, club or league...',
    'market.clearSearch': 'Clear search',
    'market.filter': 'Filter',
    'market.noResults': 'No results',
    'market.showing': 'Showing',
    'market.of': 'of',
    'market.noPlayersFound': 'No players match this search.',
    'common.previous': 'Previous',
    'common.next': 'Next',
    'profile.title': 'Profile',
    'profile.changePhoto': 'Change profile photo',
    'profile.demo': 'Device demo mode',
    'profile.connected': 'Connected to server',
    'profile.followers': 'Followers',
    'profile.following': 'Following',
    'profile.reputation': 'Reputation points. They are not currency and cannot be withdrawn.',
    'profile.approvedSubmissions': 'Approved submissions:',
    'profile.editSquad': 'Edit squad',
    'profile.buildSquad': 'Build your squad',
    'profile.squadHelp': 'Build a lineup with starters and substitutes. Visitors to your profile will see it on the pitch.',
    'profile.badgesHelp': 'Badges are earned through approved career submissions and Grounds listings.',
    'profile.approvalQueue': 'Approval queue',
    'profile.resetDemo': 'Reset demo data',
    'profile.signOut': 'Sign out',
    'common.loading': 'Loading…',
    'common.remaining': 'Characters remaining:',
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
    } catch {
      // Keep the in-memory choice for this session if persistence is unavailable.
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

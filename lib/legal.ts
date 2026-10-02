import AsyncStorage from '@react-native-async-storage/async-storage';

export const COOKIE_NOTICE_KEY = 'futz-cookie-notice';
export const COOKIE_NOTICE_VALUE = 'essential-2026-09-27';

export const TERMS_ACCEPTED_KEY = 'futz-terms-accepted';
export const TERMS_VERSION = '2026-09-28-v1';

export const LEGAL_LINKS = [
  { href: '/legal/terms' as const, label: 'תנאי שימוש' },
  { href: '/legal/privacy' as const, label: 'פרטיות' },
  { href: '/legal/cookies' as const, label: 'עוגיות' },
  { href: '/legal/accessibility' as const, label: 'נגישות' },
];

export async function hasCookieNotice(): Promise<boolean> {
  return (await AsyncStorage.getItem(COOKIE_NOTICE_KEY)) === COOKIE_NOTICE_VALUE;
}

export async function acceptCookieNotice(): Promise<void> {
  await AsyncStorage.setItem(COOKIE_NOTICE_KEY, COOKIE_NOTICE_VALUE);
}

export async function hasAcceptedTerms(userId?: string | null): Promise<boolean> {
  if (!userId) return false;
  try {
    const val = await AsyncStorage.getItem(`${TERMS_ACCEPTED_KEY}-${userId}`);
    return val === TERMS_VERSION;
  } catch {
    return false;
  }
}

export async function recordAcceptedTerms(userId?: string | null): Promise<void> {
  if (!userId) return;
  try {
    await AsyncStorage.setItem(`${TERMS_ACCEPTED_KEY}-${userId}`, TERMS_VERSION);
  } catch {}
}


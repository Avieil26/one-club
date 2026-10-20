import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

import { NATIVE_AUTH_CALLBACK, isNativeAuthReturn, authReturnParams } from '@/lib/nativeAuthReturn';
import { getSupabase } from '@/lib/supabase';

/** Native sign-in must return to the installed app, never to the website. */
function redirectUrl(): string {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}/`;
    }
    return 'https://fc27-israel.vercel.app/';
  }

  return NATIVE_AUTH_CALLBACK;
}

async function sessionFromUrl(url: string): Promise<void> {
  const params = authReturnParams(url);
  if (params.error || params.error_description) {
    throw new Error(params.error_description || params.error || 'ההתחברות עם גוגל נכשלה');
  }

  const supabase = getSupabase();
  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
    return;
  }

  if (params.access_token && params.refresh_token) {
    const { error } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (error) throw error;
    return;
  }

  throw new Error('לא התקבלה סשן מגוגל');
}

let completedReturn: string | null = null;
let pendingReturn: { url: string; promise: Promise<void> } | null = null;

/** Shared by the warm AuthSession result and the cold-launch callback route. */
export function completeNativeAuthReturn(url: string): Promise<void> {
  if (!isNativeAuthReturn(url)) return Promise.reject(new Error('Invalid app callback'));
  if (completedReturn === url) return Promise.resolve();
  if (pendingReturn?.url === url) return pendingReturn.promise;
  const promise = sessionFromUrl(url).then(() => { completedReturn = url; }).finally(() => {
    if (pendingReturn?.url === url) pendingReturn = null;
  });
  pendingReturn = { url, promise };
  return promise;
}

export async function signInWithGoogleOAuth(): Promise<void> {
  const supabase = getSupabase();
  const redirectTo = redirectUrl();

  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) throw error;
    return;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (!data.url) throw new Error('לא התקבלה כתובת התחברות מגוגל');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
    showInRecents: false,
  });

  if (result.type !== 'success' || !result.url) {
    throw new Error('התחברות עם גוגל בוטלה');
  }

  await completeNativeAuthReturn(result.url);
}

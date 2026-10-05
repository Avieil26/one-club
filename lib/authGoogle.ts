import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { getSupabase } from '@/lib/supabase';

/** Build an OAuth return URL that works in native builds and during Expo Go development. */
function redirectUrl(): string {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}/`;
    }
    return 'https://fc27-israel.vercel.app/';
  }

  return Linking.createURL('auth/callback');
}

function pickParams(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');
  const query = queryIndex >= 0 ? url.slice(queryIndex + 1, hashIndex >= 0 ? hashIndex : undefined) : '';
  const hash = hashIndex >= 0 ? url.slice(hashIndex + 1) : '';
  for (const chunk of [query, hash]) {
    if (!chunk) continue;
    for (const part of chunk.split('&')) {
      const [rawKey, rawValue = ''] = part.split('=');
      if (!rawKey) continue;
      params[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.replace(/\+/g, ' '));
    }
  }
  return params;
}

async function sessionFromUrl(url: string): Promise<void> {
  const params = pickParams(url);
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
    showInRecents: true,
  });

  if (result.type !== 'success' || !result.url) {
    throw new Error('התחברות עם גוגל בוטלה');
  }

  await sessionFromUrl(result.url);
}

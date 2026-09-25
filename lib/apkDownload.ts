import { Linking, Platform } from 'react-native';

/** Public APK path on the website (place file at public/futz-beta.apk after EAS build). */
export const FUTZ_APK_PATH = '/futz-beta.apk';

export function apkDownloadUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_APK_URL?.trim();
  if (fromEnv) return fromEnv;
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${FUTZ_APK_PATH}`;
  }
  return `https://fc27-israel.vercel.app${FUTZ_APK_PATH}`;
}

export async function isApkAvailable(): Promise<boolean> {
  const url = apkDownloadUrl();
  try {
    const head = await fetch(url, { method: 'HEAD' });
    if (head.ok) {
      const type = head.headers.get('content-type') ?? '';
      if (type.includes('text/html')) return false;
      return true;
    }
    if (head.status === 405 || head.status === 501) {
      const get = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' } });
      const type = get.headers.get('content-type') ?? '';
      return get.ok && !type.includes('text/html');
    }
    return false;
  } catch {
    return false;
  }
}

export async function openApkDownload(): Promise<void> {
  const url = apkDownloadUrl();
  const can = await Linking.canOpenURL(url);
  if (!can && Platform.OS !== 'web') {
    throw new Error('לא ניתן לפתוח את קישור ההורדה');
  }
  await Linking.openURL(url);
}

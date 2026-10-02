import { Linking, Platform } from 'react-native';

/** Direct APK from the finished EAS preview build (too large to host on Vercel). */
export const FUTZ_APK_ARTIFACT =
  'https://expo.dev/artifacts/eas/nrBebdSGZoHQXMXeteAc2GRlgIfYE24TMp-1Ofy7w0s.apk';

export function apkDownloadUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_APK_URL?.trim();
  if (fromEnv) return fromEnv;
  return FUTZ_APK_ARTIFACT;
}

export async function isApkAvailable(): Promise<boolean> {
  return Boolean(apkDownloadUrl());
}

export async function openApkDownload(): Promise<void> {
  const url = apkDownloadUrl();
  const can = await Linking.canOpenURL(url);
  if (!can && Platform.OS !== 'web') {
    throw new Error('לא ניתן לפתוח את קישור ההורדה');
  }
  await Linking.openURL(url);
}

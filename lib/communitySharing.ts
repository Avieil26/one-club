import { Platform } from 'react-native';

export function communityActivityUrl(kind: 'session' | 'journey', id: string): string {
 const origin = Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : 'https://fc27-israel.vercel.app';
 const route = kind === 'session' ? 'grounds/sessions' : 'career/journeys';
 return `${origin}/${route}/${encodeURIComponent(id)}`;
}

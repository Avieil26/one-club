import AsyncStorage from '@react-native-async-storage/async-storage';
import { validCommunityReturn } from '@/lib/communityActivityLogic';
const KEY = 'fc27-community-return-v1';
export async function rememberCommunityReturn(path: string) {
 if (!validCommunityReturn(path)) return;
 try { await AsyncStorage.setItem(KEY, JSON.stringify({ path, at: Date.now() })); } catch { /* A later link can still be opened manually. */ }
}
export async function readCommunityReturn(): Promise<string | null> {
 try {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  const record = JSON.parse(raw) as { path?: unknown; at?: unknown };
  return typeof record.path === 'string' && typeof record.at === 'number'
   && Date.now() - record.at >= 0 && Date.now() - record.at < 3600_000 && validCommunityReturn(record.path) ? record.path : null;
 } catch { return null; }
}

export async function clearCommunityReturn() {
 try { await AsyncStorage.removeItem(KEY); } catch { /* Expiry also clears stale intent. */ }
}

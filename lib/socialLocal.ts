import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DirectMessage, UserFollow } from '@/lib/types';

const KEY = 'fc27-social-v1';

export type SocialBundle = {
  follows: UserFollow[];
  messages: DirectMessage[];
};

const EMPTY: SocialBundle = { follows: [], messages: [] };

export async function loadSocial(): Promise<SocialBundle> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as SocialBundle;
    return {
      follows: Array.isArray(parsed.follows) ? parsed.follows : [],
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
    };
  } catch {
    return EMPTY;
  }
}

async function save(bundle: SocialBundle) {
  await AsyncStorage.setItem(KEY, JSON.stringify(bundle));
}

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function toggleFollowLocal(followerId: string, followingId: string): Promise<SocialBundle> {
  if (followerId === followingId) throw new Error('אי אפשר לעקוב אחרי עצמך');
  const bundle = await loadSocial();
  const index = bundle.follows.findIndex((f) => f.followerId === followerId && f.followingId === followingId);
  if (index >= 0) bundle.follows.splice(index, 1);
  else bundle.follows.push({ followerId, followingId, createdAt: new Date().toISOString() });
  await save(bundle);
  return bundle;
}

export async function sendMessageLocal(fromUserId: string, toUserId: string, body: string): Promise<SocialBundle> {
  if (fromUserId === toUserId) throw new Error('אי אפשר לשלוח הודעה לעצמך');
  const text = body.trim();
  if (!text) throw new Error('כתבו הודעה');
  if (text.length > 500) throw new Error('ההודעה ארוכה מדי');
  const bundle = await loadSocial();
  bundle.messages.push({
    id: uid('dm'),
    fromUserId,
    toUserId,
    body: text,
    createdAt: new Date().toISOString(),
  });
  await save(bundle);
  return bundle;
}

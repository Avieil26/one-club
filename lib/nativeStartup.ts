import { featuredCareerChallenges, mergeFeaturedCareer } from '@/lib/seed';
import { mergeOfficialSbcs } from '@/lib/sbcCatalog';
import type { Profile, Snapshot } from '@/lib/types';

export const NATIVE_SNAPSHOT_KEY = 'fc27-native-snapshot-v1';

/** Local display state only. Every server read/write still uses Supabase Auth/RLS. */
export function nativeStartupSnapshot(sessionRaw: string | null, cacheRaw: string | null): Snapshot {
  const empty: Snapshot = {
    mode: 'remote', user: null, profiles: [], challenges: featuredCareerChallenges,
    sbcChallenges: mergeOfficialSbcs([]), submissions: [], futPosts: [], ratings: [], likes: [],
    comments: [], commentLikes: [], grounds: [], solutions: [], follows: [], messages: [],
  };
  let stored: { user?: { id?: string; email?: string; created_at?: string; user_metadata?: Record<string, unknown> } };
  try { stored = JSON.parse(sessionRaw || 'null'); } catch { return empty; }
  const identity = stored?.user;
  if (!identity?.id || !/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(identity.id)) return empty;
  try {
    const cache = JSON.parse(cacheRaw || 'null');
    if (cache?.version === 1 && cache.userId === identity.id && cache.snapshot?.user?.id === identity.id && Date.now() - cache.savedAt < 86400000) {
      const snapshot = { ...empty, ...cache.snapshot } as Snapshot;
      snapshot.challenges = mergeFeaturedCareer(snapshot.challenges);
      snapshot.sbcChallenges = mergeOfficialSbcs(snapshot.sbcChallenges);
      return snapshot;
    }
  } catch { /* A corrupt cache must not prevent opening the installed app. */ }
  const meta = identity.user_metadata ?? {};
  const name = meta.full_name ?? meta.name ?? meta.display_name;
  const avatar = meta.avatar_url ?? meta.picture;
  const user: Profile = {
    id: identity.id, email: identity.email,
    displayName: typeof name === 'string' && name.trim() ? name.trim() : identity.email?.split('@')[0] || 'Player',
    avatarUrl: typeof avatar === 'string' && /^https?:\/\//.test(avatar) ? avatar : null,
    isAdmin: false, approvedCount: 0, reputation: 0,
    createdAt: identity.created_at || new Date().toISOString(),
  };
  return { ...empty, user, profiles: [user] };
}

export function serializeNativeSnapshot(snapshot: Snapshot): string | null {
  if (!snapshot.user) return null;
  // No auth tokens are copied into this display cache.
  return JSON.stringify({ version: 1, savedAt: Date.now(), userId: snapshot.user.id, snapshot });
}

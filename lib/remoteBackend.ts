import AsyncStorage from '@react-native-async-storage/async-storage';

import { signInWithGoogleOAuth } from '@/lib/authGoogle';
import type { Backend } from '@/lib/backend';
import { catalogChallenge, mergeOfficialSbcs, RETIRED_SBC_IDS } from '@/lib/sbcCatalog';
import { decodeSolution, encodeSolution, proofImages, readSquad } from '@/lib/sbcSolution';
import { mergeFeaturedCareer, seedDatabase } from '@/lib/seed';
import { normalizeSquad } from '@/lib/profileSquad';
import { loadSocial, saveSquadLocal, toggleFollowLocal } from '@/lib/socialLocal';
import { toSnapshot } from '@/lib/snapshot';
import { getSupabase, uploadAvatar, uploadProofs } from '@/lib/supabase';
import type {
  CareerChallenge,
  CareerMode,
  CareerSubmission,
  Comment,
  CommentPreset,
  CommentStatus,
  CommentTarget,
  ContactType,
  Database,
  DirectMessage,
  DivisionId,
  FutPost,
  FutRating,
  GroundsIntent,
  GroundsPost,
  ModerationStatus,
  NewCareerSubmission,
  NewChallenge,
  NewComment,
  NewFutPost,
  NewGrounds,
  NewSbc,
  NewSolution,
  PackRarity,
  PlatformId,
  Profile,
  SbcChallenge,
  SbcKind,
  SbcSolution,
  Snapshot,
} from '@/lib/types';

type ProfileRow = {
  id: string;
  display_name: string;
  is_admin: boolean;
  approved_count: number;
  reputation: number;
  created_at: string;
  avatar_url?: string | null;
  squad?: unknown;
};
type ChallengeRow = {
  id: string;
  title: string;
  mode: CareerMode;
  rules: string;
  proof_requirements: string;
  share_code: string | null;
  ends_at: string | null;
  created_by: string;
  created_at: string;
};
type SubmissionRow = {
  id: string;
  challenge_id: string;
  user_id: string;
  player_or_club_name: string;
  note: string;
  image_uris: string[];
  status: ModerationStatus;
  created_at: string;
};
type FutRow = {
  id: string;
  user_id: string;
  kind: FutPost['kind'];
  formation: string | null;
  platform: PlatformId;
  body: string;
  player_name: string | null;
  pack_rarity: PackRarity | null;
  image_uris: string[];
  status: ModerationStatus;
  created_at: string;
};
type RatingRow = {
  id: string;
  post_id: string;
  user_id: string;
  fit: number;
  fun: number;
  creativity: number;
  created_at: string;
};
type CommentRow = {
  id: string;
  target_type: CommentTarget;
  target_id: string;
  user_id: string;
  preset: CommentPreset | null;
  body: string;
  status: CommentStatus;
  created_at: string;
};
type GroundsRow = {
  id: string;
  user_id: string;
  intent: GroundsIntent;
  platform: PlatformId;
  position: string;
  division: DivisionId;
  skill_rating: number | null;
  player_level?: number | null;
  archetype: string;
  region: string;
  hours: string;
  contact_type: ContactType;
  contact_value: string;
  ea_id?: string | null;
  gamertag?: string | null;
  avatar_uri?: string | null;
  level_image_uri: string | null;
  level_verified: boolean;
  level_status: ModerationStatus;
  created_at: string;
};
type SbcRow = {
  id: string;
  catalog_key?: string | null;
  title: string;
  kind: SbcKind;
  requirements: string;
  ends_at: string | null;
  created_by: string;
  target_score: number | null;
  created_at: string;
};
type SolutionRow = {
  id: string;
  challenge_id: string;
  user_id: string;
  explanation: string;
  image_uris: string[];
  status: ModerationStatus;
  created_at: string;
};
type WorkedRow = { solution_id: string; user_id: string };

function fail(error: { message: string }): never {
  const hebrew = error.message.match(/[\u0590-\u05FF][^]*$/);
  throw new Error(hebrew ? hebrew[0].trim() : 'הפעולה נכשלה. נסו שוב.');
}

function authFail(error: { message: string }): never {
  const message = error.message.toLowerCase();
  if (message.includes('invalid login') || message.includes('invalid credentials')) {
    throw new Error('אימייל או סיסמה לא נכונים');
  }
  if (message.includes('already')) throw new Error('האימייל הזה כבר רשום');
  if (message.includes('not confirmed')) throw new Error('צריך לאשר את האימייל לפני הכניסה');
  if (message.includes('password')) throw new Error('הסיסמה צריכה להיות לפחות 6 תווים');
  if (message.includes('provider') || message.includes('not enabled')) throw new Error('גוגל עדיין לא הופעל בשרת');
  throw new Error('ההתחברות נכשלה. נסו שוב.');
}

async function messageRows(): Promise<DirectMessage[]> {
  const { data, error } = await getSupabase()
    .from('direct_messages')
    .select('id,from_user_id,to_user_id,body,created_at');
  if (error) {
    // Direct messages are optional for the initial app snapshot. Never block
    // the authenticated shell because this secondary table is unavailable.
    return [];
  }
  return (data ?? []).map((row) => ({
    id: row.id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    body: row.body,
    createdAt: row.created_at,
  }));
}

function pictureOf(meta: Record<string, unknown>): string | null {
  const raw = meta.avatar_url ?? meta.picture;
  return typeof raw === 'string' && /^https?:\/\//.test(raw) ? raw : null;
}

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url || null,
    isAdmin: row.is_admin,
    approvedCount: row.approved_count,
    reputation: row.reputation,
    createdAt: row.created_at,
    squad: normalizeSquad(row.squad),
  };
}

function mapChallenge(row: ChallengeRow): CareerChallenge {
  return {
    id: row.id,
    title: row.title,
    mode: row.mode,
    rules: row.rules,
    proofRequirements: row.proof_requirements,
    shareCode: row.share_code,
    endsAt: row.ends_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function mapSubmission(row: SubmissionRow): CareerSubmission {
  return {
    id: row.id,
    challengeId: row.challenge_id,
    userId: row.user_id,
    playerOrClubName: row.player_or_club_name,
    note: row.note,
    imageUris: row.image_uris ?? [],
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapFut(row: FutRow): FutPost {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind,
    formation: row.formation,
    platform: row.platform,
    body: row.body,
    playerName: row.player_name,
    packRarity: row.pack_rarity,
    imageUris: row.image_uris ?? [],
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapRating(row: RatingRow): FutRating {
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    fit: row.fit,
    fun: row.fun,
    creativity: row.creativity,
    createdAt: row.created_at,
  };
}

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    targetType: row.target_type,
    targetId: row.target_id,
    userId: row.user_id,
    preset: row.preset,
    body: row.body,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapGrounds(row: GroundsRow): GroundsPost {
  const encodedLevel =
    row.player_level ??
    (row.skill_rating != null && row.skill_rating >= 1 && row.skill_rating <= 50 ? row.skill_rating : null);
  return {
    id: row.id,
    userId: row.user_id,
    intent: row.intent,
    platform: row.platform,
    position: row.position,
    division: row.division,
    playerLevel: encodedLevel ?? 10,
    skillRating: row.skill_rating,
    archetype: row.archetype,
    region: row.region,
    hours: row.hours ?? '',
    contactType: row.contact_type,
    contactValue: row.contact_value,
    eaId: row.ea_id || row.contact_value || '',
    gamertag: row.gamertag || row.hours || '',
    avatarUri: row.avatar_uri || row.level_image_uri,
    levelImageUri: row.level_image_uri,
    levelVerified: row.level_verified,
    levelStatus: row.level_status,
    createdAt: row.created_at,
  };
}

function mapSbc(row: SbcRow): SbcChallenge {
  return {
    id: row.catalog_key || row.id,
    title: row.title,
    kind: row.kind,
    requirements: row.requirements,
    endsAt: row.ends_at,
    createdBy: row.created_by,
    targetScore: row.target_score,
    rules: null,
    createdAt: row.created_at,
  };
}

function mapSolution(
  row: SolutionRow,
  worked: WorkedRow[],
  failed: WorkedRow[],
  challengeKeyById: Map<string, string>,
): SbcSolution {
  const decoded = decodeSolution(row.explanation);
  return {
    id: row.id,
    challengeId: challengeKeyById.get(row.challenge_id) ?? row.challenge_id,
    userId: row.user_id,
    explanation: decoded.explanation,
    imageUris: (row.image_uris ?? []).filter((uri) => uri && uri !== 'squad'),
    squad: decoded.squad?.slots ?? null,
    formation: decoded.squad?.formation ?? null,
    workedUserIds: worked.filter((item) => item.solution_id === row.id).map((item) => item.user_id),
    failedUserIds: failed.filter((item) => item.solution_id === row.id).map((item) => item.user_id),
    status: row.status,
    createdAt: row.created_at,
  };
}

async function rowsOptional<T>(table: string): Promise<T[]> {
  const { data, error } = await getSupabase().from(table).select('*');
  if (error) return [];
  return (data ?? []) as T[];
}

const LIKE_PREFIX = 'futlike:';

async function latestAvatars(userIds: string[]): Promise<Map<string, string>> {
  const found = new Map<string, string>();
  const supabase = getSupabase();
  await Promise.all(
    userIds.map(async (id) => {
      const { data, error } = await supabase.storage.from('proofs').list(`${id}/avatar`, {
        limit: 10,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      if (error || !data?.length) return;
      const file = data.find((item) => /\.(jpe?g|png|webp)$/i.test(item.name));
      if (!file) return;
      found.set(id, supabase.storage.from('proofs').getPublicUrl(`${id}/avatar/${file.name}`).data.publicUrl);
    }),
  );
  return found;
}

async function squadLikes(): Promise<{ postId: string; userId: string }[]> {
  const supabase = getSupabase();
  const primary = await supabase.from('fut_likes').select('post_id, user_id');
  if (!primary.error) {
    return (primary.data ?? []).map((row) => ({ postId: row.post_id as string, userId: row.user_id as string }));
  }
  const fallback = await supabase.from('player_votes').select('player_id, user_id').like('player_id', `${LIKE_PREFIX}%`);
  if (fallback.error) return [];
  return (fallback.data ?? []).map((row) => ({
    postId: String(row.player_id).slice(LIKE_PREFIX.length),
    userId: row.user_id as string,
  }));
}

const DEMO_PROFILES: Record<string, Profile> = {
  admin: {
    id: 'admin',
    displayName: 'אביאל',
    isAdmin: true,
    approvedCount: 6,
    reputation: 48,
    createdAt: '2026-09-18T10:00:00.000Z',
  },
  maya: {
    id: 'maya',
    displayName: 'מאיה',
    isAdmin: false,
    approvedCount: 5,
    reputation: 62,
    createdAt: '2026-09-18T12:00:00.000Z',
  },
  noam: {
    id: 'noam',
    displayName: 'נועם',
    isAdmin: false,
    approvedCount: 1,
    reputation: 8,
    createdAt: '2026-09-19T12:00:00.000Z',
  },
};

async function readSnapshot(): Promise<Snapshot> {
  const supabase = getSupabase();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) authFail(sessionError);
  const session = sessionData.session;

  let demoId: string | null = null;
  try {
    demoId = await AsyncStorage.getItem('fc27_demo_user');
  } catch {}
  const demoProfile = demoId ? DEMO_PROFILES[demoId] : null;

  if (!session && !demoProfile) {
    return toSnapshot(
      {
        sessionUserId: null,
        profiles: [],
        careerChallenges: [],
        careerSubmissions: [],
        futPosts: [],
        futRatings: [],
        futLikes: [],
        comments: [],
        groundsPosts: [],
        sbcChallenges: mergeOfficialSbcs([]),
        sbcSolutions: [],
        reports: [],
        follows: [],
        messages: [],
      },
      'remote',
    );
  }

  let profiles = (await rowsOptional<ProfileRow>('profiles')).map(mapProfile);
  if (session) {
    if (!profiles.some((profile) => profile.id === session.user.id)) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      profiles = (await rowsOptional<ProfileRow>('profiles')).map(mapProfile);
    }
    const meta = (session.user.user_metadata ?? {}) as Record<string, unknown>;
    const googleName =
      typeof meta.full_name === 'string'
        ? meta.full_name
        : typeof meta.name === 'string'
          ? meta.name
          : typeof meta.display_name === 'string'
            ? meta.display_name
            : null;
    const googlePicture = pictureOf(meta);
    if (!profiles.some((profile) => profile.id === session.user.id)) {
      profiles = [
        ...profiles,
        {
          id: session.user.id,
          displayName: googleName?.trim() || session.user.email?.split('@')[0] || 'שחקן',
          email: session.user.email ?? undefined,
          avatarUrl: googlePicture,
          isAdmin: false,
          approvedCount: 0,
          reputation: 0,
          createdAt: new Date().toISOString(),
        },
      ];
    } else {
      profiles = profiles.map((profile) => {
        if (profile.id !== session.user.id) return profile;
        return {
          ...profile,
          email: session.user.email ?? undefined,
          displayName: googleName?.trim() || profile.displayName,
          avatarUrl: googlePicture || profile.avatarUrl || null,
        };
      });
    }
  } else if (demoProfile) {
    if (!profiles.some((profile) => profile.id === demoProfile.id)) {
      profiles = [...profiles, demoProfile];
    }
  }
  const [challenges, submissions, futPosts, ratings, comments, grounds, sbcChallenges, solutions, worked, failed, likes, uploaded, directMessages] =
    await Promise.all([
      rowsOptional<ChallengeRow>('career_challenges'),
      rowsOptional<SubmissionRow>('career_submissions'),
      rowsOptional<FutRow>('fut_posts'),
      rowsOptional<RatingRow>('fut_ratings'),
      rowsOptional<CommentRow>('comments'),
      rowsOptional<GroundsRow>('grounds_posts'),
      rowsOptional<SbcRow>('sbc_challenges'),
      rowsOptional<SolutionRow>('sbc_solutions'),
      rowsOptional<WorkedRow>('sbc_worked'),
      rowsOptional<WorkedRow>('sbc_failed'),
      squadLikes(),
      latestAvatars(profiles.map((profile) => profile.id)),
      messageRows(),
    ]);
  if (uploaded.size) {
    profiles = profiles.map((profile) => {
      const custom = uploaded.get(profile.id);
      return custom ? { ...profile, avatarUrl: custom } : profile;
    });
  }

  const challengeKeyById = new Map(
    sbcChallenges.map((row) => [row.id, row.catalog_key || row.id] as const),
  );

  const social = await loadSocial();
  const seed = seedDatabase();
  const db: Database = {
    sessionUserId: session ? session.user.id : (demoProfile?.id ?? null),
    profiles: profiles.length ? profiles : seed.profiles,
    careerChallenges: mergeFeaturedCareer(
      challenges.length ? challenges.map(mapChallenge) : seed.careerChallenges,
    ),
    careerSubmissions: submissions.map(mapSubmission),
    futPosts: futPosts.map(mapFut),
    futRatings: ratings.map(mapRating),
    futLikes: likes,
    comments: comments.map(mapComment),
    groundsPosts: grounds.map(mapGrounds),
    sbcChallenges: sbcChallenges.length ? mergeOfficialSbcs(sbcChallenges.map(mapSbc)) : seed.sbcChallenges,
    sbcSolutions: solutions
      .map((row) => mapSolution(row, worked, failed, challengeKeyById))
      .filter((solution) => !RETIRED_SBC_IDS.has(solution.challengeId)),
    reports: [],
    follows: social.follows,
    messages: directMessages,
  };
  const sessionId = db.sessionUserId;
  db.profiles = db.profiles.map((profile) => {
    const local = social.squads[profile.id];
    const mine = profile.id === sessionId;
    const squad = mine ? local ?? profile.squad ?? null : profile.squad ?? local ?? null;
    return squad ? { ...profile, squad } : profile;
  });
  return toSnapshot(db, 'remote');
}

async function call(fn: string, args: Record<string, unknown>) {
  const { error } = await getSupabase().rpc(fn, args);
  if (error) fail(error);
}

function cleanDate(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) throw new Error('תאריך הסיום צריך להיות בפורמט 2026-10-20');
  return new Date(`${trimmed}T21:00:00.000Z`).toISOString();
}

export function createRemoteBackend(): Backend {
  return {
    mode: 'remote',
    init: readSnapshot,
    reload: readSnapshot,
    subscribe(onChange) {
      const supabase = getSupabase();
      let queued = false;
      let timer: ReturnType<typeof setTimeout> | null = null;
      const queueReload = () => {
        if (queued) return;
        queued = true;
        timer = setTimeout(() => {
          queued = false;
          timer = null;
          onChange();
        }, 0);
      };

      const { data } = supabase.auth.onAuthStateChange((event) => {
        // The explicit OAuth callback and the public methods already refresh the
        // app snapshot after auth changes. Avoid a second backend reload on the
        // same event, and never call Supabase while the auth callback lock is held.
        if (event === 'SIGNED_IN') return;
        if (event !== 'SIGNED_OUT' && event !== 'USER_UPDATED') return;
        queueReload();
      });
      const channel = supabase
        .channel('direct-messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, queueReload)
        .subscribe();
      return () => {
        if (timer) clearTimeout(timer);
        data.subscription.unsubscribe();
        void supabase.removeChannel(channel);
      };
    },
    async signInDemo(profileId) {
      const profile = DEMO_PROFILES[profileId];
      if (!profile) throw new Error('הפרופיל לא נמצא');
      await AsyncStorage.setItem('fc27_demo_user', profileId);
      return readSnapshot();
    },
    signInNamed() {
      return Promise.reject(new Error('בשרת נכנסים עם אימייל וסיסמה'));
    },
    async signInEmail(email, password) {
      const { error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
      if (error) authFail(error);
      return readSnapshot();
    },
    async signUpEmail(email, password, name) {
      const displayName = name.trim();
      if (displayName.length < 2) throw new Error('חסר שם');
      if (password.length < 6) throw new Error('הסיסמה צריכה להיות לפחות 6 תווים');
      const { data, error } = await getSupabase().auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName,
            terms_accepted_at: new Date().toISOString(),
          },
        },
      });
      if (error) authFail(error);
      if (!data.session) throw new Error('נרשמת. אם צריך לאשר אימייל, אשרו אותו ואז התחברו.');
      return readSnapshot();
    },
    async signInGoogle() {
      try {
        await signInWithGoogleOAuth();
      } catch (error) {
        if (error && typeof error === 'object' && 'message' in error) {
          authFail(error as { message: string });
        }
        throw error;
      }
      return readSnapshot();
    },
    async signOut() {
      await AsyncStorage.removeItem('fc27_demo_user');
      const { error } = await getSupabase().auth.signOut();
      if (error) fail(error);
      return readSnapshot();
    },
    resetDemo() {
      return Promise.reject(new Error('איפוס הדגמה קיים רק במצב המקומי'));
    },
    async createChallenge(input: NewChallenge) {
      await call('create_career_challenge', {
        p_title: input.title,
        p_mode: input.mode,
        p_rules: input.rules,
        p_proof: input.proofRequirements,
        p_share: input.shareCode.trim() || null,
        p_ends: cleanDate(input.endsAt),
      });
      return readSnapshot();
    },
    async submitCareer(input: NewCareerSubmission) {
      const { data: userData, error: userError } = await getSupabase().auth.getUser();
      if (userError || !userData.user) throw new Error('צריך להתחבר');
      const imageUris = await uploadProofs(userData.user.id, input.imageUris, 'career');
      await call('submit_career', {
        p_challenge: input.challengeId,
        p_name: input.playerOrClubName,
        p_note: input.note,
        p_images: imageUris,
      });
      return readSnapshot();
    },
    async moderateCareer(id, status) {
      await call('moderate_career', { p_id: id, p_status: status });
      return readSnapshot();
    },
    async createFutPost(input: NewFutPost) {
      const { data: userData, error: userError } = await getSupabase().auth.getUser();
      if (userError || !userData.user) throw new Error('צריך להתחבר');
      const imageUris = await uploadProofs(userData.user.id, input.imageUris, 'fut');
      await call('create_fut_post', {
        p_kind: input.kind,
        p_formation: input.kind === 'squad' ? input.formation : null,
        p_platform: input.platform,
        p_body: input.body,
        p_player: input.kind === 'pack' ? input.playerName : null,
        p_rarity: input.packRarity,
        p_images: imageUris,
      });
      return readSnapshot();
    },
    async rateFut(postId, fit, fun, creativity) {
      await call('rate_fut', { p_post: postId, p_fit: fit, p_fun: fun, p_creativity: creativity });
      return readSnapshot();
    },
    async toggleFutLike(postId) {
      const { data: userData, error: userError } = await getSupabase().auth.getUser();
      if (userError || !userData.user) throw new Error('צריך להתחבר');
      const supabase = getSupabase();
      const rpc = await supabase.rpc('toggle_fut_like', { p_post: postId });
      if (!rpc.error) return readSnapshot();
      const missing = /function|schema cache|does not exist|PGRST202/i.test(rpc.error.message ?? '');
      if (!missing) fail(rpc.error);
      const key = `futlike:${postId}`;
      const existing = await supabase.from('player_votes').select('vote').eq('player_id', key).eq('user_id', userData.user.id).maybeSingle();
      if (existing.error) fail(existing.error);
      if (existing.data) {
        const removed = await supabase.from('player_votes').delete().eq('player_id', key).eq('user_id', userData.user.id);
        if (removed.error) fail(removed.error);
      } else {
        const added = await supabase.from('player_votes').upsert({ player_id: key, user_id: userData.user.id, vote: 1 });
        if (added.error) fail(added.error);
      }
      return readSnapshot();
    },
    async addComment(input: NewComment) {
      const { data, error } = await getSupabase().rpc('add_comment', {
        p_target_type: input.targetType,
        p_target: input.targetId,
        p_preset: input.preset,
        p_body: input.body,
      });
      if (error) fail(error);
      return { snap: await readSnapshot(), held: data === 'held' };
    },
    async reportComment(commentId) {
      await call('report_comment', { p_id: commentId });
      return readSnapshot();
    },
    async moderateComment(commentId, action) {
      await call('moderate_comment', { p_id: commentId, p_action: action });
      return readSnapshot();
    },
    async createGrounds(input: NewGrounds) {
      const { data: userData, error: userError } = await getSupabase().auth.getUser();
      if (userError || !userData.user) throw new Error('צריך להתחבר');
      const level = Math.round(Number(input.playerLevel));
      if (!Number.isInteger(level) || level < 1 || level > 50) {
        throw new Error('רמת השחקן צריכה להיות בין 1 ל-50');
      }
      const avatarSource = input.avatarUri || input.levelImageUri;
      if (!avatarSource) throw new Error('חייבים תמונת פרופיל חתוכה');
      const images = await uploadProofs(userData.user.id, [avatarSource], 'avatar');
      // Encode new fields into existing RPC columns until schema migration is applied:
      // skill = playerLevel, hours = gamertag, contact_value = eaId
      await call('create_grounds_post', {
        p_intent: input.intent,
        p_platform: input.platform,
        p_position: input.position,
        p_division: input.division,
        p_skill: level,
        p_archetype: input.archetype,
        p_region: input.region || 'אונליין בלבד',
        p_hours: input.gamertag.trim() || '—',
        p_contact_type: 'discord',
        p_contact_value: input.eaId.trim() || 'in-app',
        p_level_image: images[0] ?? null,
      });
      return readSnapshot();
    },
    async moderateGroundsLevel(id, verified) {
      await call('moderate_grounds_level', { p_id: id, p_verified: verified });
      return readSnapshot();
    },
    async toggleFollow(followingId) {
      const { data: userData, error: userError } = await getSupabase().auth.getUser();
      if (userError || !userData.user) throw new Error('צריך להתחבר');
      await toggleFollowLocal(userData.user.id, followingId);
      return readSnapshot();
    },
    async sendMessage(toUserId, body) {
      const { data: userData, error: userError } = await getSupabase().auth.getUser();
      if (userError || !userData.user) throw new Error('צריך להתחבר');
      const text = body.trim();
      if (!text) throw new Error('כתבו הודעה');
      if (text.length > 500) throw new Error('ההודעה ארוכה מדי');
      if (toUserId === userData.user.id) throw new Error('אי אפשר לשלוח הודעה לעצמך');
      const { error } = await getSupabase().from('direct_messages').insert({
        from_user_id: userData.user.id,
        to_user_id: toUserId,
        body: text,
      });
      if (error) {
        if (error.code === 'PGRST205' || error.code === '42P01') {
          throw new Error('הצ׳אט עדיין לא מחובר לשרת');
        }
        fail(error);
      }
      return readSnapshot();
    },
    async createSbc(input: NewSbc) {
      await call('create_sbc_challenge', {
        p_title: input.title,
        p_kind: input.kind,
        p_requirements: input.requirements,
        p_ends: cleanDate(input.endsAt),
        p_target: input.kind === 'streamlined' ? Number(input.targetScore) : null,
      });
      return readSnapshot();
    },
    async addSolution(input: NewSolution) {
      const { data: userData, error: userError } = await getSupabase().auth.getUser();
      if (userError || !userData.user) throw new Error('צריך להתחבר');
      if (!input.explanation.trim()) throw new Error('חסר הסבר');
      const squad = readSquad(input.squad, input.formation);
      const proofs = proofImages(input.imageUris, squad);
      if (!proofs.length) throw new Error('אפשר לבנות סגל של 11 שחקנים, או להעלות צילום מסך');
      const imageUris = proofs[0] === 'squad' ? proofs : await uploadProofs(userData.user.id, proofs, 'sbc');
      const catalog = catalogChallenge(input.challengeId);
      await call('add_sbc_solution', {
        p_challenge: input.challengeId,
        p_explanation: encodeSolution(input.explanation, squad),
        p_images: imageUris,
        p_title: catalog?.title ?? null,
        p_requirements: catalog?.requirements ?? null,
        p_kind: catalog?.kind ?? 'classic',
        p_ends: catalog?.endsAt ?? null,
        p_target: catalog?.targetScore ?? null,
      });
      return readSnapshot();
    },
    async markWorked(solutionId) {
      return this.voteSolution(solutionId, 'up');
    },
    async voteSolution(solutionId, vote) {
      const { error } = await getSupabase().rpc('vote_sbc_solution', { p_id: solutionId, p_vote: vote });
      const missing = error && /does not exist|schema cache|PGRST202|Could not find the function/i.test(error.message ?? '');
      if (missing) {
        if (vote === 'up') {
          await call('mark_sbc_worked', { p_id: solutionId });
          return readSnapshot();
        }
        if (vote === 'clear') return readSnapshot();
        throw new Error('סימון "לא עבד" יתעדכן אחרי עדכון השרת. בינתיים אפשר לסמן שעבד לי.');
      }
      if (error) fail(error);
      return readSnapshot();
    },
    async setAvatar(uri) {
      const { data: userData, error: userError } = await getSupabase().auth.getUser();
      if (userError || !userData.user) throw new Error('צריך להתחבר');
      const url = await uploadAvatar(userData.user.id, uri);
      const updated = await getSupabase().auth.updateUser({ data: { avatar_url: url } });
      if (updated.error) fail(updated.error);
      const rpc = await getSupabase().rpc('save_profile_avatar', { p_url: url });
      if (rpc.error && !/function|schema cache|does not exist|PGRST202|avatar_url|column/i.test(rpc.error.message ?? '')) {
        fail(rpc.error);
      }
      return readSnapshot();
    },
    async saveSquad(squad) {
      const { data: userData, error: userError } = await getSupabase().auth.getUser();
      if (userError || !userData.user) throw new Error('צריך להתחבר');
      await saveSquadLocal(userData.user.id, squad);
      const rpc = await getSupabase().rpc('save_profile_squad', { p_squad: squad });
      if (rpc.error && !/function|schema cache|does not exist|PGRST202|Could not find the function/i.test(rpc.error.message ?? '')) {
        fail(rpc.error);
      }
      return readSnapshot();
    },
  };
}

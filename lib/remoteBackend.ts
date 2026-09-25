import { signInWithGoogleOAuth } from '@/lib/authGoogle';
import type { Backend } from '@/lib/backend';
import { catalogChallenge, mergeOfficialSbcs, RETIRED_SBC_IDS } from '@/lib/sbcCatalog';
import { loadSocial, sendMessageLocal, toggleFollowLocal } from '@/lib/socialLocal';
import { toSnapshot } from '@/lib/snapshot';
import { getSupabase, uploadProofs } from '@/lib/supabase';
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

async function rows<T>(table: string): Promise<T[]> {
  const { data, error } = await getSupabase().from(table).select('*');
  if (error) fail(error);
  return (data ?? []) as T[];
}

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    isAdmin: row.is_admin,
    approvedCount: row.approved_count,
    reputation: row.reputation,
    createdAt: row.created_at,
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

function mapSolution(row: SolutionRow, worked: WorkedRow[], challengeKeyById: Map<string, string>): SbcSolution {
  return {
    id: row.id,
    challengeId: challengeKeyById.get(row.challenge_id) ?? row.challenge_id,
    userId: row.user_id,
    explanation: row.explanation,
    imageUris: row.image_uris ?? [],
    workedUserIds: worked.filter((item) => item.solution_id === row.id).map((item) => item.user_id),
    status: row.status,
    createdAt: row.created_at,
  };
}

async function readSnapshot(): Promise<Snapshot> {
  const supabase = getSupabase();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) authFail(sessionError);
  const session = sessionData.session;
  if (!session) {
    return toSnapshot(
      {
        sessionUserId: null,
        profiles: [],
        careerChallenges: [],
        careerSubmissions: [],
        futPosts: [],
        futRatings: [],
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

  let profiles = (await rows<ProfileRow>('profiles')).map(mapProfile);
  if (!profiles.some((profile) => profile.id === session.user.id)) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    profiles = (await rows<ProfileRow>('profiles')).map(mapProfile);
  }
  const meta = session.user.user_metadata ?? {};
  const googleName =
    typeof meta.full_name === 'string'
      ? meta.full_name
      : typeof meta.name === 'string'
        ? meta.name
        : typeof meta.display_name === 'string'
          ? meta.display_name
          : null;
  if (!profiles.some((profile) => profile.id === session.user.id)) {
    profiles = [
      ...profiles,
      {
        id: session.user.id,
        displayName: googleName?.trim() || session.user.email?.split('@')[0] || 'שחקן',
        email: session.user.email ?? undefined,
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
      };
    });
  }

  const [challenges, submissions, futPosts, ratings, comments, grounds, sbcChallenges, solutions, worked] =
    await Promise.all([
      rows<ChallengeRow>('career_challenges'),
      rows<SubmissionRow>('career_submissions'),
      rows<FutRow>('fut_posts'),
      rows<RatingRow>('fut_ratings'),
      rows<CommentRow>('comments'),
      rows<GroundsRow>('grounds_posts'),
      rows<SbcRow>('sbc_challenges'),
      rows<SolutionRow>('sbc_solutions'),
      rows<WorkedRow>('sbc_worked'),
    ]);

  const challengeKeyById = new Map(
    sbcChallenges.map((row) => [row.id, row.catalog_key || row.id] as const),
  );

  const social = await loadSocial();
  const db: Database = {
    sessionUserId: session.user.id,
    profiles,
    careerChallenges: challenges.map(mapChallenge),
    careerSubmissions: submissions.map(mapSubmission),
    futPosts: futPosts.map(mapFut),
    futRatings: ratings.map(mapRating),
    comments: comments.map(mapComment),
    groundsPosts: grounds.map(mapGrounds),
    sbcChallenges: mergeOfficialSbcs(sbcChallenges.map(mapSbc)),
    sbcSolutions: solutions
      .map((row) => mapSolution(row, worked, challengeKeyById))
      .filter((solution) => !RETIRED_SBC_IDS.has(solution.challengeId)),
    reports: [],
    follows: social.follows,
    messages: social.messages,
  };
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
      const { data } = getSupabase().auth.onAuthStateChange(() => onChange());
      return () => data.subscription.unsubscribe();
    },
    signInDemo() {
      return Promise.reject(new Error('בשרת נכנסים עם אימייל וסיסמה'));
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
        options: { data: { display_name: displayName } },
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
      await sendMessageLocal(userData.user.id, toUserId, body);
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
      if (!input.imageUris.filter(Boolean).length) {
        throw new Error('צריך לפחות צילום מסך אחד של הסגל שהשלמתם');
      }
      const imageUris = await uploadProofs(userData.user.id, input.imageUris, 'sbc');
      const catalog = catalogChallenge(input.challengeId);
      await call('add_sbc_solution', {
        p_challenge: input.challengeId,
        p_explanation: input.explanation,
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
      await call('mark_sbc_worked', { p_id: solutionId });
      return readSnapshot();
    },
  };
}

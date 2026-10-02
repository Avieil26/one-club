export type ModerationStatus = 'pending' | 'approved' | 'rejected';

/** A squad the player built on their profile. Player ids, not a screenshot. */
export type ProfileSquad = {
  formation: string;
  slots: Record<string, string>;
  bench: string[];
};

export type Profile = {
  id: string;
  displayName: string;
  email?: string;
  passwordHash?: string;
  avatarUrl?: string | null;
  isAdmin: boolean;
  approvedCount: number;
  reputation: number;
  createdAt: string;
  squad?: ProfileSquad | null;
};

export type CareerMode = 'manager' | 'player';

export type CareerChallenge = {
  id: string;
  title: string;
  mode: CareerMode;
  rules: string;
  proofRequirements: string;
  shareCode: string | null;
  endsAt: string | null;
  createdBy: string;
  createdAt: string;
};

export type CareerSubmission = {
  id: string;
  challengeId: string;
  userId: string;
  playerOrClubName: string;
  note: string;
  imageUris: string[];
  status: ModerationStatus;
  createdAt: string;
};

export type PlatformId = 'ps5' | 'xbox' | 'pc' | 'switch2';
export type FutKind = 'squad' | 'pack';
export type PackRarity = 'regular' | 'special' | 'holographic';

export type FutPost = {
  id: string;
  userId: string;
  kind: FutKind;
  formation: string | null;
  platform: PlatformId;
  body: string;
  playerName: string | null;
  packRarity: PackRarity | null;
  imageUris: string[];
  status: ModerationStatus;
  createdAt: string;
};

export type FutRating = {
  id: string;
  postId: string;
  userId: string;
  fit: number;
  fun: number;
  creativity: number;
  createdAt: string;
};

export type FutLike = {
  postId: string;
  userId: string;
};

export type CommentTarget = 'fut_post' | 'career_submission' | 'sbc_solution';
export type CommentPreset = 'respect' | 'nice' | 'smart' | 'funny';
export type CommentStatus = 'visible' | 'hidden_pending';

export type Comment = {
  id: string;
  targetType: CommentTarget;
  targetId: string;
  userId: string;
  preset: CommentPreset | null;
  body: string;
  status: CommentStatus;
  createdAt: string;
};

export type GroundsIntent = 'need_player' | 'looking_for_club';
export type ContactType = 'whatsapp' | 'discord';
export type DivisionId = '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2' | '1' | 'elite';

export type GroundsPost = {
  id: string;
  userId: string;
  intent: GroundsIntent;
  platform: PlatformId;
  position: string;
  division: DivisionId;
  /** Clubs archetype level 1–50 (color-coded in UI) */
  playerLevel: number;
  skillRating: number | null;
  archetype: string;
  region: string;
  /** @deprecated kept for older rows — not shown in UI */
  hours: string;
  /** @deprecated external contact — in-app messages instead */
  contactType: ContactType;
  contactValue: string;
  eaId: string;
  gamertag: string;
  avatarUri: string | null;
  levelImageUri: string | null;
  levelVerified: boolean;
  levelStatus: ModerationStatus;
  createdAt: string;
};

export type UserFollow = {
  followerId: string;
  followingId: string;
  createdAt: string;
};

export type DirectMessage = {
  id: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  createdAt: string;
};

export type SbcKind = 'streamlined' | 'classic';

export type CardQuality = 'bronze' | 'silver' | 'gold';

export type SquadRules = {
  chemistry: number;
  minRating?: number;
  minNations?: number;
  maxSameLeague?: number;
  maxLeagues?: number;
  minClubs?: number;
  maxClubs?: number;
  minSameClub?: number;
  maxSameClub?: number;
  minSameLeague?: number;
  sameNationAtLeast?: number;
  /** At least `count` players whose nation is any of `nations`. */
  nationsAtLeast?: { nations: string[]; count: number };
  nationAtLeast?: { nation: string; count: number }[];
  leagueAtLeast?: { league: string; count: number }[];
  clubsAtLeast?: { clubs: string[]; count: number };
  minGold?: number;
  minSilver?: number;
  minBronze?: number;
  minQuality?: CardQuality;
  /** Every card must be this quality. Silver means silver only, not gold. */
  exactQuality?: CardQuality;
};

export type SbcChallenge = {
  id: string;
  title: string;
  kind: SbcKind;
  requirements: string;
  endsAt: string | null;
  createdBy: string;
  targetScore: number | null;
  rules: SquadRules | null;
  createdAt: string;
  reward?: string | null;
  clubs?: string[];
  /** Nation pair for an international SBC, shown as flags on the card. */
  nations?: string[];
  previewFormation?: string | null;
  previewSquad?: Record<string, string> | null;
};

export type SbcSolution = {
  id: string;
  challengeId: string;
  userId: string;
  explanation: string;
  imageUris: string[];
  /** Eleven roster ids keyed by pitch slot, when the solution was built in the app. */
  squad?: Record<string, string> | null;
  formation?: string | null;
  workedUserIds: string[];
  /** Users who marked this solution as not working. */
  failedUserIds: string[];
  status: ModerationStatus;
  createdAt: string;
};

export type Report = {
  id: string;
  commentId: string;
  reporterId: string;
  createdAt: string;
};

export type Database = {
  sessionUserId: string | null;
  profiles: Profile[];
  careerChallenges: CareerChallenge[];
  careerSubmissions: CareerSubmission[];
  futPosts: FutPost[];
  futRatings: FutRating[];
  futLikes: FutLike[];
  comments: Comment[];
  groundsPosts: GroundsPost[];
  sbcChallenges: SbcChallenge[];
  sbcSolutions: SbcSolution[];
  reports: Report[];
  follows: UserFollow[];
  messages: DirectMessage[];
};

export type Snapshot = {
  mode: 'local' | 'remote';
  user: Profile | null;
  profiles: Profile[];
  challenges: CareerChallenge[];
  submissions: CareerSubmission[];
  futPosts: FutPost[];
  ratings: FutRating[];
  likes: FutLike[];
  comments: Comment[];
  grounds: GroundsPost[];
  sbcChallenges: SbcChallenge[];
  solutions: SbcSolution[];
  follows: UserFollow[];
  messages: DirectMessage[];
};

export type NewChallenge = {
  title: string;
  mode: CareerMode;
  rules: string;
  proofRequirements: string;
  shareCode: string;
  endsAt: string;
};

export type NewCareerSubmission = {
  challengeId: string;
  playerOrClubName: string;
  note: string;
  imageUris: string[];
};

export type NewFutPost = {
  kind: FutKind;
  formation: string;
  platform: PlatformId;
  body: string;
  playerName: string;
  packRarity: PackRarity | null;
  imageUris: string[];
};

export type NewComment = {
  targetType: CommentTarget;
  targetId: string;
  preset: CommentPreset | null;
  body: string;
};

export type NewGrounds = {
  intent: GroundsIntent;
  platform: PlatformId;
  position: string;
  division: DivisionId;
  playerLevel: number;
  skillRating: string;
  archetype: string;
  region: string;
  eaId: string;
  gamertag: string;
  avatarUri: string | null;
  levelImageUri: string | null;
};

export type NewSbc = {
  title: string;
  kind: SbcKind;
  requirements: string;
  endsAt: string;
  targetScore: string;
};

export type NewSolution = {
  challengeId: string;
  explanation: string;
  imageUris: string[];
  squad?: Record<string, string> | null;
  formation?: string | null;
};

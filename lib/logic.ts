import { TRUSTED_APPROVALS } from '@/lib/labels';
import { commentVisibility } from '@/lib/moderation';
import type {
  Database,
  NewCareerSubmission,
  NewChallenge,
  NewComment,
  NewFutPost,
  NewGrounds,
  NewSbc,
  NewSolution,
  Profile,
  ProfileSquad,
} from '@/lib/types';
import { nowIso, parseEndDate, uid } from '@/lib/format';
import { hashPassword } from '@/lib/password';
import { normalizeSquad } from '@/lib/profileSquad';
import { readSquad, solutionImages } from '@/lib/sbcSolution';

function mustUser(db: Database): Profile {
  const user = db.profiles.find((profile) => profile.id === db.sessionUserId);
  if (!user) throw new Error('צריך להתחבר');
  return user;
}

export function setAvatar(db: Database, uri: string) {
  const user = mustUser(db);
  const picture = uri.trim();
  if (!picture) throw new Error('חסרה תמונה');
  user.avatarUrl = picture;
}

export function saveSquad(db: Database, squad: ProfileSquad) {
  const user = mustUser(db);
  const clean = normalizeSquad(squad);
  if (!clean) throw new Error('שימו לפחות שחקן אחד בסגל');
  user.squad = clean;
}

function mustAdmin(db: Database): Profile {
  const user = mustUser(db);
  if (!user.isAdmin) throw new Error('רק מנהל יכול לבצע את הפעולה הזו');
  return user;
}

function text(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`חסר ${label}`);
  if (trimmed.length > max) throw new Error(`${label} ארוך מדי`);
  return trimmed;
}

function images(uris: string[], min: number, max: number): string[] {
  const clean = uris.filter(Boolean).slice(0, max);
  if (clean.length < min) throw new Error(min === 1 ? 'צריך לפחות צילום מסך אחד' : `צריך ${min} צילומים`);
  return clean;
}

function bump(profile: Profile, approvals: number, reputation: number) {
  profile.approvedCount = Math.max(0, profile.approvedCount + approvals);
  profile.reputation = Math.max(0, profile.reputation + reputation);
}

export function createChallenge(db: Database, input: NewChallenge) {
  const admin = mustAdmin(db);
  const challenge = {
    id: uid('ch'),
    title: text(input.title, 'שם לאתגר', 80),
    mode: input.mode,
    rules: text(input.rules, 'חוקים', 2000),
    proofRequirements: text(input.proofRequirements, 'מה חייב להופיע בצילום', 500),
    shareCode: input.shareCode.trim() ? text(input.shareCode, 'קוד שיתוף', 32) : null,
    endsAt: parseEndDate(input.endsAt),
    createdBy: admin.id,
    createdAt: nowIso(),
  };
  db.careerChallenges.unshift(challenge);
}

export function submitCareer(db: Database, input: NewCareerSubmission) {
  const user = mustUser(db);
  const challenge = db.careerChallenges.find((item) => item.id === input.challengeId);
  if (!challenge) throw new Error('האתגר לא נמצא');
  if (challenge.endsAt && new Date(challenge.endsAt).getTime() < Date.now()) {
    throw new Error('האתגר הזה כבר נסגר');
  }
  const trusted = user.approvedCount >= TRUSTED_APPROVALS;
  db.careerSubmissions.unshift({
    id: uid('sub'),
    challengeId: challenge.id,
    userId: user.id,
    playerOrClubName: text(input.playerOrClubName, 'שם השחקן או המועדון', 60),
    note: text(input.note, 'תיאור קצר', 500),
    imageUris: images(input.imageUris, 1, 3),
    status: trusted ? 'approved' : 'pending',
    createdAt: nowIso(),
  });
  if (trusted) bump(user, 1, 10);
}

export function moderateCareer(db: Database, id: string, status: 'approved' | 'rejected') {
  mustAdmin(db);
  const submission = db.careerSubmissions.find((item) => item.id === id);
  if (!submission) throw new Error('ההגשה לא נמצאה');
  if (submission.status === status) return;
  const author = db.profiles.find((profile) => profile.id === submission.userId);
  if (submission.status === 'approved' && author) bump(author, -1, -10);
  if (status === 'approved' && author) bump(author, 1, 10);
  submission.status = status;
}

export function createFutPost(db: Database, input: NewFutPost) {
  const user = mustUser(db);
  const body = text(input.body, 'טקסט', 280);
  const shots = images(input.imageUris, 1, 3);
  if (input.kind === 'squad') {
    db.futPosts.unshift({
      id: uid('fut'),
      userId: user.id,
      kind: 'squad',
      formation: text(input.formation, 'מערך', 20),
      platform: input.platform,
      body,
      playerName: null,
      packRarity: null,
      imageUris: shots,
      status: 'approved',
      createdAt: nowIso(),
    });
    return;
  }
  if (!input.packRarity) throw new Error('בחרו סוג פריט');
  db.futPosts.unshift({
    id: uid('fut'),
    userId: user.id,
    kind: 'pack',
    formation: null,
    platform: input.platform,
    body,
    playerName: text(input.playerName, 'שם השחקן', 60),
    packRarity: input.packRarity,
    imageUris: shots,
    status: 'approved',
    createdAt: nowIso(),
  });
}

export function rateFut(db: Database, postId: string, fit: number, fun: number, creativity: number) {
  const user = mustUser(db);
  const post = db.futPosts.find((item) => item.id === postId && item.kind === 'squad');
  if (!post) throw new Error('הקבוצה לא נמצאה');
  if (post.userId === user.id) throw new Error('אפשר לדרג קבוצות של אחרים');
  for (const value of [fit, fun, creativity]) {
    if (!Number.isInteger(value) || value < 1 || value > 5) throw new Error('הדירוג הוא בין 1 ל-5');
  }
  const existing = db.futRatings.find((rating) => rating.postId === postId && rating.userId === user.id);
  if (existing) {
    existing.fit = fit;
    existing.fun = fun;
    existing.creativity = creativity;
    return;
  }
  db.futRatings.unshift({
    id: uid('rate'),
    postId,
    userId: user.id,
    fit,
    fun,
    creativity,
    createdAt: nowIso(),
  });
  const author = db.profiles.find((profile) => profile.id === post.userId);
  if (author) bump(author, 0, 1);
}

export function toggleFutLike(db: Database, postId: string) {
  const user = mustUser(db);
  const post = db.futPosts.find((item) => item.id === postId && item.kind === 'squad');
  if (!post) throw new Error('הקבוצה לא נמצאה');
  if (!db.futLikes) db.futLikes = [];
  const index = db.futLikes.findIndex((like) => like.postId === postId && like.userId === user.id);
  if (index >= 0) db.futLikes.splice(index, 1);
  else db.futLikes.push({ postId, userId: user.id });
}

export function addComment(db: Database, input: NewComment): boolean {
  const user = mustUser(db);
  const body = input.body.trim();
  if (body.length > 120) throw new Error('תגובה יכולה להכיל עד 120 תווים');
  if (!body) throw new Error('כתבו משפט קצר');
  const exists = targetExists(db, input.targetType, input.targetId);
  if (!exists) throw new Error('הפוסט לא נמצא');
  const status = commentVisibility(body);
  db.comments.unshift({
    id: uid('cmt'),
    targetType: input.targetType,
    targetId: input.targetId,
    userId: user.id,
    preset: input.preset,
    body,
    status,
    createdAt: nowIso(),
  });
  return status === 'hidden_pending';
}

function targetExists(db: Database, type: NewComment['targetType'], id: string): boolean {
  if (type === 'fut_post') return db.futPosts.some((item) => item.id === id);
  if (type === 'career_submission') return db.careerSubmissions.some((item) => item.id === id && item.status === 'approved');
  return db.sbcSolutions.some((item) => item.id === id && item.status === 'approved');
}

export function reportComment(db: Database, commentId: string) {
  const user = mustUser(db);
  const comment = db.comments.find((item) => item.id === commentId);
  if (!comment) throw new Error('התגובה לא נמצאה');
  if (comment.userId === user.id) throw new Error('אי אפשר לדווח על תגובה של עצמך');
  if (db.reports.some((report) => report.commentId === commentId && report.reporterId === user.id)) return;
  comment.status = 'hidden_pending';
  db.reports.unshift({ id: uid('rep'), commentId, reporterId: user.id, createdAt: nowIso() });
}

export function moderateComment(db: Database, commentId: string, action: 'visible' | 'remove') {
  mustAdmin(db);
  const index = db.comments.findIndex((item) => item.id === commentId);
  if (index < 0) throw new Error('התגובה לא נמצאה');
  if (action === 'remove') {
    db.comments.splice(index, 1);
    db.reports = db.reports.filter((report) => report.commentId !== commentId);
    return;
  }
  db.comments[index].status = 'visible';
}

export function createGrounds(db: Database, input: NewGrounds) {
  const user = mustUser(db);
  const skill = input.skillRating.trim();
  let skillRating: number | null = null;
  if (skill) {
    skillRating = Number(skill);
    if (!Number.isInteger(skillRating) || skillRating < 1 || skillRating > 5000) {
      throw new Error('Skill Rating צריך להיות מספר בין 1 ל-5000');
    }
  }
  const playerLevel = Math.round(Number(input.playerLevel));
  if (!Number.isInteger(playerLevel) || playerLevel < 1 || playerLevel > 50) {
    throw new Error('רמת השחקן צריכה להיות בין 1 ל-50');
  }
  const avatarUri = input.avatarUri || null;
  const levelImageUri = input.levelImageUri || avatarUri || null;
  db.groundsPosts.unshift({
    id: uid('lfg'),
    userId: user.id,
    intent: input.intent,
    platform: input.platform,
    position: text(input.position, 'עמדה', 40),
    division: input.division,
    playerLevel,
    skillRating,
    archetype: text(input.archetype, 'ארכיטייפ', 40),
    region: text(input.region, 'אזור', 40),
    hours: '',
    contactType: 'discord',
    contactValue: '',
    eaId: text(input.eaId, 'EA ID', 40),
    gamertag: text(input.gamertag, 'שם משתמש', 40),
    avatarUri,
    levelImageUri,
    levelVerified: false,
    levelStatus: levelImageUri ? 'pending' : 'rejected',
    createdAt: nowIso(),
  });
}

export function toggleFollow(db: Database, followingId: string) {
  const user = mustUser(db);
  if (user.id === followingId) throw new Error('אי אפשר לעקוב אחרי עצמך');
  if (!db.profiles.some((p) => p.id === followingId)) throw new Error('השחקן לא נמצא');
  if (!db.follows) db.follows = [];
  const index = db.follows.findIndex((f) => f.followerId === user.id && f.followingId === followingId);
  if (index >= 0) {
    db.follows.splice(index, 1);
    return;
  }
  db.follows.push({ followerId: user.id, followingId, createdAt: nowIso() });
}

export function sendDirectMessage(db: Database, toUserId: string, body: string) {
  const user = mustUser(db);
  if (user.id === toUserId) throw new Error('אי אפשר לשלוח הודעה לעצמך');
  if (!db.profiles.some((p) => p.id === toUserId)) throw new Error('השחקן לא נמצא');
  if (!db.messages) db.messages = [];
  db.messages.push({
    id: uid('dm'),
    fromUserId: user.id,
    toUserId,
    body: text(body, 'הודעה', 500),
    createdAt: nowIso(),
  });
}

export function moderateGroundsLevel(db: Database, id: string, verified: boolean) {
  mustAdmin(db);
  const post = db.groundsPosts.find((item) => item.id === id);
  if (!post) throw new Error('המודעה לא נמצאה');
  if (!post.levelImageUri) throw new Error('אין צילום רמה לאישור');
  post.levelVerified = verified;
  post.levelStatus = verified ? 'approved' : 'rejected';
}

export function createSbc(db: Database, input: NewSbc) {
  const admin = mustAdmin(db);
  let targetScore: number | null = null;
  if (input.kind === 'streamlined') {
    targetScore = Number(input.targetScore);
    if (!Number.isInteger(targetScore) || targetScore < 1 || targetScore > 20000) {
      throw new Error('יעד הניקוד צריך להיות מספר בין 1 ל-20000');
    }
  }
  db.sbcChallenges.unshift({
    id: uid('sbc'),
    title: text(input.title, 'שם לאתגר', 80),
    kind: input.kind,
    requirements: text(input.requirements, 'דרישות', 2000),
    endsAt: parseEndDate(input.endsAt),
    createdBy: admin.id,
    targetScore,
    rules: null,
    createdAt: nowIso(),
  });
}

export function addSolution(db: Database, input: NewSolution) {
  const user = mustUser(db);
  const challenge = db.sbcChallenges.find((item) => item.id === input.challengeId);
  if (!challenge) throw new Error('האתגר לא נמצא');
  if (challenge.kind !== 'classic') throw new Error('פתרון קהילה מיועד ל-SBC קלאסי. ל-Streamlined יש מחשבון.');
  const squad = readSquad(input.squad, input.formation);
  const shots = solutionImages(input.imageUris);
  if (!squad && !shots.length) throw new Error('אפשר לבנות סגל של 11 שחקנים, או להעלות צילום מסך');
  db.sbcSolutions.unshift({
    id: uid('sol'),
    challengeId: challenge.id,
    userId: user.id,
    explanation: text(input.explanation, 'הסבר', 800),
    imageUris: shots,
    squad: squad?.slots ?? null,
    formation: squad?.formation ?? null,
    workedUserIds: [],
    failedUserIds: [],
    status: 'approved',
    createdAt: nowIso(),
  });
}

export function voteSolution(db: Database, solutionId: string, vote: 'up' | 'down' | 'clear') {
  const user = mustUser(db);
  const solution = db.sbcSolutions.find((item) => item.id === solutionId);
  if (!solution) throw new Error('הפתרון לא נמצא');
  if (solution.userId === user.id) throw new Error('אי אפשר לדרג פתרון של עצמך');
  if (!solution.failedUserIds) solution.failedUserIds = [];
  const wasUp = solution.workedUserIds.includes(user.id);
  solution.workedUserIds = solution.workedUserIds.filter((id) => id !== user.id);
  solution.failedUserIds = solution.failedUserIds.filter((id) => id !== user.id);
  if (vote === 'clear') return;
  if (vote === 'up') {
    solution.workedUserIds.push(user.id);
    if (!wasUp) {
      const author = db.profiles.find((profile) => profile.id === solution.userId);
      if (author) bump(author, 0, 2);
    }
    return;
  }
  solution.failedUserIds.push(user.id);
}

export function markWorked(db: Database, solutionId: string) {
  voteSolution(db, solutionId, 'up');
}

function accountEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error('אימייל לא תקין');
  return normalized;
}

export async function signUpAccount(db: Database, email: string, password: string, name: string) {
  const displayName = text(name, 'שם', 24);
  const normalized = accountEmail(email);
  if (password.trim().length < 6) throw new Error('סיסמה של לפחות 6 תווים');
  if (db.profiles.some((profile) => profile.email === normalized)) throw new Error('כבר יש חשבון עם האימייל הזה');
  const profile: Profile = {
    id: uid('user'),
    displayName,
    email: normalized,
    passwordHash: await hashPassword(password),
    isAdmin: false,
    approvedCount: 0,
    reputation: 0,
    createdAt: nowIso(),
  };
  db.profiles.push(profile);
  db.sessionUserId = profile.id;
}

export async function signInAccount(db: Database, email: string, password: string) {
  const normalized = accountEmail(email);
  const profile = db.profiles.find((item) => item.email === normalized);
  if (!profile?.passwordHash) throw new Error('אין חשבון עם האימייל הזה');
  if ((await hashPassword(password)) !== profile.passwordHash) throw new Error('הסיסמה לא נכונה');
  db.sessionUserId = profile.id;
}

export function signInNamed(db: Database, name: string) {
  const displayName = text(name, 'שם', 24);
  const profile: Profile = {
    id: uid('user'),
    displayName,
    isAdmin: false,
    approvedCount: 0,
    reputation: 0,
    createdAt: nowIso(),
  };
  db.profiles.push(profile);
  db.sessionUserId = profile.id;
}

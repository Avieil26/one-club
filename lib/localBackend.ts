import AsyncStorage from '@react-native-async-storage/async-storage';

import * as logic from '@/lib/logic';
import { mergeOfficialSbcs, RETIRED_SBC_IDS } from '@/lib/sbcCatalog';
import { STORAGE_KEY, seedDatabase } from '@/lib/seed';
import { toSnapshot } from '@/lib/snapshot';
import type {
  Database,
  NewCareerSubmission,
  NewChallenge,
  NewComment,
  NewFutPost,
  NewGrounds,
  NewSbc,
  NewSolution,
  Snapshot,
} from '@/lib/types';

export type Backend = {
  mode: Snapshot['mode'];
  init(): Promise<Snapshot>;
  reload(): Promise<Snapshot>;
  subscribe(onChange: () => void): () => void;
  signInDemo(profileId: string): Promise<Snapshot>;
  signInNamed(name: string): Promise<Snapshot>;
  signInEmail(email: string, password: string): Promise<Snapshot>;
  signUpEmail(email: string, password: string, name: string): Promise<Snapshot>;
  signInGoogle(): Promise<Snapshot>;
  signOut(): Promise<Snapshot>;
  resetDemo(): Promise<Snapshot>;
  createChallenge(input: NewChallenge): Promise<Snapshot>;
  submitCareer(input: NewCareerSubmission): Promise<Snapshot>;
  moderateCareer(id: string, status: 'approved' | 'rejected'): Promise<Snapshot>;
  createFutPost(input: NewFutPost): Promise<Snapshot>;
  rateFut(postId: string, fit: number, fun: number, creativity: number): Promise<Snapshot>;
  addComment(input: NewComment): Promise<{ snap: Snapshot; held: boolean }>;
  reportComment(commentId: string): Promise<Snapshot>;
  moderateComment(commentId: string, action: 'visible' | 'remove'): Promise<Snapshot>;
  createGrounds(input: NewGrounds): Promise<Snapshot>;
  moderateGroundsLevel(id: string, verified: boolean): Promise<Snapshot>;
  toggleFollow(followingId: string): Promise<Snapshot>;
  sendMessage(toUserId: string, body: string): Promise<Snapshot>;
  createSbc(input: NewSbc): Promise<Snapshot>;
  addSolution(input: NewSolution): Promise<Snapshot>;
  markWorked(solutionId: string): Promise<Snapshot>;
};

function syncOfficialSbcs(current: Database): Database {
  return {
    ...current,
    sbcChallenges: mergeOfficialSbcs(current.sbcChallenges),
    sbcSolutions: current.sbcSolutions.filter((solution) => !RETIRED_SBC_IDS.has(solution.challengeId)),
  };
}

export function createLocalBackend(): Backend {
  let db: Database = seedDatabase();

  async function commit(): Promise<Snapshot> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return toSnapshot(db, 'local');
  }

  return {
    mode: 'local',
    async init() {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          db = JSON.parse(raw) as Database;
        } catch {
          db = seedDatabase();
        }
      } else {
        db = seedDatabase();
      }
      db = syncOfficialSbcs(db);
      if (!db.follows) db.follows = [];
      if (!db.messages) db.messages = [];
      db.groundsPosts = (db.groundsPosts ?? []).map((post) => ({
        ...post,
        playerLevel: post.playerLevel ?? (post.skillRating && post.skillRating <= 50 ? post.skillRating : 10),
        eaId: post.eaId || post.contactValue || '',
        gamertag: post.gamertag || post.hours || '',
        avatarUri: post.avatarUri ?? null,
        hours: post.hours ?? '',
      }));
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      return toSnapshot(db, 'local');
    },
    reload() {
      return Promise.resolve(toSnapshot(db, 'local'));
    },
    subscribe() {
      return () => undefined;
    },
    async signInDemo(profileId) {
      if (!db.profiles.some((profile) => profile.id === profileId)) throw new Error('הפרופיל לא נמצא');
      db.sessionUserId = profileId;
      return commit();
    },
    async signInNamed(name) {
      logic.signInNamed(db, name);
      return commit();
    },
    async signInEmail(email, password) {
      await logic.signInAccount(db, email, password);
      return commit();
    },
    async signUpEmail(email, password, name) {
      await logic.signUpAccount(db, email, password, name);
      return commit();
    },
    signInGoogle() {
      return Promise.reject(new Error('כניסה עם גוגל זמינה רק דרך השרת'));
    },
    async signOut() {
      db.sessionUserId = null;
      return commit();
    },
    async resetDemo() {
      db = seedDatabase();
      await AsyncStorage.removeItem(STORAGE_KEY);
      return commit();
    },
    async createChallenge(input) {
      logic.createChallenge(db, input);
      return commit();
    },
    async submitCareer(input) {
      logic.submitCareer(db, input);
      return commit();
    },
    async moderateCareer(id, status) {
      logic.moderateCareer(db, id, status);
      return commit();
    },
    async createFutPost(input) {
      logic.createFutPost(db, input);
      return commit();
    },
    async rateFut(postId, fit, fun, creativity) {
      logic.rateFut(db, postId, fit, fun, creativity);
      return commit();
    },
    async addComment(input) {
      const held = logic.addComment(db, input);
      return { snap: await commit(), held };
    },
    async reportComment(commentId) {
      logic.reportComment(db, commentId);
      return commit();
    },
    async moderateComment(commentId, action) {
      logic.moderateComment(db, commentId, action);
      return commit();
    },
    async createGrounds(input) {
      logic.createGrounds(db, input);
      return commit();
    },
    async moderateGroundsLevel(id, verified) {
      logic.moderateGroundsLevel(db, id, verified);
      return commit();
    },
    async toggleFollow(followingId) {
      if (!db.follows) db.follows = [];
      if (!db.messages) db.messages = [];
      logic.toggleFollow(db, followingId);
      return commit();
    },
    async sendMessage(toUserId, body) {
      if (!db.follows) db.follows = [];
      if (!db.messages) db.messages = [];
      logic.sendDirectMessage(db, toUserId, body);
      return commit();
    },
    async createSbc(input) {
      logic.createSbc(db, input);
      return commit();
    },
    async addSolution(input) {
      logic.addSolution(db, input);
      return commit();
    },
    async markWorked(solutionId) {
      logic.markWorked(db, solutionId);
      return commit();
    },
  };
}

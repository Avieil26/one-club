import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Backend } from '@/lib/localBackend';
import { createLocalBackend } from '@/lib/localBackend';
import { createRemoteBackend } from '@/lib/remoteBackend';
import { isSupabaseConfigured } from '@/lib/supabase';
import type {
  NewCareerSubmission,
  NewChallenge,
  NewComment,
  NewFutPost,
  NewGrounds,
  NewSbc,
  NewSolution,
  ProfileSquad,
  Snapshot,
} from '@/lib/types';

type AppValue = Snapshot & {
  ready: boolean;
  busy: boolean;
  signInDemo: (profileId: string) => Promise<void>;
  signInNamed: (name: string) => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, name: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetDemo: () => Promise<void>;
  createChallenge: (input: NewChallenge) => Promise<void>;
  submitCareer: (input: NewCareerSubmission) => Promise<void>;
  moderateCareer: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  createFutPost: (input: NewFutPost) => Promise<void>;
  rateFut: (postId: string, fit: number, fun: number, creativity: number) => Promise<void>;
  toggleFutLike: (postId: string) => Promise<void>;
  addComment: (input: NewComment) => Promise<boolean>;
  reportComment: (commentId: string) => Promise<void>;
  moderateComment: (commentId: string, action: 'visible' | 'remove') => Promise<void>;
  createGrounds: (input: NewGrounds) => Promise<void>;
  moderateGroundsLevel: (id: string, verified: boolean) => Promise<void>;
  toggleFollow: (followingId: string) => Promise<void>;
  sendMessage: (toUserId: string, body: string) => Promise<void>;
  createSbc: (input: NewSbc) => Promise<void>;
  addSolution: (input: NewSolution) => Promise<void>;
  markWorked: (solutionId: string) => Promise<void>;
  voteSolution: (solutionId: string, vote: 'up' | 'down' | 'clear') => Promise<void>;
  setAvatar: (uri: string) => Promise<void>;
  saveSquad: (squad: ProfileSquad) => Promise<void>;
  refresh: () => Promise<void>;
};

const EMPTY: Snapshot = {
  mode: 'local',
  user: null,
  profiles: [],
  challenges: [],
  submissions: [],
  futPosts: [],
  ratings: [],
  likes: [],
  comments: [],
  grounds: [],
  sbcChallenges: [],
  solutions: [],
  follows: [],
  messages: [],
};

const AppContext = createContext<AppValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const backend = useMemo<Backend>(() => (isSupabaseConfigured() ? createRemoteBackend() : createLocalBackend()), []);
  const [snap, setSnap] = useState<Snapshot>(EMPTY);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    backend.init().then((next) => {
      if (!alive) return;
      setSnap(next);
      setReady(true);
    });
    const unsubscribe = backend.subscribe(() => {
      backend.reload().then((next) => {
        if (alive) setSnap(next);
      });
    });
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [backend]);

  async function run<T>(work: () => Promise<T>, apply: (result: T) => void): Promise<T> {
    setBusy(true);
    try {
      const result = await work();
      apply(result);
      return result;
    } finally {
      setBusy(false);
    }
  }

  const value: AppValue = {
    ...snap,
    ready,
    busy,
    signInDemo: (profileId) => run(() => backend.signInDemo(profileId), setSnap).then(() => undefined),
    signInNamed: (name) => run(() => backend.signInNamed(name), setSnap).then(() => undefined),
    signInEmail: (email, password) => run(() => backend.signInEmail(email, password), setSnap).then(() => undefined),
    signUpEmail: (email, password, name) =>
      run(() => backend.signUpEmail(email, password, name), setSnap).then(() => undefined),
    signInGoogle: () => run(() => backend.signInGoogle(), setSnap).then(() => undefined),
    signOut: () => run(() => backend.signOut(), setSnap).then(() => undefined),
    resetDemo: () => run(() => backend.resetDemo(), setSnap).then(() => undefined),
    createChallenge: (input) => run(() => backend.createChallenge(input), setSnap).then(() => undefined),
    submitCareer: (input) => run(() => backend.submitCareer(input), setSnap).then(() => undefined),
    moderateCareer: (id, status) => run(() => backend.moderateCareer(id, status), setSnap).then(() => undefined),
    createFutPost: (input) => run(() => backend.createFutPost(input), setSnap).then(() => undefined),
    rateFut: (postId, fit, fun, creativity) =>
      run(() => backend.rateFut(postId, fit, fun, creativity), setSnap).then(() => undefined),
    toggleFutLike: (postId) => run(() => backend.toggleFutLike(postId), setSnap).then(() => undefined),
    addComment: (input) => run(() => backend.addComment(input), (result) => setSnap(result.snap)).then((result) => result.held),
    reportComment: (commentId) => run(() => backend.reportComment(commentId), setSnap).then(() => undefined),
    moderateComment: (commentId, action) =>
      run(() => backend.moderateComment(commentId, action), setSnap).then(() => undefined),
    createGrounds: (input) => run(() => backend.createGrounds(input), setSnap).then(() => undefined),
    moderateGroundsLevel: (id, verified) =>
      run(() => backend.moderateGroundsLevel(id, verified), setSnap).then(() => undefined),
    toggleFollow: (followingId) => run(() => backend.toggleFollow(followingId), setSnap).then(() => undefined),
    sendMessage: (toUserId, body) => run(() => backend.sendMessage(toUserId, body), setSnap).then(() => undefined),
    createSbc: (input) => run(() => backend.createSbc(input), setSnap).then(() => undefined),
    addSolution: (input) => run(() => backend.addSolution(input), setSnap).then(() => undefined),
    markWorked: (solutionId) => run(() => backend.markWorked(solutionId), setSnap).then(() => undefined),
    voteSolution: (solutionId, vote) => run(() => backend.voteSolution(solutionId, vote), setSnap).then(() => undefined),
    setAvatar: (uri) => run(() => backend.setAvatar(uri), setSnap).then(() => undefined),
    saveSquad: (squad) => run(() => backend.saveSquad(squad), setSnap).then(() => undefined),
    refresh: () => run(() => backend.reload(), setSnap).then(() => undefined),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp מחוץ לספק');
  return value;
}

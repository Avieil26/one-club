import AsyncStorage from '@react-native-async-storage/async-storage';

import { uid } from '@/lib/format';
import { commentVisibility } from '@/lib/moderation';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

const LOCAL_KEY = 'fc27-player-talk-v1';

export type TalkComment = {
  id: string;
  name: string;
  body: string;
  createdAt: string;
  up: number;
  down: number;
  mine: 1 | -1 | 0;
};

export type PlayerTalk = {
  up: number;
  down: number;
  mine: 1 | -1 | 0;
  comments: TalkComment[];
};

type LocalVote = 1 | -1;
type LocalFile = {
  cards: Record<string, Record<string, LocalVote>>;
  comments: {
    id: string;
    playerId: string;
    userId: string;
    name: string;
    body: string;
    createdAt: string;
    votes: Record<string, LocalVote>;
  }[];
};

const empty: PlayerTalk = { up: 0, down: 0, mine: 0, comments: [] };
let remoteOk: boolean | null = null;

async function readLocal(): Promise<LocalFile> {
  const raw = await AsyncStorage.getItem(LOCAL_KEY);
  if (!raw) return { cards: {}, comments: [] };
  try {
    const parsed = JSON.parse(raw) as LocalFile;
    return { cards: parsed.cards ?? {}, comments: parsed.comments ?? [] };
  } catch {
    return { cards: {}, comments: [] };
  }
}

async function writeLocal(file: LocalFile) {
  await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(file));
}

function fromLocal(file: LocalFile, playerId: string, userId: string | null): PlayerTalk {
  const votes = file.cards[playerId] ?? {};
  let up = 0;
  let down = 0;
  for (const vote of Object.values(votes)) {
    if (vote === 1) up += 1;
    else down += 1;
  }
  const comments = file.comments
    .filter((comment) => comment.playerId === playerId)
    .map((comment) => {
      let commentUp = 0;
      let commentDown = 0;
      for (const vote of Object.values(comment.votes)) {
        if (vote === 1) commentUp += 1;
        else commentDown += 1;
      }
      const raw = userId ? comment.votes[userId] : undefined;
      const mine: 1 | -1 | 0 = raw === 1 || raw === -1 ? raw : 0;
      return {
        id: comment.id,
        name: comment.name,
        body: comment.body,
        createdAt: comment.createdAt,
        up: commentUp,
        down: commentDown,
        mine,
      };
    });
  const cardVote = userId ? votes[userId] : undefined;
  const mine: 1 | -1 | 0 = cardVote === 1 || cardVote === -1 ? cardVote : 0;
  return { up, down, mine, comments };
}

async function loadRemote(playerId: string, userId: string | null): Promise<PlayerTalk> {
  const supabase = getSupabase();
  const [votes, comments] = await Promise.all([
    supabase.from('player_votes').select('user_id, vote').eq('player_id', playerId),
    supabase.from('player_comments').select('id, body, created_at, user_id, profiles(display_name)').eq('player_id', playerId).eq('status', 'visible').order('created_at', { ascending: false }),
  ]);
  if (votes.error || comments.error) throw votes.error || comments.error;
  const commentIds = (comments.data ?? []).map((row) => row.id as string);
  const commentVotes = commentIds.length
    ? await supabase.from('player_comment_votes').select('comment_id, user_id, vote').in('comment_id', commentIds)
    : { data: [], error: null };
  if (commentVotes.error) throw commentVotes.error;

  let up = 0;
  let down = 0;
  let mine: 1 | -1 | 0 = 0;
  for (const row of votes.data ?? []) {
    if (row.vote === 1) up += 1;
    else down += 1;
    if (userId && row.user_id === userId) mine = row.vote === 1 ? 1 : -1;
  }
  const byComment = new Map<string, { up: number; down: number; mine: 1 | -1 | 0 }>();
  for (const row of commentVotes.data ?? []) {
    const bucket = byComment.get(row.comment_id) ?? { up: 0, down: 0, mine: 0 };
    if (row.vote === 1) bucket.up += 1;
    else bucket.down += 1;
    if (userId && row.user_id === userId) bucket.mine = row.vote === 1 ? 1 : -1;
    byComment.set(row.comment_id, bucket);
  }
  return {
    up,
    down,
    mine,
    comments: (comments.data ?? []).map((row) => {
      const bucket = byComment.get(row.id) ?? { up: 0, down: 0, mine: 0 as const };
      const profile = row.profiles as { display_name?: string } | { display_name?: string }[] | null;
      const name = Array.isArray(profile) ? profile[0]?.display_name : profile?.display_name;
      return {
        id: row.id,
        name: name || 'שחקן',
        body: row.body,
        createdAt: row.created_at,
        up: bucket.up,
        down: bucket.down,
        mine: bucket.mine as 1 | -1 | 0,
      };
    }),
  };
}

export async function loadPlayerTalk(playerId: string, userId: string | null): Promise<PlayerTalk> {
  if (isSupabaseConfigured() && remoteOk !== false) {
    try {
      const talk = await loadRemote(playerId, userId);
      remoteOk = true;
      return talk;
    } catch {
      remoteOk = false;
    }
  }
  return fromLocal(await readLocal(), playerId, userId);
}

function toggle(current: LocalVote | undefined, next: LocalVote): LocalVote | undefined {
  return current === next ? undefined : next;
}

export async function voteOnPlayer(playerId: string, userId: string, vote: 1 | -1): Promise<void> {
  if (remoteOk) {
    const supabase = getSupabase();
    const { data } = await supabase.from('player_votes').select('vote').eq('player_id', playerId).eq('user_id', userId).maybeSingle();
    if (data?.vote === vote) {
      const { error } = await supabase.from('player_votes').delete().eq('player_id', playerId).eq('user_id', userId);
      if (error) throw error;
      return;
    }
    const { error } = await supabase.from('player_votes').upsert({ player_id: playerId, user_id: userId, vote });
    if (error) throw error;
    return;
  }
  const file = await readLocal();
  const votes = { ...(file.cards[playerId] ?? {}) };
  const next = toggle(votes[userId], vote);
  if (next) votes[userId] = next;
  else delete votes[userId];
  file.cards[playerId] = votes;
  await writeLocal(file);
}

export async function addPlayerComment(playerId: string, userId: string, name: string, body: string): Promise<'held' | 'ok'> {
  const text = body.trim();
  if (!text) throw new Error('כתבו תגובה קצרה');
  if (text.length > 120) throw new Error('תגובה יכולה להכיל עד 120 תווים');
  const status = commentVisibility(text);
  if (remoteOk) {
    const { error } = await getSupabase().from('player_comments').insert({
      player_id: playerId,
      user_id: userId,
      body: text,
      status,
    });
    if (error) throw error;
    return status === 'hidden_pending' ? 'held' : 'ok';
  }
  const file = await readLocal();
  if (status === 'visible') {
    file.comments.unshift({
      id: uid('pc'),
      playerId,
      userId,
      name,
      body: text,
      createdAt: new Date().toISOString(),
      votes: {},
    });
    await writeLocal(file);
  }
  return status === 'hidden_pending' ? 'held' : 'ok';
}

export async function voteOnComment(commentId: string, userId: string, vote: 1 | -1): Promise<void> {
  if (remoteOk) {
    const supabase = getSupabase();
    const { data } = await supabase.from('player_comment_votes').select('vote').eq('comment_id', commentId).eq('user_id', userId).maybeSingle();
    if (data?.vote === vote) {
      const { error } = await supabase.from('player_comment_votes').delete().eq('comment_id', commentId).eq('user_id', userId);
      if (error) throw error;
      return;
    }
    const { error } = await supabase.from('player_comment_votes').upsert({ comment_id: commentId, user_id: userId, vote });
    if (error) throw error;
    return;
  }
  const file = await readLocal();
  const comment = file.comments.find((item) => item.id === commentId);
  if (!comment) return;
  const next = toggle(comment.votes[userId], vote);
  if (next) comment.votes[userId] = next;
  else delete comment.votes[userId];
  await writeLocal(file);
}

export { empty as emptyTalk };

import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export type GameId = 'who' | 'grid' | 'club' | 'draft';

export type GameLeaderboardRow = {
  userId: string;
  score: number;
};

export function currentGamePeriod(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return year + '-' + month;
}

export async function submitGameScore(gameId: GameId, score: number): Promise<void> {
  if (!isSupabaseConfigured() || !Number.isFinite(score) || score < 0) return;
  const supabase = getSupabase();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id;
  if (!userId) return;

  const period = currentGamePeriod();
  const { data: current } = await supabase
    .from('game_scores')
    .select('score')
    .eq('game_id', gameId)
    .eq('period', period)
    .eq('user_id', userId)
    .maybeSingle();

  if (current && Number(current.score) >= score) return;

  const { error } = await supabase
    .from('game_scores')
    .upsert(
      {
        game_id: gameId,
        period,
        user_id: userId,
        score: Math.floor(score),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'game_id,period,user_id' },
    );

  if (error) throw error;
}

export async function loadGameLeaderboard(gameId: GameId, period = currentGamePeriod()): Promise<GameLeaderboardRow[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await getSupabase()
    .from('game_scores')
    .select('user_id,score')
    .eq('game_id', gameId)
    .eq('period', period)
    .order('score', { ascending: false })
    .order('updated_at', { ascending: true })
    .limit(10);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    userId: row.user_id,
    score: Number(row.score) || 0,
  }));
}

export const GAME_LABELS: Record<GameId, string> = {
  who: 'נחש מי',
  grid: 'הרשת',
  club: 'איזה מועדון',
  draft: 'דראפט',
};
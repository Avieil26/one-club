import { getSupabase } from '@/lib/supabase';

export const PLATFORMS = ['PS5', 'Xbox Series', 'PC', 'PS4', 'Xbox One', 'Switch 2'] as const;
export type SessionMember = { user_id: string; platform: string; status: 'joined' | 'invited' | 'left' };
export type PartnerSession = {
  id: string; host_user_id: string; title: string; mode: string; platforms: string[];
  region: string; language: string; play_style: string; notes: string;
  starts_at: string; timezone: string; capacity: number; weekly: boolean;
  status: 'open' | 'completed' | 'cancelled'; parent_id: string | null;
  partner_session_members: SessionMember[];
};
export type JourneyMember = { user_id: string; club: string; difficulty: string; season: string; active: boolean };
export type CareerJourney = {
  id: string; owner_user_id: string; title: string; club: string; rules: string;
  milestones: string[]; language: string; status: 'active' | 'archived'; created_at: string;
  career_journey_members: JourneyMember[];
};
export type JourneyUpdate = { id: string; journey_id: string; user_id: string; milestone: number; note: string; created_at: string };
export type CommunityProfile = { id: string; display_name: string };

// Keep these requests off the startup snapshot: only the relevant page loads them.
export async function loadSessions(scope: 'upcoming' | 'mine', userId: string, filters?: { platform: string; mode: string; language: string; region: string }): Promise<PartnerSession[]> {
  const db = getSupabase();
  let ids: string[] | null = null;
  if (scope === 'mine') {
    const membership = await db.from('partner_session_members').select('session_id').eq('user_id', userId).neq('status', 'left');
    if (membership.error) throw membership.error;
    ids = (membership.data ?? []).map((m) => m.session_id as string);
    if (!ids.length) return [];
  }
  let query = db.from('partner_sessions').select('*,partner_session_members(*)');
  if (ids) query = query.in('id', ids);
  else {
    query = query.eq('status', 'open').gt('starts_at', new Date().toISOString());
    if (filters?.platform) query = query.contains('platforms', [filters.platform]);
    if (filters?.mode) query = query.eq('mode', filters.mode);
    if (filters?.language) query = query.eq('language', filters.language);
    if (filters?.region) query = query.eq('region', filters.region);
  }
  const { data, error } = await query.order('starts_at', { ascending: scope === 'upcoming' }).limit(40);
  if (error) throw error;
  return (data ?? []) as PartnerSession[];
}
export async function loadJourneys(scope: 'active' | 'mine', userId: string, language: string): Promise<CareerJourney[]> {
  const db = getSupabase();
  let query = db.from('career_journeys').select('*,career_journey_members(*)');
  if (scope === 'mine') {
    const members = await db.from('career_journey_members').select('journey_id').eq('user_id', userId);
    if (members.error) throw members.error;
    const ids = (members.data ?? []).map((m) => m.journey_id as string);
    if (!ids.length) return [];
    query = query.in('id', ids);
  } else {
    query = query.eq('status', 'active');
    if (language) query = query.eq('language', language);
  }
  const { data, error } = await query.order('created_at', { ascending: false }).limit(40);
  if (error) throw error;
  return (data ?? []) as CareerJourney[];
}
export async function loadActivity(kind: 'session' | 'journey', id: string) {
  const table = kind === 'session' ? 'partner_sessions' : 'career_journeys';
  const relation = kind === 'session' ? 'partner_session_members' : 'career_journey_members';
  const { data, error } = await getSupabase().from(table).select(`*,${relation}(*)`).eq('id', id).maybeSingle();
  if (error) throw error;
  return data as PartnerSession | CareerJourney | null;
}
export async function loadJourneyUpdates(id: string): Promise<JourneyUpdate[]> {
  const db = getSupabase();
  // Bound the journal separately; completed milestones must not disappear when
  // a busy journey has more than 200 general notes (100 members × 6 milestones).
  const [feed, progress] = await Promise.all([
    db.from('career_journey_updates').select('*').eq('journey_id', id).order('created_at', { ascending: false }).limit(200),
    db.from('career_journey_updates').select('*').eq('journey_id', id).gte('milestone', 0).limit(1000),
  ]);
  if (feed.error) throw feed.error;
  if (progress.error) throw progress.error;
  return [...new Map([...(feed.data ?? []), ...(progress.data ?? [])].map((u) => [u.id, u])).values()]
    .sort((a, b) => b.created_at.localeCompare(a.created_at)) as JourneyUpdate[];
}
export async function loadCommunityNames(ids: string[]): Promise<CommunityProfile[]> {
  if (!ids.length) return [];
  const { data, error } = await getSupabase().from('profiles').select('id,display_name').in('id', [...new Set(ids)]);
  if (error) throw error;
  return (data ?? []) as CommunityProfile[];
}
export async function communityAction(action: string, payload: Record<string, unknown>): Promise<string> {
  const { data, error } = await getSupabase().rpc('community_activity', { action, payload });
  if (error) throw error;
  return data as string;
}

export { localSessionTime, localTimeInput, sessionMatches } from '@/lib/communityActivityLogic';

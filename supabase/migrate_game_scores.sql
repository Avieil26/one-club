create table if not exists public.game_scores (
  game_id text not null check (game_id in ('who', 'grid', 'club', 'draft')),
  period text not null check (period ~ '^[0-9]{4}-[0-9]{2}$'),
  user_id uuid not null references public.profiles(id) on delete cascade,
  score integer not null check (score >= 0),
  updated_at timestamptz not null default now(),
  primary key (game_id, period, user_id)
);

alter table public.game_scores enable row level security;
grant select on public.game_scores to anon, authenticated;
grant insert, update on public.game_scores to authenticated;

drop policy if exists game_scores_read on public.game_scores;
create policy game_scores_read on public.game_scores for select to anon, authenticated using (true);

drop policy if exists game_scores_insert on public.game_scores;
create policy game_scores_insert on public.game_scores for insert to authenticated with check ((select auth.uid()) = user_id);

drop policy if exists game_scores_update on public.game_scores;
create policy game_scores_update on public.game_scores
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists game_scores_period_game_score_idx on public.game_scores (period, game_id, score desc);
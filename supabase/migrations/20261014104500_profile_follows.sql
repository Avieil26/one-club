create table if not exists public.profile_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint profile_follows_not_self check (follower_id <> following_id)
);

alter table public.profile_follows enable row level security;
grant select, insert, delete on public.profile_follows to authenticated;

drop policy if exists profile_follows_read on public.profile_follows;
create policy profile_follows_read
  on public.profile_follows for select to authenticated using (true);

drop policy if exists profile_follows_insert on public.profile_follows;
create policy profile_follows_insert
  on public.profile_follows for insert to authenticated with check (auth.uid() = follower_id);

drop policy if exists profile_follows_delete on public.profile_follows;
create policy profile_follows_delete
  on public.profile_follows for delete to authenticated using (auth.uid() = follower_id);

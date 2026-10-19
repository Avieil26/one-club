-- FUT Champions community content
create table if not exists public.champions_content (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('tactic','tip','guide')),
  title text not null check (char_length(btrim(title)) between 2 and 120),
  body text not null check (char_length(btrim(body)) between 2 and 4000),
  formation text,
  platform text not null check (platform in ('ps5','xbox','pc','switch2')),
  settings jsonb not null default '{}'::jsonb,
  image_uris text[] not null default '{}'::text[],
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.champions_votes (
  content_id uuid not null references public.champions_content(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  value smallint not null default 1 check (value = 1),
  created_at timestamptz not null default now(),
  primary key (content_id, user_id)
);

create table if not exists public.champions_runs (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  matches_played smallint not null default 0 check (matches_played between 0 and 15),
  wins smallint not null default 0 check (wins between 0 and 15),
  losses smallint not null default 0 check (losses between 0 and 15),
  cqp integer not null default 0 check (cqp >= 0),
  rank smallint,
  updated_at timestamptz not null default now(),
  constraint champions_runs_record_valid check (wins + losses <= matches_played)
);

alter table public.champions_content enable row level security;
alter table public.champions_votes enable row level security;
alter table public.champions_runs enable row level security;

grant select, insert, update, delete on public.champions_content to authenticated;
grant select, insert, delete on public.champions_votes to authenticated;
grant select, insert, update, delete on public.champions_runs to authenticated;

drop policy if exists champions_content_read on public.champions_content;
create policy champions_content_read on public.champions_content
for select to authenticated
using (
  status = 'approved'
  or user_id = (select auth.uid())
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin = true)
);

drop policy if exists champions_content_insert on public.champions_content;
create policy champions_content_insert on public.champions_content
for insert to authenticated
with check (user_id = (select auth.uid()) and status = 'pending' and featured = false);

drop policy if exists champions_content_admin_update on public.champions_content;
create policy champions_content_admin_update on public.champions_content
for update to authenticated
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin = true))
with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin = true));

drop policy if exists champions_content_delete on public.champions_content;
create policy champions_content_delete on public.champions_content
for delete to authenticated
using (user_id = (select auth.uid()) or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin = true));

drop policy if exists champions_votes_read on public.champions_votes;
create policy champions_votes_read on public.champions_votes for select to authenticated using (true);
drop policy if exists champions_votes_insert on public.champions_votes;
create policy champions_votes_insert on public.champions_votes for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists champions_votes_delete on public.champions_votes;
create policy champions_votes_delete on public.champions_votes for delete to authenticated using (user_id = (select auth.uid()));

drop policy if exists champions_runs_read on public.champions_runs;
create policy champions_runs_read on public.champions_runs for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists champions_runs_insert on public.champions_runs;
create policy champions_runs_insert on public.champions_runs for insert to authenticated with check (user_id = (select auth.uid()));
drop policy if exists champions_runs_update on public.champions_runs;
create policy champions_runs_update on public.champions_runs for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists champions_runs_delete on public.champions_runs;
create policy champions_runs_delete on public.champions_runs for delete to authenticated using (user_id = (select auth.uid()));

create index if not exists champions_content_status_created_idx on public.champions_content (status, created_at desc);
create index if not exists champions_content_kind_created_idx on public.champions_content (kind, created_at desc);
create index if not exists champions_votes_content_idx on public.champions_votes (content_id);

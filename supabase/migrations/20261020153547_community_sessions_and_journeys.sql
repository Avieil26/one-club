-- Additive, page-loaded community features; existing snapshots and auth are untouched.
create table public.partner_sessions (
 id uuid primary key default gen_random_uuid(), host_user_id uuid not null references public.profiles(id) on delete cascade,
 parent_id uuid unique references public.partner_sessions(id),
 title text not null check (char_length(btrim(title)) between 3 and 90),
 mode text not null check (mode in ('Rush','Clubs','Co-op','Practice')),
 platforms text[] not null check (cardinality(platforms) between 1 and 6 and platforms <@ array['PS5','Xbox Series','PC','PS4','Xbox One','Switch 2']),
 region text not null check (region in ('Middle East','Europe','Americas','Asia-Pacific')),
 language text not null check (language in ('he','en')), play_style text not null check (play_style in ('casual','competitive')),
 notes text not null default '' check (char_length(notes)<=600),
 starts_at timestamptz not null, timezone text not null check (char_length(timezone) between 1 and 100),
 capacity integer not null check (capacity between 2 and 12), weekly boolean not null default false,
 status text not null default 'open' check (status in ('open','completed','cancelled')), created_at timestamptz not null default now()
);
create index partner_sessions_start on public.partner_sessions(status,starts_at);
create index partner_sessions_host on public.partner_sessions(host_user_id);
create table public.partner_session_members (
 session_id uuid not null references public.partner_sessions(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 platform text not null check (platform in ('PS5','Xbox Series','PC','PS4','Xbox One','Switch 2')),
 status text not null check (status in ('joined','invited','left')),
 primary key(session_id,user_id), created_at timestamptz not null default now()
);
create index partner_members_user on public.partner_session_members(user_id,status);
create table public.career_journeys (
 id uuid primary key default gen_random_uuid(), owner_user_id uuid not null references public.profiles(id) on delete cascade,
 title text not null check (char_length(btrim(title)) between 3 and 90), club text not null check(char_length(btrim(club)) between 2 and 80),
 rules text not null check(char_length(btrim(rules)) between 5 and 1000),
 milestones text[] not null check(cardinality(milestones) between 1 and 6 and array_to_string(milestones,'')<>'' and char_length(array_to_string(milestones,''))<=600),
 language text not null check(language in ('he','en')),
 status text not null default 'active' check(status in ('active','archived')), created_at timestamptz not null default now()
);
create index career_journeys_owner on public.career_journeys(owner_user_id);
create index career_journeys_created on public.career_journeys(created_at desc);
create table public.career_journey_members (
 journey_id uuid not null references public.career_journeys(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 club text not null check(char_length(btrim(club)) between 2 and 80),
 difficulty text not null check(char_length(btrim(difficulty)) between 2 and 40),
 season text not null check(char_length(btrim(season)) between 1 and 20), active boolean not null default true,
 primary key(journey_id,user_id), created_at timestamptz not null default now()
);
create index career_members_user on public.career_journey_members(user_id);
create table public.career_journey_updates (
 id uuid primary key default gen_random_uuid(), journey_id uuid not null, user_id uuid not null,
 milestone integer not null check(milestone between 0 and 5), note text not null check(char_length(btrim(note)) between 3 and 600),
 created_at timestamptz not null default now(), unique(journey_id,user_id,milestone),
 foreign key(journey_id,user_id) references public.career_journey_members(journey_id,user_id) on delete cascade
);
create index career_updates_feed on public.career_journey_updates(journey_id,created_at desc);
create index career_updates_user on public.career_journey_updates(user_id);

-- Community data is readable by signed-in players. Writes are only through the
-- checked transaction below; clients have no direct INSERT/UPDATE/DELETE grants.
alter table public.partner_sessions enable row level security;
alter table public.partner_session_members enable row level security;
alter table public.career_journeys enable row level security;
alter table public.career_journey_members enable row level security;
alter table public.career_journey_updates enable row level security;
revoke all on public.partner_sessions,public.partner_session_members,public.career_journeys,public.career_journey_members,public.career_journey_updates from anon,authenticated;
grant select on public.partner_sessions,public.partner_session_members,public.career_journeys,public.career_journey_members,public.career_journey_updates to authenticated;
create policy community_read on public.partner_sessions for select to authenticated using (true);
create policy community_read on public.partner_session_members for select to authenticated using (true);
create policy community_read on public.career_journeys for select to authenticated using (true);
create policy community_read on public.career_journey_members for select to authenticated using (true);
create policy community_read on public.career_journey_updates for select to authenticated using (true);

create schema if not exists fc27_private;
create function fc27_private.community_activity(action text, payload jsonb) returns uuid
language plpgsql security definer set search_path='' as $$
declare
 uid uuid := auth.uid(); result_id uuid; s public.partner_sessions; j public.career_journeys;
 platforms text[]; steps text[]; start_time timestamptz; zone text; member_platform text; idx integer;
begin
 if uid is null then raise exception 'SIGN_IN'; end if;
 if action='create_session' then
  start_time := (payload->>'starts_at')::timestamptz; zone := payload->>'timezone';
  if start_time is null or start_time<now()+interval '5 minutes' or start_time>now()+interval '90 days' then raise exception 'INVALID_TIME'; end if;
  if not exists(select 1 from pg_catalog.pg_timezone_names where name=zone) then raise exception 'INVALID_TIME'; end if;
  select array_agg(value) into platforms from jsonb_array_elements_text(payload->'platforms');
  member_platform := payload->>'platform';
  if member_platform is null or not (member_platform=any(platforms)) then raise exception 'PLATFORM'; end if;
  if (select count(*) from public.partner_sessions where host_user_id=uid and status='open' and starts_at>now())>=10 then raise exception 'HOST_LIMIT'; end if;
  insert into public.partner_sessions(host_user_id,title,mode,platforms,region,language,play_style,notes,starts_at,timezone,capacity,weekly)
   values(uid,btrim(payload->>'title'),payload->>'mode',platforms,payload->>'region',payload->>'language',payload->>'play_style',coalesce(payload->>'notes',''),start_time,zone,(payload->>'capacity')::int,coalesce((payload->>'weekly')::boolean,false)) returning id into result_id;
  insert into public.partner_session_members(session_id,user_id,platform,status) values(result_id,uid,member_platform,'joined');
 elsif action in ('join_session','leave_session','cancel_session','complete_session','repeat_session') then
  select * into s from public.partner_sessions where id=(payload->>'id')::uuid for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  result_id:=s.id;
  if action='join_session' then
   if s.status<>'open' or s.starts_at<=now() then raise exception 'CLOSED'; end if;
   member_platform:=payload->>'platform';
   if member_platform is null or not(member_platform=any(s.platforms)) then raise exception 'PLATFORM'; end if;
   if not exists(select 1 from public.partner_session_members where session_id=s.id and user_id=uid and status='joined')
    and (select count(*) from public.partner_session_members where session_id=s.id and status='joined')>=s.capacity then raise exception 'FULL'; end if;
   insert into public.partner_session_members(session_id,user_id,platform,status) values(s.id,uid,member_platform,'joined')
    on conflict(session_id,user_id) do update set status='joined',platform=excluded.platform;
  elsif action='leave_session' then
   if s.host_user_id=uid then raise exception 'HOST_CANCEL'; end if;
   update public.partner_session_members set status='left' where session_id=s.id and user_id=uid;
  else
   if s.host_user_id<>uid then raise exception 'OWNER_ONLY'; end if;
   if action='cancel_session' then
    if s.status<>'open' then raise exception 'CLOSED'; end if;
    update public.partner_sessions set status='cancelled' where id=s.id;
   elsif action='complete_session' then
    if s.status<>'open' or s.starts_at>now() then raise exception 'NOT_STARTED'; end if;
    update public.partner_sessions set status='completed' where id=s.id;
   else
    if not s.weekly or s.status<>'completed' then raise exception 'NOT_COMPLETED'; end if;
    if exists(select 1 from public.partner_sessions where parent_id=s.id) then
     select id into result_id from public.partner_sessions where parent_id=s.id; return result_id;
    end if;
    -- Calendar weeks in the host's IANA timezone preserve local time across DST.
    start_time := ((s.starts_at at time zone s.timezone)+interval '7 days') at time zone s.timezone;
    while start_time<now()+interval '5 minutes' loop
     start_time:=((start_time at time zone s.timezone)+interval '7 days') at time zone s.timezone;
    end loop;
    insert into public.partner_sessions(host_user_id,parent_id,title,mode,platforms,region,language,play_style,notes,starts_at,timezone,capacity,weekly)
     values(uid,s.id,s.title,s.mode,s.platforms,s.region,s.language,s.play_style,s.notes,start_time,s.timezone,s.capacity,true) returning id into result_id;
    insert into public.partner_session_members(session_id,user_id,platform,status)
     select result_id,user_id,platform,case when user_id=uid then 'joined' else 'invited' end from public.partner_session_members where session_id=s.id and status='joined';
   end if;
  end if;
 elsif action='create_journey' then
  if (select count(*) from public.career_journeys where owner_user_id=uid and status='active')>=5 then raise exception 'HOST_LIMIT'; end if;
  select array_agg(btrim(value)) into steps from jsonb_array_elements_text(payload->'milestones');
  if exists(select 1 from unnest(steps) v where char_length(v) not between 3 and 100) or cardinality(steps)<>cardinality(array(select distinct unnest(steps))) then raise exception 'MILESTONES'; end if;
  insert into public.career_journeys(owner_user_id,title,club,rules,milestones,language)
   values(uid,btrim(payload->>'title'),btrim(payload->>'club'),btrim(payload->>'rules'),steps,payload->>'language') returning id into result_id;
  insert into public.career_journey_members(journey_id,user_id,club,difficulty,season)
   values(result_id,uid,btrim(payload->>'club'),btrim(payload->>'difficulty'),btrim(payload->>'season'));
 elsif action in ('join_journey','leave_journey','update_journey','archive_journey') then
  select * into j from public.career_journeys where id=(payload->>'id')::uuid for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  result_id:=j.id;
  if action='archive_journey' then
   if j.owner_user_id<>uid then raise exception 'OWNER_ONLY'; end if;
   update public.career_journeys set status='archived' where id=j.id;
  elsif action='leave_journey' then
   if j.owner_user_id=uid then raise exception 'HOST_ARCHIVE'; end if;
   update public.career_journey_members set active=false where journey_id=j.id and user_id=uid;
  else
   if j.status<>'active' then raise exception 'CLOSED'; end if;
   if action='join_journey' then
    -- Joining again preserves the club and difficulty used for earlier updates.
    insert into public.career_journey_members(journey_id,user_id,club,difficulty,season)
     values(j.id,uid,btrim(payload->>'club'),btrim(payload->>'difficulty'),btrim(payload->>'season'))
     on conflict(journey_id,user_id) do update set active=true;
   else
    if not exists(select 1 from public.career_journey_members where journey_id=j.id and user_id=uid and active) then raise exception 'JOIN_FIRST'; end if;
    idx:=(payload->>'milestone')::integer;
    if idx is null or idx<0 or idx>=cardinality(j.milestones) then raise exception 'MILESTONES'; end if;
    insert into public.career_journey_updates(journey_id,user_id,milestone,note) values(j.id,uid,idx,btrim(payload->>'note'))
     on conflict(journey_id,user_id,milestone) do update set note=excluded.note,created_at=now();
   end if;
  end if;
 else raise exception 'INVALID_ACTION';
 end if;
 return result_id;
end; $$;
revoke all on function fc27_private.community_activity(text,jsonb) from public,anon;
grant usage on schema fc27_private to authenticated;
grant execute on function fc27_private.community_activity(text,jsonb) to authenticated;
create function public.community_activity(action text,payload jsonb) returns uuid
language sql security invoker set search_path='' as $$ select fc27_private.community_activity(action,payload); $$;
revoke all on function public.community_activity(text,jsonb) from public,anon;
grant execute on function public.community_activity(text,jsonb) to authenticated;

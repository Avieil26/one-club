-- Published browsing projection. Never grant guests direct table access.
create schema if not exists site_internal;
revoke all on schema site_internal from public;
grant usage on schema site_internal to anon, authenticated;

create or replace function site_internal.browse_snapshot()
returns jsonb language sql stable security definer set search_path = '' as $$
 with posts as (select id,user_id,kind,formation,platform,body,player_name,pack_rarity,image_uris,status,created_at from public.fut_posts where status='approved' order by created_at desc limit 60),
 solutions as (select id,challenge_id,user_id,explanation,image_uris,status,created_at from public.sbc_solutions where status='approved' order by created_at desc limit 100),
 grounds as (
  select id,user_id,intent,platform,position,division,archetype,region,play_styles,created_at,
   null::integer as skill_rating,null::integer as player_level,''::text as hours,
   'ea_id'::text as contact_type,''::text as contact_value,null::text as level_image_uri,
   false as level_verified,'pending'::text as level_status
  from public.grounds_posts order by created_at desc limit 60
 ), authors as (select user_id from posts union select user_id from solutions union select user_id from grounds),
 profiles as (select p.id,p.display_name,false as is_admin,p.approved_count,p.reputation,p.created_at from public.profiles p join authors a on a.user_id=p.id),
 challenges as (select id,title,mode,rules,proof_requirements,share_code,ends_at,created_by,created_at from public.career_challenges where ends_at is null or ends_at>now() order by created_at desc limit 100),
 sbcs as (select id,catalog_key,title,kind,requirements,ends_at,created_by,target_score,created_at from public.sbc_challenges where ends_at is null or ends_at>now())
 select jsonb_build_object(
  'profiles',coalesce((select jsonb_agg(to_jsonb(p)) from profiles p),'[]'::jsonb),
  'careerChallenges',coalesce((select jsonb_agg(to_jsonb(c)) from challenges c),'[]'::jsonb),
  'futPosts',coalesce((select jsonb_agg(to_jsonb(p)) from posts p),'[]'::jsonb),
  'groundsPosts',coalesce((select jsonb_agg(to_jsonb(g)) from grounds g),'[]'::jsonb),
  'sbcChallenges',coalesce((select jsonb_agg(to_jsonb(c)) from sbcs c),'[]'::jsonb),
  'sbcSolutions',coalesce((select jsonb_agg(to_jsonb(s)) from solutions s),'[]'::jsonb)
 );
$$;
revoke all on function site_internal.browse_snapshot() from public;
grant execute on function site_internal.browse_snapshot() to anon,authenticated;
create or replace function public.browse_site()
returns jsonb language sql stable security invoker set search_path = '' as $$
 select site_internal.browse_snapshot();
$$;
revoke all on function public.browse_site() from public;
grant execute on function public.browse_site() to anon,authenticated;

-- Consent is checked by the client before recording. The server derives identity and date.
create table public.user_activity_daily (
 user_id uuid not null references auth.users(id) on delete cascade,
 active_day date not null default ((now() at time zone 'Asia/Jerusalem')::date),
 primary key(user_id,active_day)
);
alter table public.user_activity_daily enable row level security;
revoke all on public.user_activity_daily from anon,authenticated;
grant select,insert on public.user_activity_daily to authenticated;
create policy activity_read_own_or_admin on public.user_activity_daily for select to authenticated
 using (user_id=(select auth.uid()) or exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.is_admin));
create policy activity_insert_today on public.user_activity_daily for insert to authenticated
 with check(user_id=(select auth.uid()) and active_day=(now() at time zone 'Asia/Jerusalem')::date
 and not exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.is_admin));
create index user_activity_day on public.user_activity_daily(active_day);
create or replace function public.record_daily_activity()
returns date language plpgsql security invoker set search_path = '' as $$
declare today date := (now() at time zone 'Asia/Jerusalem')::date;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED' using errcode='42501'; end if;
 insert into public.user_activity_daily(user_id,active_day) values(auth.uid(),today) on conflict do nothing;
 return today;
end;
$$;
revoke all on function public.record_daily_activity() from public;
grant execute on function public.record_daily_activity() to authenticated;

create or replace function public.retention_summary()
returns jsonb language plpgsql stable security invoker set search_path = '' as $$
declare result jsonb; today date := (now() at time zone 'Asia/Jerusalem')::date;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and is_admin) then
  raise exception 'ADMIN_REQUIRED' using errcode='42501';
 end if;
 with first_days as (
  select a.user_id,min(a.active_day) as cohort_day from public.user_activity_daily a
  join public.profiles p on p.id=a.user_id where not p.is_admin group by a.user_id
 ), cohorts as (
  select f.cohort_day,count(*) as users,
   count(*) filter(where f.cohort_day+1<=today) as eligible_d1,
   count(*) filter(where f.cohort_day+1<=today and exists(select 1 from public.user_activity_daily a where a.user_id=f.user_id and a.active_day=f.cohort_day+1)) as returned_d1,
   count(*) filter(where f.cohort_day+7<=today) as eligible_d7,
   count(*) filter(where f.cohort_day+7<=today and exists(select 1 from public.user_activity_daily a where a.user_id=f.user_id and a.active_day=f.cohort_day+7)) as returned_d7
  from first_days f group by f.cohort_day order by f.cohort_day desc limit 30
 ), recent as (
  select a.active_day,count(*) as users from public.user_activity_daily a join public.profiles p on p.id=a.user_id
  where not p.is_admin and a.active_day>=today-29 group by a.active_day order by a.active_day desc
 )
 select jsonb_build_object('cohorts',coalesce((select jsonb_agg(to_jsonb(c)) from cohorts c),'[]'::jsonb),
 'daily',coalesce((select jsonb_agg(to_jsonb(d)) from recent d),'[]'::jsonb),
 'timezone','Asia/Jerusalem','checked_day',today,'started_day',(select min(active_day) from public.user_activity_daily)) into result;
 return result;
end;
$$;
revoke all on function public.retention_summary() from public;
grant execute on function public.retention_summary() to authenticated;
notify pgrst,'reload schema';

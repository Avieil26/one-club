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
   'discord'::text as contact_type,''::text as contact_value,null::text as level_image_uri,
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

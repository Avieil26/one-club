begin;
-- Real authenticated-role checks; fixtures roll back even when a check fails.
do $$
declare
 host uuid:=gen_random_uuid(); player uuid:=gen_random_uuid(); outsider uuid:=gen_random_uuid();
 sid uuid; next_id uuid; jid uuid; denied boolean; verified boolean:=false;
 payload jsonb; expected_time timestamptz;
begin
 begin
  insert into auth.users(id,aud,role,email,raw_user_meta_data,created_at,updated_at)
   select id,'authenticated','authenticated',id::text||'@example.invalid','{"display_name":"Rollback community QA"}'::jsonb,now(),now() from unnest(array[host,player,outsider]) id;
  insert into public.profiles(id,display_name) values(host,'Rollback community host'),(player,'Rollback community player'),(outsider,'Rollback outsider') on conflict do nothing;
  perform set_config('request.jwt.claim.sub',host::text,true);
  set local role authenticated;
  payload:=jsonb_build_object('title','QA weekly squad','mode','Rush','platforms',array['PS5','PC'],'platform','PS5','region','Europe','language','en','play_style','casual','starts_at',now()+interval '1 day','timezone','Europe/London','capacity',2,'weekly',true);
  denied:=false; begin
   perform public.community_activity('create_session',payload || jsonb_build_object('capacity',11));
  exception when check_violation then denied:=true; end;
  if not denied then raise exception 'Rush party exceeded four players'; end if;
  sid:=public.community_activity('create_session',payload);
  if (select count(*) from public.partner_session_members where session_id=sid and status='joined')<>1 then raise exception 'Host must occupy a spot'; end if;
  denied:=false; begin
   insert into public.partner_session_members(session_id,user_id,platform,status) values(sid,outsider,'PS5','joined');
  exception when insufficient_privilege then denied:=true; end;
  if not denied then raise exception 'Direct writes bypassed RPC'; end if;
  perform set_config('request.jwt.claim.sub',player::text,true);
  denied:=false; begin
   perform public.community_activity('join_session',jsonb_build_object('id',sid,'platform','PS4'));
  exception when raise_exception then if sqlerrm<>'PLATFORM' then raise; end if; denied:=true; end;
  if not denied then raise exception 'Incompatible platform accepted'; end if;
  perform public.community_activity('join_session',jsonb_build_object('id',sid,'platform','PC'));
  perform public.community_activity('join_session',jsonb_build_object('id',sid,'platform','PC'));
  if (select count(*) from public.partner_session_members where session_id=sid and status='joined')<>2 then raise exception 'Join must be idempotent'; end if;
  perform set_config('request.jwt.claim.sub',outsider::text,true);
  denied:=false; begin
   perform public.community_activity('join_session',jsonb_build_object('id',sid,'platform','PS5'));
  exception when raise_exception then if sqlerrm<>'FULL' then raise; end if; denied:=true; end;
  if not denied then raise exception 'Capacity exceeded'; end if;
  denied:=false; begin
   perform public.community_activity('cancel_session',jsonb_build_object('id',sid));
  exception when raise_exception then if sqlerrm<>'OWNER_ONLY' then raise; end if; denied:=true; end;
  if not denied then raise exception 'Nonhost cancellation accepted'; end if;
  perform set_config('request.jwt.claim.sub',host::text,true);
  denied:=false; begin
   perform public.community_activity('complete_session',jsonb_build_object('id',sid));
  exception when raise_exception then if sqlerrm<>'NOT_STARTED' then raise; end if; denied:=true; end;
  if not denied then raise exception 'Completed before starting'; end if;
  reset role;
  update public.partner_sessions set starts_at='2026-10-18 18:00:00+00' where id=sid;
  expected_time:='2026-10-25 19:00:00+00'; -- 19:00 London stays 19:00 across DST.
  set local role authenticated;
  perform public.community_activity('complete_session',jsonb_build_object('id',sid));
  next_id:=public.community_activity('repeat_session',jsonb_build_object('id',sid));
  if public.community_activity('repeat_session',jsonb_build_object('id',sid))<>next_id then raise exception 'Repeated invitation duplicated session'; end if;
  if (select starts_at from public.partner_sessions where id=next_id)<>expected_time then raise exception 'Weekly local time changed across DST'; end if;
  if not exists(select 1 from public.partner_session_members where session_id=next_id and user_id=player and status='invited') then raise exception 'Returning squad not invited'; end if;
  perform set_config('request.jwt.claim.sub',player::text,true);
  perform public.community_activity('join_session',jsonb_build_object('id',next_id,'platform','PC'));
  perform public.community_activity('leave_session',jsonb_build_object('id',next_id));
  perform set_config('request.jwt.claim.sub',outsider::text,true);
  perform public.community_activity('join_session',jsonb_build_object('id',next_id,'platform','PS5'));

  perform set_config('request.jwt.claim.sub',host::text,true);
  jid:=public.community_activity('create_journey',jsonb_build_object('title','QA career journey','club','Schalke','rules','Academy only; no transfers','milestones',array['First window','Promotion'],'language','en','difficulty','World Class','season','1'));
  perform set_config('request.jwt.claim.sub',player::text,true);
  denied:=false; begin
   perform public.community_activity('update_journey',jsonb_build_object('id',jid,'milestone',0,'note','Not joined'));
  exception when raise_exception then if sqlerrm<>'JOIN_FIRST' then raise; end if; denied:=true; end;
  if not denied then raise exception 'Nonmember update accepted'; end if;
  perform public.community_activity('join_journey',jsonb_build_object('id',jid,'club','Schalke','difficulty','World Class','season','1'));
  denied:=false; begin
   perform public.community_activity('update_journey',jsonb_build_object('id',jid,'milestone',5,'note','Invalid milestone'));
  exception when raise_exception then if sqlerrm<>'MILESTONES' then raise; end if; denied:=true; end;
  if not denied then raise exception 'Out-of-range milestone accepted'; end if;
  perform public.community_activity('update_journey',jsonb_build_object('id',jid,'milestone',0,'note','First youth player signed','user_id',host));
  perform public.community_activity('update_journey',jsonb_build_object('id',jid,'milestone',0,'note','Corrected progress'));
  if (select count(*) from public.career_journey_updates where journey_id=jid)<>1 or exists(select 1 from public.career_journey_updates where journey_id=jid and user_id=host) then raise exception 'Update duplicated or impersonated another user'; end if;
  perform public.community_activity('update_journey',jsonb_build_object('id',jid,'milestone',-1,'note','A short season note'));
  perform public.community_activity('update_journey',jsonb_build_object('id',jid,'milestone',-1,'note','Another season note'));
  if (select count(*) from public.career_journey_updates where journey_id=jid and milestone=-1)<>2 or (select count(*) from public.career_journey_updates where journey_id=jid and milestone>=0)<>1 then raise exception 'Journal notes must not complete milestones'; end if;
  perform public.community_activity('leave_journey',jsonb_build_object('id',jid));
  if (select count(*) from public.career_journey_updates where journey_id=jid)<>3 then raise exception 'History lost on leave'; end if;
  denied:=false; begin
   perform public.community_activity('archive_journey',jsonb_build_object('id',jid));
  exception when raise_exception then if sqlerrm<>'OWNER_ONLY' then raise; end if; denied:=true; end;
  if not denied then raise exception 'Nonowner archive accepted'; end if;
  perform set_config('request.jwt.claim.sub',host::text,true);
  perform public.community_activity('archive_journey',jsonb_build_object('id',jid));
  denied:=false; begin
   perform public.community_activity('update_journey',jsonb_build_object('id',jid,'milestone',0,'note','Archived update'));
  exception when raise_exception then if sqlerrm<>'CLOSED' then raise; end if; denied:=true; end;
  if not denied then raise exception 'Archived journey accepted update'; end if;
  perform set_config('request.jwt.claim.sub','',true);
  denied:=false; begin
   perform public.community_activity('create_session',payload);
  exception when raise_exception then if sqlerrm<>'SIGN_IN' then raise; end if; denied:=true; end;
  if not denied then raise exception 'Anonymous action accepted'; end if;
  verified:=true;
  raise sqlstate 'P9999';
 exception when sqlstate 'P9999' then null;
 end;
 perform set_config('fc27.community_qa',jsonb_build_object('success',verified,'fixtures_remaining',(select count(*) from auth.users where id in(host,player,outsider)),'checks','capacity, platform, idempotent join, owner permissions, DST recurrence, invitation acceptance, leave, membership, milestone bounds, personal updates, archive, anonymous rejection')::text,false);
end $$;
select current_setting('fc27.community_qa') as result;

rollback;

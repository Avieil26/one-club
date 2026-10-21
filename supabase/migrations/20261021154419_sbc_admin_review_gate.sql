-- The insert trigger also protects legacy APK upload calls.
alter table public.sbc_solutions add column if not exists reviewed_by uuid references public.profiles(id);
alter table public.sbc_solutions add column if not exists reviewed_at timestamptz;
alter table public.sbc_solutions alter column status set default 'pending';
create index if not exists sbc_solutions_pending_review on public.sbc_solutions(created_at desc) where status='pending';
create schema if not exists fc27_private;
grant usage on schema fc27_private to authenticated;
create or replace function fc27_private.sbc_submission_pending()
returns trigger language plpgsql set search_path = '' as $$
begin
 new.status := 'pending'; new.reviewed_by := null; new.reviewed_at := null;
 return new;
end;
$$;
revoke all on function fc27_private.sbc_submission_pending() from public,anon,authenticated;
drop trigger if exists sbc_submission_pending on public.sbc_solutions;
create trigger sbc_submission_pending before insert on public.sbc_solutions for each row execute function fc27_private.sbc_submission_pending();

create or replace function fc27_private.moderate_sbc_solution(p_id uuid,p_status text)
returns void language plpgsql security definer set search_path = '' as $$
declare
 v_admin uuid := public.assert_admin();
 v_old text; v_author uuid; v_credit integer;
begin
 if p_status is null or p_status not in ('approved','rejected') then raise exception 'סטטוס לא תקין'; end if;
 select status,user_id into v_old,v_author from public.sbc_solutions where id=p_id for update;
 if not found then raise exception 'הפתרון לא נמצא'; end if;
 if v_old=p_status then return; end if;
 select count(*)::integer*2 into v_credit from public.sbc_worked where solution_id=p_id;
 if v_old='approved' then perform public.bump_profile(v_author,0,-v_credit); end if;
 if p_status='approved' then perform public.bump_profile(v_author,0,v_credit); end if;
 update public.sbc_solutions set status=p_status,reviewed_by=v_admin,reviewed_at=now() where id=p_id;
end;
$$;
revoke all on function fc27_private.moderate_sbc_solution(uuid,text) from public,anon;
grant execute on function fc27_private.moderate_sbc_solution(uuid,text) to authenticated;
create or replace function public.moderate_sbc_solution(p_id uuid,p_status text)
returns void language sql security invoker set search_path = '' as $$
 select fc27_private.moderate_sbc_solution(p_id,p_status);
$$;
revoke all on function public.moderate_sbc_solution(uuid,text) from public,anon;
grant execute on function public.moderate_sbc_solution(uuid,text) to authenticated;

-- Both vote entry points use the existing row lock and approved-status check.
create or replace function public.mark_sbc_worked(p_id uuid)
returns void language sql security invoker set search_path = '' as $$
 select public.vote_sbc_solution(p_id,'up');
$$;
revoke all on function public.mark_sbc_worked(uuid) from public,anon;
grant execute on function public.mark_sbc_worked(uuid) to authenticated;
alter table public.sbc_solutions enable row level security;
drop policy if exists solutions_read on public.sbc_solutions;
create policy solutions_read on public.sbc_solutions for select to authenticated using (
 status='approved' or user_id=(select auth.uid()) or
 exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.is_admin)
);
drop policy if exists worked_read on public.sbc_worked;
create policy worked_read on public.sbc_worked for select to authenticated using (
 exists(select 1 from public.sbc_solutions s where s.id=solution_id and s.status='approved')
);
drop policy if exists failed_read on public.sbc_failed;
create policy failed_read on public.sbc_failed for select to authenticated using (
 exists(select 1 from public.sbc_solutions s where s.id=solution_id and s.status='approved')
);

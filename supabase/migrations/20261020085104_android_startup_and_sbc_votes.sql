-- Additive support for the native APK; no website release or existing row deletion.
create table if not exists public.sbc_failed (
  solution_id uuid not null references public.sbc_solutions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (solution_id, user_id)
);
alter table public.sbc_failed enable row level security;
create policy failed_read on public.sbc_failed for select to authenticated using (true);
revoke all on public.sbc_failed from anon, authenticated;
grant select on public.sbc_failed to authenticated;

-- Privileged writes are private, guarded by the caller identity and exposed only
-- through an authenticated, security-invoker RPC wrapper.
create schema if not exists fc27_private;
revoke all on schema fc27_private from public;
grant usage on schema fc27_private to authenticated;
create or replace function fc27_private.vote_sbc_solution(p_id uuid, p_vote text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_author uuid;
  v_was_up boolean;
begin
  if v_user is null then raise exception 'צריך להתחבר'; end if;
  if p_vote is null or p_vote not in ('up', 'down', 'clear') then raise exception 'דירוג לא תקין'; end if;
  select user_id into v_author from public.sbc_solutions
    where id = p_id and status = 'approved' for update;
  if v_author is null then raise exception 'הפתרון לא נמצא'; end if;
  if v_author = v_user then raise exception 'אי אפשר לדרג פתרון של עצמך'; end if;
  select exists(select 1 from public.sbc_worked where solution_id = p_id and user_id = v_user) into v_was_up;
  delete from public.sbc_worked where solution_id = p_id and user_id = v_user;
  delete from public.sbc_failed where solution_id = p_id and user_id = v_user;
  if p_vote = 'up' then
    insert into public.sbc_worked(solution_id, user_id) values (p_id, v_user);
    if not v_was_up then perform public.bump_profile(v_author, 0, 2); end if;
  elsif p_vote = 'down' then
    insert into public.sbc_failed(solution_id, user_id) values (p_id, v_user);
  end if;
  if v_was_up and p_vote <> 'up' then perform public.bump_profile(v_author, 0, -2); end if;
end;
$$;
revoke all on function fc27_private.vote_sbc_solution(uuid,text) from public, anon;
grant execute on function fc27_private.vote_sbc_solution(uuid,text) to authenticated;
create or replace function public.vote_sbc_solution(p_id uuid, p_vote text)
returns void language sql security invoker set search_path = '' as $$
  select fc27_private.vote_sbc_solution(p_id, p_vote);
$$;
revoke all on function public.vote_sbc_solution(uuid,text) from public, anon;
grant execute on function public.vote_sbc_solution(uuid,text) to authenticated;

-- One RLS-governed read replaces one Storage list call per profile on native.
create or replace function public.profile_avatar_paths()
returns table(user_id text, object_name text)
language sql stable security invoker set search_path = '' as $$
  select distinct on (split_part(o.name, '/', 1))
    split_part(o.name, '/', 1), o.name
  from storage.objects o
  where o.bucket_id = 'proofs'
    and o.name ~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/avatar/[^/]+[.](jpe?g|png|webp)$'
  order by split_part(o.name, '/', 1), o.created_at desc nulls last, o.name;
$$;
revoke all on function public.profile_avatar_paths() from public, anon;
grant execute on function public.profile_avatar_paths() to authenticated;

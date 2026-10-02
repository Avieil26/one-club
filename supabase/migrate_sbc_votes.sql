create table if not exists public.sbc_failed (
  solution_id uuid not null references public.sbc_solutions (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  primary key (solution_id, user_id)
);

alter table public.sbc_failed enable row level security;

drop policy if exists failed_read on public.sbc_failed;
create policy failed_read on public.sbc_failed for select to authenticated using (true);

grant select on public.sbc_failed to authenticated;

create or replace function public.vote_sbc_solution(p_id uuid, p_vote text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_author uuid;
  v_was_up boolean;
begin
  if v_user is null then raise exception 'צריך להתחבר'; end if;
  if p_vote not in ('up', 'down', 'clear') then raise exception 'דירוג לא תקין'; end if;
  select user_id into v_author from public.sbc_solutions where id = p_id and status = 'approved';
  if v_author is null then raise exception 'הפתרון לא נמצא'; end if;
  if v_author = v_user then raise exception 'אי אפשר לדרג פתרון של עצמך'; end if;
  select exists(
    select 1 from public.sbc_worked where solution_id = p_id and user_id = v_user
  ) into v_was_up;
  delete from public.sbc_worked where solution_id = p_id and user_id = v_user;
  delete from public.sbc_failed where solution_id = p_id and user_id = v_user;
  if p_vote = 'up' then
    insert into public.sbc_worked (solution_id, user_id) values (p_id, v_user);
    if not v_was_up then
      perform public.bump_profile(v_author, 0, 2);
    end if;
  elsif p_vote = 'down' then
    insert into public.sbc_failed (solution_id, user_id) values (p_id, v_user);
  end if;
end;
$$;

grant execute on function public.vote_sbc_solution(uuid, text) to authenticated;

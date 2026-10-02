create table if not exists public.fut_likes (
  post_id uuid not null references public.fut_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.fut_likes enable row level security;
grant select on public.fut_likes to authenticated;
drop policy if exists fut_likes_read on public.fut_likes;
create policy fut_likes_read on public.fut_likes for select to authenticated using (true);

create or replace function public.toggle_fut_like(p_post uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'צריך להתחבר'; end if;
  if not exists (select 1 from public.fut_posts where id = p_post and kind = 'squad' and status = 'approved') then
    raise exception 'הקבוצה לא נמצאה';
  end if;
  if exists (select 1 from public.fut_likes where post_id = p_post and user_id = v_user) then
    delete from public.fut_likes where post_id = p_post and user_id = v_user;
  else
    insert into public.fut_likes (post_id, user_id) values (p_post, v_user);
  end if;
end;
$$;

grant execute on function public.toggle_fut_like(uuid) to authenticated;

drop policy if exists player_votes_write on public.player_votes;
create policy player_votes_write on public.player_votes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists player_votes_remove on public.player_votes;
create policy player_votes_remove on public.player_votes for delete to authenticated using (user_id = auth.uid());
grant insert, delete on public.player_votes to authenticated;

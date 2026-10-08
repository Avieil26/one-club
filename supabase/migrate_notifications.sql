create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  kind text not null,
  title text not null,
  body text not null default '',
  href text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

alter table public.notifications enable row level security;
grant select, update on public.notifications to authenticated;

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists notifications_user_created_idx
on public.notifications (user_id, created_at desc);

create or replace function private.push_notification(
  p_user_id uuid,
  p_actor_user_id uuid,
  p_kind text,
  p_title text,
  p_body text,
  p_href text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_user_id is null then return; end if;
  insert into public.notifications(user_id, actor_user_id, kind, title, body, href)
  values (p_user_id, p_actor_user_id, p_kind, p_title, left(coalesce(p_body, ''), 500), p_href);
end;
$$;

create or replace function private.notify_new_message() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform private.push_notification(new.to_user_id, new.from_user_id, 'message', 'הודעה חדשה', 'שלחו לך הודעה חדשה.', '/grounds/chat/' || new.from_user_id::text);
  return new;
end; $$;

create or replace function private.notify_fut_like() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare owner_id uuid;
begin
  select user_id into owner_id from public.fut_posts where id = new.post_id;
  if owner_id is not null and owner_id <> new.user_id then
    perform private.push_notification(owner_id, new.user_id, 'fut_like', 'קיבלת לייק', 'מישהו אהב את הפוסט שלך.', '/ultimate/' || new.post_id::text);
  end if;
  return new;
end; $$;

create or replace function private.notify_new_comment() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare owner_id uuid; target_href text;
begin
  if new.target_type = 'fut_post' then
    select user_id into owner_id from public.fut_posts where id = new.target_id;
    target_href := '/ultimate/' || new.target_id::text;
  elsif new.target_type = 'career_submission' then
    select user_id into owner_id from public.career_submissions where id = new.target_id;
    target_href := '/career/' || new.target_id::text;
  elsif new.target_type = 'sbc_solution' then
    select user_id into owner_id from public.sbc_solutions where id = new.target_id;
    target_href := '/sbc/solution/' || new.target_id::text;
  end if;
  if owner_id is not null and owner_id <> new.user_id then
    perform private.push_notification(owner_id, new.user_id, 'comment', 'תגובה חדשה', 'מישהו הגיב על התוכן שלך.', target_href);
  end if;
  return new;
end; $$;

create or replace function private.notify_comment_like() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare owner_id uuid;
begin
  select user_id into owner_id from public.comments where id = new.comment_id;
  if owner_id is not null and owner_id <> new.user_id then
    perform private.push_notification(owner_id, new.user_id, 'comment_like', 'קיבלת לייק על תגובה', 'מישהו אהב את התגובה שלך.', '/board');
  end if;
  return new;
end; $$;

create or replace function private.notify_champions_vote() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare owner_id uuid;
begin
  select user_id into owner_id from public.champions_content where id = new.content_id;
  if owner_id is not null and owner_id <> new.user_id then
    perform private.push_notification(owner_id, new.user_id, 'champions_vote', 'התוכן שלך קיבל הצבעה', 'מישהו סימן שהתוכן שלך שימושי.', '/champions');
  end if;
  return new;
end; $$;

create or replace function private.notify_status_change() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if new.status is distinct from old.status and new.status in ('approved', 'rejected') then
    perform private.push_notification(
      new.user_id,
      null,
      tg_table_name || '_status',
      case when new.status = 'approved' then 'התוכן שלך אושר' else 'התוכן שלך נדחה' end,
      case when new.status = 'approved' then 'התוכן שלך אושר ומוכן להופיע בקהילה.' else 'התוכן שלך לא אושר הפעם.' end,
      null
    );
  end if;
  return new;
end; $$;

drop trigger if exists notifications_new_message on public.direct_messages;
create trigger notifications_new_message after insert on public.direct_messages for each row execute function private.notify_new_message();

drop trigger if exists notifications_fut_like on public.fut_likes;
create trigger notifications_fut_like after insert on public.fut_likes for each row execute function private.notify_fut_like();

drop trigger if exists notifications_new_comment on public.comments;
create trigger notifications_new_comment after insert on public.comments for each row execute function private.notify_new_comment();

drop trigger if exists notifications_comment_like on public.comment_likes;
create trigger notifications_comment_like after insert on public.comment_likes for each row execute function private.notify_comment_like();

drop trigger if exists notifications_champions_vote on public.champions_votes;
create trigger notifications_champions_vote after insert on public.champions_votes for each row execute function private.notify_champions_vote();

drop trigger if exists notifications_fut_status on public.fut_posts;
create trigger notifications_fut_status after update of status on public.fut_posts for each row execute function private.notify_status_change();

drop trigger if exists notifications_career_status on public.career_submissions;
create trigger notifications_career_status after update of status on public.career_submissions for each row execute function private.notify_status_change();

drop trigger if exists notifications_sbc_status on public.sbc_solutions;
create trigger notifications_sbc_status after update of status on public.sbc_solutions for each row execute function private.notify_status_change();

drop trigger if exists notifications_champions_status on public.champions_content;
create trigger notifications_champions_status after update of status on public.champions_content for each row execute function private.notify_status_change();

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

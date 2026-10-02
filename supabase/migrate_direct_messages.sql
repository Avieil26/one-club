create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles (id) on delete cascade,
  to_user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now(),
  check (from_user_id <> to_user_id)
);

alter table public.direct_messages enable row level security;

grant select, insert on public.direct_messages to authenticated;

drop policy if exists direct_messages_read on public.direct_messages;
create policy direct_messages_read on public.direct_messages
  for select to authenticated
  using (from_user_id = auth.uid() or to_user_id = auth.uid());

drop policy if exists direct_messages_insert on public.direct_messages;
create policy direct_messages_insert on public.direct_messages
  for insert to authenticated
  with check (
    from_user_id = auth.uid()
    and exists (select 1 from public.profiles where id = to_user_id)
  );

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'direct_messages'
  ) then
    alter publication supabase_realtime add table public.direct_messages;
  end if;
end $$;

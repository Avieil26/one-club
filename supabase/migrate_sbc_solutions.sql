-- Run this once in Supabase SQL Editor so catalog SBC solutions can publish.
alter table public.sbc_challenges
  add column if not exists catalog_key text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sbc_challenges_catalog_key_key'
  ) then
    alter table public.sbc_challenges add constraint sbc_challenges_catalog_key_key unique (catalog_key);
  end if;
end $$;

drop function if exists public.add_sbc_solution(uuid, text, text[]);
drop function if exists public.add_sbc_solution(text, text, text[], text, text, text, timestamptz, integer);

create or replace function public.add_sbc_solution(
  p_challenge text,
  p_explanation text,
  p_images text[],
  p_title text default null,
  p_requirements text default null,
  p_kind text default 'classic',
  p_ends timestamptz default null,
  p_target integer default null
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_challenge uuid;
  v_kind text;
  v_id uuid;
  v_creator uuid;
begin
  if v_user is null then raise exception 'צריך להתחבר'; end if;
  if char_length(trim(p_explanation)) < 1 then raise exception 'חסר הסבר קצר לפתרון'; end if;
  if coalesce(array_length(p_images, 1), 0) < 1 or array_length(p_images, 1) > 3 then
    raise exception 'צריך לפחות צילום מסך אחד של הסגל שהשלמתם';
  end if;

  if p_challenge ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select id, kind into v_challenge, v_kind from public.sbc_challenges where id = p_challenge::uuid;
  else
    select id, kind into v_challenge, v_kind from public.sbc_challenges where catalog_key = p_challenge;
  end if;

  if v_challenge is null then
    if p_title is null or char_length(trim(p_title)) < 1 or p_requirements is null or char_length(trim(p_requirements)) < 1 then
      raise exception 'האתגר לא נמצא';
    end if;
    if coalesce(p_kind, 'classic') not in ('streamlined', 'classic') then raise exception 'סוג SBC לא תקין'; end if;
    select id into v_creator from public.profiles where is_admin order by created_at limit 1;
    v_creator := coalesce(v_creator, v_user);
    insert into public.sbc_challenges (catalog_key, title, kind, requirements, ends_at, created_by, target_score)
    values (
      nullif(trim(p_challenge), ''),
      trim(p_title),
      coalesce(nullif(trim(p_kind), ''), 'classic'),
      trim(p_requirements),
      p_ends,
      v_creator,
      case when coalesce(p_kind, 'classic') = 'streamlined' then p_target else null end
    )
    on conflict (catalog_key) do update
      set title = excluded.title,
          requirements = excluded.requirements,
          ends_at = excluded.ends_at,
          target_score = excluded.target_score
    returning id, kind into v_challenge, v_kind;
  end if;

  if v_kind is null then
    select kind into v_kind from public.sbc_challenges where id = v_challenge;
  end if;
  if v_kind <> 'classic' then raise exception 'פתרון קהילה מיועד ל-SBC קלאסי. ל-Streamlined יש מחשבון.'; end if;

  insert into public.sbc_solutions (challenge_id, user_id, explanation, image_uris, status)
  values (v_challenge, v_user, trim(p_explanation), p_images, 'approved')
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.add_sbc_solution(text, text, text[], text, text, text, timestamptz, integer) to authenticated;

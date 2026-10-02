-- FC קהילה — סכמת Supabase
-- הריצו את כל הקובץ ב-SQL Editor.
-- אחר כך: Authentication > Providers > Email, ואפשר לכבות אישור אימייל בזמן פיתוח.
-- קבעו מנהל (אחרי הרשמה):
--   update public.profiles set is_admin = true where id = '<user-uuid>';

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  is_admin boolean not null default false,
  approved_count integer not null default 0,
  reputation integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists avatar_url text;

create table if not exists public.career_challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  mode text not null check (mode in ('manager', 'player')),
  rules text not null,
  proof_requirements text not null,
  share_code text,
  ends_at timestamptz,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.career_submissions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.career_challenges (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  player_or_club_name text not null,
  note text not null,
  image_uris text[] not null,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.fut_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  kind text not null check (kind in ('squad', 'pack')),
  formation text,
  platform text not null check (platform in ('ps5', 'xbox', 'pc', 'switch2')),
  body text not null,
  player_name text,
  pack_rarity text check (pack_rarity in ('regular', 'special', 'holographic')),
  image_uris text[] not null,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.fut_ratings (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.fut_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  fit integer not null check (fit between 1 and 5),
  fun integer not null check (fun between 1 and 5),
  creativity integer not null check (creativity between 1 and 5),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('fut_post', 'career_submission', 'sbc_solution')),
  target_id uuid not null,
  user_id uuid not null references public.profiles (id),
  preset text check (preset in ('respect', 'nice', 'smart', 'funny')),
  body text not null default '',
  status text not null check (status in ('visible', 'hidden_pending')),
  created_at timestamptz not null default now()
);

create table if not exists public.grounds_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id),
  intent text not null check (intent in ('need_player', 'looking_for_club')),
  platform text not null check (platform in ('ps5', 'xbox', 'pc', 'switch2')),
  position text not null,
  division text not null check (division in ('10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'elite')),
  skill_rating integer,
  archetype text not null,
  region text not null,
  hours text not null,
  contact_type text not null check (contact_type in ('whatsapp', 'discord')),
  contact_value text not null,
  level_image_uri text,
  level_verified boolean not null default false,
  level_status text not null check (level_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.sbc_challenges (
  id uuid primary key default gen_random_uuid(),
  catalog_key text unique,
  title text not null,
  kind text not null check (kind in ('streamlined', 'classic')),
  requirements text not null,
  ends_at timestamptz,
  created_by uuid not null references public.profiles (id),
  target_score integer,
  created_at timestamptz not null default now()
);

create table if not exists public.sbc_solutions (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.sbc_challenges (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  explanation text not null,
  image_uris text[] not null,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.sbc_worked (
  solution_id uuid not null references public.sbc_solutions (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  primary key (solution_id, user_id)
);

create table if not exists public.sbc_failed (
  solution_id uuid not null references public.sbc_solutions (id) on delete cascade,
  user_id uuid not null references public.profiles (id),
  primary key (solution_id, user_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (comment_id, reporter_id)
);

alter table public.profiles enable row level security;
alter table public.career_challenges enable row level security;
alter table public.career_submissions enable row level security;
alter table public.fut_posts enable row level security;
alter table public.fut_ratings enable row level security;
alter table public.comments enable row level security;
alter table public.grounds_posts enable row level security;
alter table public.sbc_challenges enable row level security;
alter table public.sbc_solutions enable row level security;
alter table public.sbc_worked enable row level security;
alter table public.sbc_failed enable row level security;
alter table public.reports enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(trim(new.raw_user_meta_data->>'name'), ''),
      split_part(new.email, '@', 1)
    ),
    nullif(coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'), '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.protect_profile()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is null or coalesce(current_setting('app.trusted', true), '') = '1' then
    return new;
  end if;
  new.is_admin := old.is_admin;
  new.approved_count := old.approved_count;
  new.reputation := old.reputation;
  return new;
end;
$$;

drop trigger if exists profiles_protect on public.profiles;
create trigger profiles_protect
before update on public.profiles
for each row execute function public.protect_profile();

create or replace function public.bump_profile(p_user uuid, p_approved integer, p_reputation integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.trusted', '1', true);
  update public.profiles
  set approved_count = greatest(0, approved_count + p_approved),
      reputation = greatest(0, reputation + p_reputation)
  where id = p_user;
end;
$$;

create or replace function public.assert_admin()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'צריך להתחבר';
  end if;
  if not exists (select 1 from public.profiles where id = v_user and is_admin) then
    raise exception 'רק מנהל יכול לבצע את הפעולה הזו';
  end if;
  return v_user;
end;
$$;

create or replace function public.comment_is_blocked(p_body text)
returns boolean
language plpgsql
immutable
as $$
declare
  word text;
  lowered text := lower(coalesce(p_body, ''));
  words text[] := array[
    'מטומטם', 'מטומטמת', 'אידיוט', 'דביל', 'מפגר', 'זין', 'כוסאמק', 'כוסעמק',
    'זונה', 'בן זונה', 'בת זונה', 'חרא', 'מניאק', 'קוקסינל', 'fuck', 'shit', 'bitch', 'asshole'
  ];
begin
  foreach word in array words loop
    if position(word in lowered) > 0 then
      return true;
    end if;
  end loop;
  return false;
end;
$$;

create or replace function public.create_career_challenge(
  p_title text, p_mode text, p_rules text, p_proof text, p_share text, p_ends timestamptz
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_admin uuid := public.assert_admin();
  v_id uuid;
begin
  if char_length(trim(p_title)) < 1 or char_length(trim(p_rules)) < 1 or char_length(trim(p_proof)) < 1 then
    raise exception 'חסרים פרטי אתגר';
  end if;
  if p_mode not in ('manager', 'player') then
    raise exception 'סוג קריירה לא תקין';
  end if;
  insert into public.career_challenges (title, mode, rules, proof_requirements, share_code, ends_at, created_by)
  values (trim(p_title), p_mode, trim(p_rules), trim(p_proof), nullif(trim(coalesce(p_share, '')), ''), p_ends, v_admin)
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.submit_career(p_challenge uuid, p_name text, p_note text, p_images text[])
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_count integer;
  v_ends timestamptz;
  v_status text;
  v_id uuid;
begin
  if v_user is null then raise exception 'צריך להתחבר'; end if;
  select ends_at into v_ends from public.career_challenges where id = p_challenge;
  if not found then raise exception 'האתגר לא נמצא'; end if;
  if v_ends is not null and v_ends < now() then raise exception 'האתגר הזה כבר נסגר'; end if;
  if char_length(trim(p_name)) < 1 or char_length(trim(p_note)) < 1 then raise exception 'חסר שם או תיאור'; end if;
  if coalesce(array_length(p_images, 1), 0) < 1 or array_length(p_images, 1) > 3 then
    raise exception 'צריך לפחות צילום מסך אחד';
  end if;
  select approved_count into v_count from public.profiles where id = v_user;
  v_status := case when v_count >= 5 then 'approved' else 'pending' end;
  insert into public.career_submissions (challenge_id, user_id, player_or_club_name, note, image_uris, status)
  values (p_challenge, v_user, trim(p_name), trim(p_note), p_images, v_status)
  returning id into v_id;
  if v_status = 'approved' then
    perform public.bump_profile(v_user, 1, 10);
  end if;
  return v_id;
end;
$$;

create or replace function public.moderate_career(p_id uuid, p_status text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_old text;
  v_user uuid;
begin
  perform public.assert_admin();
  if p_status not in ('approved', 'rejected') then raise exception 'סטטוס לא תקין'; end if;
  select status, user_id into v_old, v_user from public.career_submissions where id = p_id;
  if v_old is null then raise exception 'ההגשה לא נמצאה'; end if;
  if v_old = p_status then return; end if;
  if v_old = 'approved' then perform public.bump_profile(v_user, -1, -10); end if;
  if p_status = 'approved' then perform public.bump_profile(v_user, 1, 10); end if;
  update public.career_submissions set status = p_status where id = p_id;
end;
$$;

create or replace function public.create_fut_post(
  p_kind text, p_formation text, p_platform text, p_body text, p_player text, p_rarity text, p_images text[]
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
begin
  if v_user is null then raise exception 'צריך להתחבר'; end if;
  if p_platform not in ('ps5', 'xbox', 'pc', 'switch2') then raise exception 'פלטפורמה לא תקינה'; end if;
  if char_length(trim(coalesce(p_body, ''))) < 1 or char_length(trim(p_body)) > 280 then raise exception 'חסר טקסט'; end if;
  if coalesce(array_length(p_images, 1), 0) < 1 or array_length(p_images, 1) > 3 then
    raise exception 'צריך לפחות צילום מסך אחד';
  end if;
  if p_kind = 'squad' then
    if char_length(trim(coalesce(p_formation, ''))) < 1 then raise exception 'חסר מערך'; end if;
  elsif p_kind = 'pack' then
    if char_length(trim(coalesce(p_player, ''))) < 1 then raise exception 'חסר שם השחקן'; end if;
    if p_rarity not in ('regular', 'special', 'holographic') then raise exception 'בחרו סוג פריט'; end if;
  else
    raise exception 'סוג פוסט לא תקין';
  end if;
  insert into public.fut_posts (user_id, kind, formation, platform, body, player_name, pack_rarity, image_uris, status)
  values (
    v_user,
    p_kind,
    case when p_kind = 'squad' then trim(p_formation) else null end,
    p_platform,
    trim(p_body),
    case when p_kind = 'pack' then trim(p_player) else null end,
    case when p_kind = 'pack' then p_rarity else null end,
    p_images,
    'approved'
  )
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.rate_fut(p_post uuid, p_fit integer, p_fun integer, p_creativity integer)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_author uuid;
  v_exists boolean;
begin
  if v_user is null then raise exception 'צריך להתחבר'; end if;
  if p_fit not between 1 and 5 or p_fun not between 1 and 5 or p_creativity not between 1 and 5 then
    raise exception 'הדירוג הוא בין 1 ל-5';
  end if;
  select user_id into v_author from public.fut_posts where id = p_post and kind = 'squad';
  if v_author is null then raise exception 'הקבוצה לא נמצאה'; end if;
  if v_author = v_user then raise exception 'אפשר לדרג קבוצות של אחרים'; end if;
  select exists(select 1 from public.fut_ratings where post_id = p_post and user_id = v_user) into v_exists;
  if v_exists then
    update public.fut_ratings set fit = p_fit, fun = p_fun, creativity = p_creativity
    where post_id = p_post and user_id = v_user;
  else
    insert into public.fut_ratings (post_id, user_id, fit, fun, creativity)
    values (p_post, v_user, p_fit, p_fun, p_creativity);
    perform public.bump_profile(v_author, 0, 1);
  end if;
end;
$$;

create or replace function public.add_comment(p_target_type text, p_target uuid, p_preset text, p_body text)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_body text := trim(coalesce(p_body, ''));
  v_status text;
begin
  if v_user is null then raise exception 'צריך להתחבר'; end if;
  if char_length(v_body) > 120 then raise exception 'תגובה יכולה להכיל עד 120 תווים'; end if;
  if char_length(v_body) = 0 and p_preset is null then raise exception 'בחרו תגובה או כתבו משפט קצר'; end if;
  if p_preset is not null and p_preset not in ('respect', 'nice', 'smart', 'funny') then
    raise exception 'תגובה לא תקינה';
  end if;
  if p_target_type = 'fut_post' then
    if not exists (select 1 from public.fut_posts where id = p_target and status = 'approved') then
      raise exception 'הפוסט לא נמצא';
    end if;
  elsif p_target_type = 'career_submission' then
    if not exists (select 1 from public.career_submissions where id = p_target and status = 'approved') then
      raise exception 'הפוסט לא נמצא';
    end if;
  elsif p_target_type = 'sbc_solution' then
    if not exists (select 1 from public.sbc_solutions where id = p_target and status = 'approved') then
      raise exception 'הפוסט לא נמצא';
    end if;
  else
    raise exception 'יעד לא תקין';
  end if;
  v_status := case when public.comment_is_blocked(v_body) then 'hidden_pending' else 'visible' end;
  insert into public.comments (target_type, target_id, user_id, preset, body, status)
  values (p_target_type, p_target, v_user, p_preset, v_body, v_status);
  return case when v_status = 'hidden_pending' then 'held' else 'visible' end;
end;
$$;

create or replace function public.report_comment(p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_author uuid;
begin
  if v_user is null then raise exception 'צריך להתחבר'; end if;
  select user_id into v_author from public.comments where id = p_id;
  if v_author is null then raise exception 'התגובה לא נמצאה'; end if;
  if v_author = v_user then raise exception 'אי אפשר לדווח על תגובה של עצמך'; end if;
  insert into public.reports (comment_id, reporter_id) values (p_id, v_user)
  on conflict (comment_id, reporter_id) do nothing;
  update public.comments set status = 'hidden_pending' where id = p_id;
end;
$$;

create or replace function public.moderate_comment(p_id uuid, p_action text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.assert_admin();
  if p_action = 'remove' then
    delete from public.comments where id = p_id;
  elsif p_action = 'visible' then
    update public.comments set status = 'visible' where id = p_id;
  else
    raise exception 'פעולה לא תקינה';
  end if;
end;
$$;

create or replace function public.create_grounds_post(
  p_intent text,
  p_platform text,
  p_position text,
  p_division text,
  p_skill integer,
  p_archetype text,
  p_region text,
  p_hours text,
  p_contact_type text,
  p_contact_value text,
  p_level_image text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
begin
  if v_user is null then raise exception 'צריך להתחבר'; end if;
  if p_intent not in ('need_player', 'looking_for_club') then raise exception 'סוג מודעה לא תקין'; end if;
  if p_platform not in ('ps5', 'xbox', 'pc', 'switch2') then raise exception 'פלטפורמה לא תקינה'; end if;
  if p_division not in ('10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'elite') then raise exception 'חלוקה לא תקינה'; end if;
  if p_contact_type not in ('whatsapp', 'discord') then raise exception 'אמצעי קשר לא תקין'; end if;
  if p_skill is not null and (p_skill < 1 or p_skill > 5000) then raise exception 'Skill Rating צריך להיות מספר בין 1 ל-5000'; end if;
  if char_length(trim(p_position)) < 1 or char_length(trim(p_archetype)) < 1 or char_length(trim(p_region)) < 1
     or char_length(trim(p_hours)) < 1 or char_length(trim(p_contact_value)) < 1 then
    raise exception 'חסרים פרטי חיפוש';
  end if;
  insert into public.grounds_posts (
    user_id, intent, platform, position, division, skill_rating, archetype, region, hours,
    contact_type, contact_value, level_image_uri, level_verified, level_status
  ) values (
    v_user, p_intent, p_platform, trim(p_position), p_division, p_skill, trim(p_archetype), trim(p_region), trim(p_hours),
    p_contact_type, trim(p_contact_value), nullif(trim(coalesce(p_level_image, '')), ''), false,
    case when nullif(trim(coalesce(p_level_image, '')), '') is null then 'rejected' else 'pending' end
  ) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.moderate_grounds_level(p_id uuid, p_verified boolean)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_image text;
begin
  perform public.assert_admin();
  select level_image_uri into v_image from public.grounds_posts where id = p_id;
  if not found then raise exception 'המודעה לא נמצאה'; end if;
  if v_image is null then raise exception 'אין צילום רמה לאישור'; end if;
  update public.grounds_posts
  set level_verified = p_verified,
      level_status = case when p_verified then 'approved' else 'rejected' end
  where id = p_id;
end;
$$;

create or replace function public.create_sbc_challenge(
  p_title text, p_kind text, p_requirements text, p_ends timestamptz, p_target integer
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_admin uuid := public.assert_admin();
  v_id uuid;
begin
  if p_kind not in ('streamlined', 'classic') then raise exception 'סוג SBC לא תקין'; end if;
  if char_length(trim(p_title)) < 1 or char_length(trim(p_requirements)) < 1 then raise exception 'חסרים פרטי SBC'; end if;
  if p_kind = 'streamlined' and (p_target is null or p_target < 1 or p_target > 20000) then
    raise exception 'יעד הניקוד צריך להיות מספר בין 1 ל-20000';
  end if;
  insert into public.sbc_challenges (title, kind, requirements, ends_at, created_by, target_score)
  values (trim(p_title), p_kind, trim(p_requirements), p_ends, v_admin, case when p_kind = 'streamlined' then p_target else null end)
  returning id into v_id;
  return v_id;
end;
$$;

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

  -- Resolve by UUID or by catalog_key (official SBC ids like sbc-mm-celtic).
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

create or replace function public.mark_sbc_worked(p_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_author uuid;
  v_count integer;
begin
  if v_user is null then raise exception 'צריך להתחבר'; end if;
  select user_id into v_author from public.sbc_solutions where id = p_id and status = 'approved';
  if v_author is null then raise exception 'הפתרון לא נמצא'; end if;
  if v_author = v_user then raise exception 'אי אפשר לסמן פתרון של עצמך'; end if;
  insert into public.sbc_worked (solution_id, user_id) values (p_id, v_user)
  on conflict do nothing;
  get diagnostics v_count = row_count;
  if v_count > 0 then
    perform public.bump_profile(v_author, 0, 2);
  end if;
end;
$$;

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

revoke all on function public.bump_profile(uuid, integer, integer) from public, anon, authenticated;
revoke all on function public.assert_admin() from public, anon, authenticated;
revoke all on function public.comment_is_blocked(text) from public, anon, authenticated;
revoke all on function public.protect_profile() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

grant execute on function public.create_career_challenge(text, text, text, text, text, timestamptz) to authenticated;
grant execute on function public.submit_career(uuid, text, text, text[]) to authenticated;
grant execute on function public.moderate_career(uuid, text) to authenticated;
grant execute on function public.create_fut_post(text, text, text, text, text, text, text[]) to authenticated;
grant execute on function public.rate_fut(uuid, integer, integer, integer) to authenticated;
grant execute on function public.add_comment(text, uuid, text, text) to authenticated;
grant execute on function public.report_comment(uuid) to authenticated;
grant execute on function public.moderate_comment(uuid, text) to authenticated;
grant execute on function public.create_grounds_post(text, text, text, text, integer, text, text, text, text, text, text) to authenticated;
grant execute on function public.moderate_grounds_level(uuid, boolean) to authenticated;
grant execute on function public.create_sbc_challenge(text, text, text, timestamptz, integer) to authenticated;
grant execute on function public.add_sbc_solution(text, text, text[], text, text, text, timestamptz, integer) to authenticated;
grant execute on function public.mark_sbc_worked(uuid) to authenticated;
grant execute on function public.vote_sbc_solution(uuid, text) to authenticated;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (true);

drop policy if exists challenges_read on public.career_challenges;
create policy challenges_read on public.career_challenges for select to authenticated using (true);

drop policy if exists submissions_read on public.career_submissions;
create policy submissions_read on public.career_submissions for select to authenticated using (
  status = 'approved'
  or user_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

drop policy if exists fut_read on public.fut_posts;
create policy fut_read on public.fut_posts for select to authenticated using (true);

drop policy if exists ratings_read on public.fut_ratings;
create policy ratings_read on public.fut_ratings for select to authenticated using (true);

drop policy if exists comments_read on public.comments;
create policy comments_read on public.comments for select to authenticated using (
  status = 'visible'
  or user_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

drop policy if exists grounds_read on public.grounds_posts;
create policy grounds_read on public.grounds_posts for select to authenticated using (true);

drop policy if exists sbc_read on public.sbc_challenges;
create policy sbc_read on public.sbc_challenges for select to authenticated using (true);

drop policy if exists solutions_read on public.sbc_solutions;
create policy solutions_read on public.sbc_solutions for select to authenticated using (true);

drop policy if exists worked_read on public.sbc_worked;
create policy worked_read on public.sbc_worked for select to authenticated using (true);

drop policy if exists failed_read on public.sbc_failed;
create policy failed_read on public.sbc_failed for select to authenticated using (true);

drop policy if exists reports_read on public.reports;
create policy reports_read on public.reports for select to authenticated using (
  reporter_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

revoke insert, update, delete on all tables in schema public from anon, authenticated;
grant select on all tables in schema public to authenticated;

insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', true)
on conflict (id) do nothing;

drop policy if exists proofs_read on storage.objects;
create policy proofs_read on storage.objects for select to public using (bucket_id = 'proofs');

drop policy if exists proofs_insert on storage.objects;
create policy proofs_insert on storage.objects for insert to authenticated
with check (bucket_id = 'proofs' and (storage.foldername(name))[1] = auth.uid()::text);

create table if not exists public.player_votes (
  player_id text not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  vote smallint not null check (vote in (-1, 1)),
  primary key (player_id, user_id)
);

create table if not exists public.player_comments (
  id uuid primary key default gen_random_uuid(),
  player_id text not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  status text not null default 'visible' check (status in ('visible', 'hidden_pending')),
  created_at timestamptz not null default now()
);

create table if not exists public.player_comment_votes (
  comment_id uuid not null references public.player_comments (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  vote smallint not null check (vote in (-1, 1)),
  primary key (comment_id, user_id)
);

alter table public.player_votes enable row level security;
alter table public.player_comments enable row level security;
alter table public.player_comment_votes enable row level security;

grant select on public.player_votes, public.player_comments, public.player_comment_votes to authenticated;

drop policy if exists player_votes_read on public.player_votes;
create policy player_votes_read on public.player_votes for select to authenticated using (true);
drop policy if exists player_votes_write on public.player_votes;
create policy player_votes_write on public.player_votes for insert to authenticated with check (user_id = auth.uid());
drop policy if exists player_votes_remove on public.player_votes;
create policy player_votes_remove on public.player_votes for delete to authenticated using (user_id = auth.uid());
grant insert, delete on public.player_votes to authenticated;
drop policy if exists player_comments_read on public.player_comments;
create policy player_comments_read on public.player_comments for select to authenticated using (
  status = 'visible' or user_id = auth.uid()
);
drop policy if exists player_comment_votes_read on public.player_comment_votes;
create policy player_comment_votes_read on public.player_comment_votes for select to authenticated using (true);

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

create or replace function public.save_profile_avatar(p_url text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then raise exception 'צריך להתחבר'; end if;
  if p_url is null or p_url !~ '^https?://' then return; end if;
  perform set_config('app.trusted', '1', true);
  update public.profiles set avatar_url = left(p_url, 500) where id = v_user;
end;
$$;

grant execute on function public.save_profile_avatar(text) to authenticated;

alter table public.profiles add column if not exists squad jsonb;

create or replace function public.save_profile_squad(p_squad jsonb)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_formation text;
begin
  if v_user is null then raise exception 'צריך להתחבר'; end if;
  if p_squad is null or jsonb_typeof(p_squad) <> 'object' then
    raise exception 'הסגל לא תקין';
  end if;
  v_formation := p_squad->>'formation';
  if v_formation is null or v_formation !~ '^[0-9]{2,5}(-[0-9])?$' then
    raise exception 'מערך לא נתמך';
  end if;
  perform set_config('app.trusted', '1', true);
  update public.profiles set squad = p_squad where id = v_user;
end;
$$;

grant execute on function public.save_profile_squad(jsonb) to authenticated;

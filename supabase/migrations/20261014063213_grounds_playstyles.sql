alter table public.grounds_posts
  add column if not exists player_level integer,
  add column if not exists play_styles jsonb not null default '[]'::jsonb;

update public.grounds_posts
set player_level = skill_rating,
    skill_rating = null
where player_level is null
  and skill_rating between 1 and 50;

create or replace function public.create_grounds_post(
  p_intent text,
  p_platform text,
  p_position text,
  p_division text,
  p_skill integer,
  p_player_level integer,
  p_archetype text,
  p_region text,
  p_hours text,
  p_contact_type text,
  p_contact_value text,
  p_level_image text,
  p_play_styles jsonb
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_id uuid;
  v_allowed_ids text[] := array[
    'acrobatic', 'chip-shot', 'dead-ball', 'finesse-shot', 'gamechanger', 'low-driven-shot', 'power-shot', 'precision-header',
    'incisive-pass', 'inventive', 'long-ball-pass', 'pinged-pass', 'tiki-taka', 'whipped-pass',
    'first-touch', 'press-proven', 'rapid', 'technical', 'trickster',
    'aerial-fortress', 'anticipate', 'block', 'intercept', 'jockey', 'slide-tackle',
    'bruiser', 'enforcer', 'long-throw', 'quick-step', 'relentless',
    '1v1-close-down', 'cross-claimer', 'deflector', 'far-reach', 'far-throw', 'footwork'
  ];
begin
  if v_user is null then raise exception 'צריך להתחבר'; end if;
  if p_intent not in ('need_player', 'looking_for_club') then raise exception 'סוג מודעה לא תקין'; end if;
  if p_platform not in ('ps5', 'xbox', 'pc', 'switch2') then raise exception 'פלטפורמה לא תקינה'; end if;
  if p_division not in ('10', '9', '8', '7', '6', '5', '4', '3', '2', '1', 'elite') then raise exception 'חלוקה לא תקינה'; end if;
  if p_contact_type not in ('whatsapp', 'discord') then raise exception 'אמצעי קשר לא תקין'; end if;
  if p_skill is not null and (p_skill < 1 or p_skill > 5000) then raise exception 'Skill Rating צריך להיות מספר בין 1 ל-5000'; end if;
  if p_player_level is null or p_player_level < 1 or p_player_level > 50 then raise exception 'רמת ארכיטיפ צריכה להיות בין 1 ל-50'; end if;
  if char_length(trim(p_position)) < 1 or char_length(trim(p_archetype)) < 1 or char_length(trim(p_region)) < 1
     or char_length(trim(p_hours)) < 1 or char_length(trim(p_contact_value)) < 1 then
    raise exception 'חסרים פרטי חיפוש';
  end if;
  if p_play_styles is null or jsonb_typeof(p_play_styles) <> 'array' or jsonb_array_length(p_play_styles) > 36 then
    raise exception 'רשימת PlayStyles לא תקינה';
  end if;
  if exists (
    select 1
    from jsonb_array_elements(p_play_styles) as item(value)
    where jsonb_typeof(item.value) <> 'object'
       or coalesce(item.value->>'id', '') <> all(v_allowed_ids)
       or coalesce(item.value->>'tier', '') not in ('base', 'plus')
  ) then
    raise exception 'רשימת PlayStyles לא תקינה';
  end if;
  if (select count(*) from jsonb_array_elements(p_play_styles)) <>
     (select count(distinct item.value->>'id') from jsonb_array_elements(p_play_styles) as item(value)) then
    raise exception 'PlayStyle כפול ברשימה';
  end if;

  insert into public.grounds_posts (
    user_id, intent, platform, position, division, skill_rating, player_level, archetype, region, hours,
    contact_type, contact_value, level_image_uri, play_styles, level_verified, level_status
  ) values (
    v_user, p_intent, p_platform, trim(p_position), p_division, p_skill, p_player_level, trim(p_archetype), trim(p_region), trim(p_hours),
    p_contact_type, trim(p_contact_value), nullif(trim(coalesce(p_level_image, '')), ''), p_play_styles, false,
    case when nullif(trim(coalesce(p_level_image, '')), '') is null then 'rejected' else 'pending' end
  ) returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.create_grounds_post(text, text, text, text, integer, integer, text, text, text, text, text, text, jsonb) from public, anon;
grant execute on function public.create_grounds_post(text, text, text, text, integer, integer, text, text, text, text, text, text, jsonb) to authenticated;

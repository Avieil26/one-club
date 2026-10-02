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

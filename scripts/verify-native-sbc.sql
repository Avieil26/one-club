-- All fixtures and their votes are rolled back inside a PL/pgSQL subtransaction.
do $$
declare
  author_id uuid := gen_random_uuid();
  voter_id uuid := gen_random_uuid();
  challenge_id uuid := gen_random_uuid();
  fixture_solution uuid := gen_random_uuid();
  verified boolean := false;
  denied boolean;
begin
  begin
    insert into auth.users(id, aud, role, email, raw_user_meta_data, created_at, updated_at)
      values (author_id,'authenticated','authenticated',author_id::text || '@example.invalid','{"display_name":"Rollback QA author"}',now(),now()),
             (voter_id,'authenticated','authenticated',voter_id::text || '@example.invalid','{"display_name":"Rollback QA voter"}',now(),now());
    insert into public.profiles(id,display_name) values (author_id,'Rollback QA author'),(voter_id,'Rollback QA voter') on conflict do nothing;
    insert into public.sbc_challenges(id,title,kind,requirements,created_by) values (challenge_id,'Rollback QA challenge','classic','Fixture only',author_id);
    insert into public.sbc_solutions(id,challenge_id,user_id,explanation,image_uris,status) values (fixture_solution,challenge_id,author_id,'Rollback QA fixture',array['https://example.invalid/fixture.jpg'],'approved');
    perform set_config('request.jwt.claim.sub',voter_id::text,true);
    set local role authenticated;
    perform public.vote_sbc_solution(fixture_solution,'down');
    perform public.vote_sbc_solution(fixture_solution,'down');
    if (select count(*) from public.sbc_failed where solution_id=fixture_solution and user_id=voter_id) <> 1 then raise exception 'Down vote not idempotent'; end if;
    perform public.vote_sbc_solution(fixture_solution,'up');
    perform public.vote_sbc_solution(fixture_solution,'up');
    if exists(select 1 from public.sbc_failed f where f.solution_id=fixture_solution) then raise exception 'Opposite vote not cleared'; end if;
    if (select reputation from public.profiles where id=author_id) <> 2 then raise exception 'Repeated up vote changed reputation'; end if;
    perform public.vote_sbc_solution(fixture_solution,'down');
    if (select reputation from public.profiles where id=author_id) <> 0 then raise exception 'Reputation did not follow current vote'; end if;
    perform public.vote_sbc_solution(fixture_solution,'clear');
    if exists(select 1 from public.sbc_failed f where f.solution_id=fixture_solution) or exists(select 1 from public.sbc_worked w where w.solution_id=fixture_solution) then raise exception 'Clear failed'; end if;
    denied:=false;
    begin
      perform set_config('request.jwt.claim.sub',author_id::text,true);
      perform public.vote_sbc_solution(fixture_solution,'down');
    exception when raise_exception then denied:=true;
    end;
    if not denied then raise exception 'Self vote was accepted'; end if;
    denied:=false;
    begin
      perform set_config('request.jwt.claim.sub','',true);
      perform public.vote_sbc_solution(fixture_solution,'down');
    exception when raise_exception then denied:=true;
    end;
    if not denied then raise exception 'Unauthenticated vote was accepted'; end if;
    verified:=true;
    raise sqlstate 'P9999';
  exception when sqlstate 'P9999' then null;
  end;
  perform set_config('fc27.qa_result',json_build_object('success',verified,'fixtures_remaining',(select count(*) from auth.users where id in (author_id,voter_id)),'checks','down/up/clear, idempotency, reputation, self/anonymous rejection; all fixture changes rolled back')::text,false);
end;
$$;
select current_setting('fc27.qa_result') as result;

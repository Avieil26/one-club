begin;
do $$
declare
 author_id uuid:=gen_random_uuid(); admin_id uuid:=gen_random_uuid(); other_id uuid:=gen_random_uuid();
 solution uuid; forged uuid; denied boolean; n integer; ids integer[]; proof text;
begin
 insert into auth.users(id,aud,role,email,raw_user_meta_data,created_at,updated_at)
 select id,'authenticated','authenticated',id::text||'@example.invalid','{"display_name":"Rollback Gallery QA"}'::jsonb,now(),now() from unnest(array[author_id,admin_id,other_id]) id;
 insert into public.profiles(id,display_name) values(author_id,'Rollback Gallery author'),(admin_id,'Rollback Gallery admin'),(other_id,'Rollback Gallery outsider') on conflict do nothing;
 perform set_config('app.trusted','1',true); update public.profiles set is_admin=true where id=admin_id; perform set_config('app.trusted','',true);
 select eligible_ids[1:5] into ids from public.gallery_set_rules where id=116;
 proof:=author_id::text||'/gallery-test.jpg';
 insert into storage.objects(bucket_id,name) values('gallery-proofs',proof);
 perform set_config('request.jwt.claim.sub',author_id::text,true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',author_id,'role','authenticated','is_anonymous',false)::text,true);
 set local role authenticated;
 insert into public.gallery_solutions(set_id,user_id,title,note,item_ids,claimed_grade,game_score,proof_paths,status,reviewed_by,reviewed_at)
 values(116,author_id,'Review fixture','Proof fixture',ids,'S',2000,array[proof],'approved',author_id,now()) returning id into solution;
 if not exists(select 1 from public.gallery_solutions where id=solution and status='pending' and reviewed_by is null and reviewed_at is null) then raise exception 'Client forged approval'; end if;
 denied:=false; begin perform public.moderate_gallery_solution(solution,'approved'); exception when raise_exception then denied:=true; end;
 if not denied then raise exception 'Self approval permitted'; end if;
 denied:=false; begin update public.gallery_solutions set status='approved' where id=solution;get diagnostics n=row_count;denied:=n=0;exception when insufficient_privilege then denied:=true;end;
 if not denied then raise exception 'Direct approval permitted';end if;
 denied:=false;begin insert into public.gallery_solutions(set_id,user_id,title,note,item_ids,claimed_grade,game_score,proof_paths) values(116,author_id,'Duplicate','Duplicate',array[ids[1],ids[1],ids[2],ids[3],ids[4]],'S',2000,array[proof]);exception when raise_exception then denied:=true;end;
 if not denied then raise exception 'Duplicate item accepted';end if;
 denied:=false;begin insert into public.gallery_solutions(set_id,user_id,title,note,item_ids,claimed_grade,game_score,proof_paths) values(116,author_id,'Incomplete','Incomplete',ids[1:4],'S',2000,array[proof]);exception when raise_exception then denied:=true;end;
 if not denied then raise exception 'Incomplete set accepted';end if;
 perform set_config('request.jwt.claim.sub',other_id::text,true);
 if exists(select 1 from public.gallery_solutions where id=solution) then raise exception 'Pending solution leaked';end if;
 if exists(select 1 from storage.objects where bucket_id='gallery-proofs' and name=proof) then raise exception 'Private proof leaked';end if;
 perform set_config('request.jwt.claim.sub','',true);perform set_config('request.jwt.claims','{"role":"anon"}',true);set local role anon;
 if exists(select 1 from public.gallery_solutions where id=solution) then raise exception 'Pending solution leaked to guest';end if;
 reset role;perform set_config('request.jwt.claim.sub',admin_id::text,true);set local role authenticated;
 if not exists(select 1 from public.gallery_solutions where id=solution) then raise exception 'Admin cannot review';end if;
 if not exists(select 1 from storage.objects where name=proof and bucket_id='gallery-proofs') then raise exception 'Admin cannot see proof';end if;
 perform public.moderate_gallery_solution(solution,'approved');
 if not exists(select 1 from public.gallery_solutions where id=solution and reviewed_by=admin_id and reviewed_at is not null and status='approved') then raise exception 'Missing approval audit';end if;
 reset role;perform set_config('request.jwt.claim.sub','',true);perform set_config('request.jwt.claims','{"role":"anon"}',true);set local role anon;
 if not exists(select 1 from public.gallery_solutions where id=solution) then raise exception 'Approved solution hidden';end if;
 if not exists(select 1 from storage.objects where name=proof and bucket_id='gallery-proofs') then raise exception 'Approved proof hidden';end if;
 reset role;perform set_config('request.jwt.claim.sub',admin_id::text,true);set local role authenticated;
 perform public.moderate_gallery_solution(solution,'rejected');perform public.moderate_gallery_solution(solution,'rejected');
 reset role;perform set_config('request.jwt.claim.sub',other_id::text,true);set local role authenticated;
 if exists(select 1 from public.gallery_solutions where id=solution) then raise exception 'Rejected solution leaked';end if;
 if exists(select 1 from storage.objects where name=proof and bucket_id='gallery-proofs') then raise exception 'Rejected proof leaked';end if;
 reset role;
 if (select reputation from public.profiles where id=author_id)<>0 then raise exception 'Upload awarded reputation';end if;
end;
$$;
rollback;
select 'Gallery review, proof privacy, duplicate protection and administrator audit passed; all fixtures rolled back.' as verification;

begin;
select set_config('career.test_user',(select id::text from auth.users order by created_at limit 1),true) is not null;
select set_config('career.other_user',(select id::text from auth.users where id::text<>current_setting('career.test_user') order by created_at limit 1),true) is not null;
select set_config('request.jwt.claim.sub',current_setting('career.test_user'),true) is not null;
set local role authenticated;
insert into career_library.stage_progress values(auth.uid(),'data-analyst-stage-1',now()) on conflict do nothing;
select set_config('career.owner_read',(select count(*)::text from career_library.stage_progress where stage_id='data-analyst-stage-1'),true) is not null;
do $$ begin
 begin insert into career_library.stage_progress values(current_setting('career.other_user')::uuid,'data-analyst-stage-1',now());
 exception when insufficient_privilege then perform set_config('career.cross_insert_denied','true',true); end;
 begin update career_library.stage_progress set user_id=current_setting('career.other_user')::uuid where stage_id='data-analyst-stage-1';
 exception when insufficient_privilege then perform set_config('career.reassignment_denied','true',true); end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('career.other_user'),true) is not null;
delete from career_library.stage_progress where user_id=current_setting('career.test_user')::uuid;
select set_config('career.cross_read',(select count(*)::text from career_library.stage_progress where user_id=current_setting('career.test_user')::uuid),true) is not null;
select set_config('request.jwt.claim.sub',current_setting('career.test_user'),true) is not null;
select jsonb_build_object('owner_read',current_setting('career.owner_read'),'cross_insert_denied',current_setting('career.cross_insert_denied'),'reassignment_denied',current_setting('career.reassignment_denied'),'cross_read',current_setting('career.cross_read'),'owner_survived_cross_delete',(select count(*) from career_library.stage_progress where stage_id='data-analyst-stage-1'),'editor_write_denied',not has_table_privilege('authenticated','career_library.careers','UPDATE'),'editor_function_denied',not has_function_privilege('authenticated','career_library.save_career(jsonb)','EXECUTE')) as tests;
do $assert$ begin
 if current_setting('career.owner_read')<>'1' or current_setting('career.cross_read')<>'0' or current_setting('career.cross_insert_denied')<>'true' or current_setting('career.reassignment_denied')<>'true'
 or (select count(*) from career_library.stage_progress where stage_id='data-analyst-stage-1')<>1
 or has_table_privilege('authenticated','career_library.careers','UPDATE')
 or has_function_privilege('authenticated','career_library.save_career(jsonb)','EXECUTE')
 then raise exception 'RLS verification failed'; end if;
end $assert$;
rollback;
select 'PASS: owner persistence, cross-user read/write/delete, reassignment and editorial denials; changes rolled back' as result;
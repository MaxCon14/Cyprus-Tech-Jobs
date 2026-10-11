create function career_library.career_document(cs text) returns jsonb language sql stable security invoker set search_path=career_library,pg_catalog as $$
select (to_jsonb(c)-'weekly_hours'-'entry_titles'-'job_terms'-'seo_title'-'seo_description'-'updated_at') ||
jsonb_build_object('weeklyHours',c.weekly_hours,'entryTitles',c.entry_titles,'jobTerms',c.job_terms,'seoTitle',c.seo_title,'seoDescription',c.seo_description,'updatedAt',c.updated_at,
'skills',coalesce((select jsonb_agg(skill_name order by position) from career_skills where career_slug=cs),'[]'),
'stages',coalesce((select jsonb_agg((to_jsonb(s)-'career_slug')||jsonb_build_object(
'tasks',coalesce((select jsonb_agg(to_jsonb(t)-'stage_id' order by t.position) from tasks t where t.stage_id=s.id),'[]'),
'resourceIds',coalesce((select jsonb_agg(resource_id order by position) from stage_resources where stage_id=s.id),'[]')) order by s.position) from stages s where s.career_slug=cs),'[]'),
'resources',coalesce((select jsonb_agg((to_jsonb(r)-'verified_at')||jsonb_build_object('verifiedAt',r.verified_at) order by r.name) from resources r where exists(select 1 from stage_resources sr join stages s on s.id=sr.stage_id where sr.resource_id=r.id and s.career_slug=cs)),'[]'),
'projects',coalesce((select jsonb_agg((to_jsonb(p)-'career_slug'-'starter_resource_id')||jsonb_build_object(
'starterResourceId',p.starter_resource_id,'requirements',coalesce((select jsonb_agg(label order by position) from project_requirements where project_id=p.id),'[]')) order by p.position) from projects p where p.career_slug=cs),'[]'),
'readiness',coalesce((select jsonb_agg(to_jsonb(r)-'career_slug' order by position) from readiness r where career_slug=cs),'[]'))
from careers c where c.slug=cs;
$$;
revoke all on function career_library.career_document(text) from public;
grant execute on function career_library.career_document(text) to anon,authenticated,service_role;
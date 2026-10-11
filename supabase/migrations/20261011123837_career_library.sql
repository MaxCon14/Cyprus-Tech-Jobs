-- Additive, isolated feature schema. Existing public tables are not changed.
create schema if not exists career_library;
revoke all on schema career_library from public;
grant usage on schema career_library to anon, authenticated, service_role;

create table career_library.categories (name text primary key);
create table career_library.skills (name text primary key);
create table career_library.careers (
 slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 title text not null, category text not null references career_library.categories(name),
 difficulty text not null check (difficulty in ('Beginner','Intermediate','Advanced')),
 duration text not null, weekly_hours text not null,
 description text not null, overview text not null,
 entry_titles text[] not null default '{}', job_terms text[] not null default '{}',
 seo_title text not null, seo_description text not null,
 published boolean not null default false,
 updated_at timestamptz not null default now()
);
create index careers_published_category on career_library.careers(published,category);
create table career_library.career_skills (
 career_slug text not null references career_library.careers(slug) on delete cascade,
 skill_name text not null references career_library.skills(name),
 position int not null check(position>0), primary key(career_slug,skill_name)
);
create table career_library.resources (
 id text primary key, name text not null, provider text not null,
 url text not null check(url ~ '^https://'),
 description text not null,
 type text not null check(type in ('Course','Tutorial','Documentation','Practice','Certification')),
 access text not null check(access in ('Free','Freemium','Paid')),
 difficulty text not null check(difficulty in ('Beginner','Intermediate','Advanced')),
 duration text, verified_at date
);
create table career_library.stages (
 id text primary key, career_slug text not null references career_library.careers(slug) on delete cascade,
 position int not null check(position>0), title text not null, duration text not null,
 difficulty text not null check(difficulty in ('Beginner','Intermediate','Advanced')),
 description text not null, skills text[] not null, exercise text not null, milestone text not null,
 unique(career_slug,id)
);
create index stages_career_order on career_library.stages(career_slug,position);
create table career_library.tasks (
 id text primary key, stage_id text not null references career_library.stages(id) on delete cascade,
 position int not null check(position>0), label text not null
);
create index tasks_stage on career_library.tasks(stage_id,position);
create table career_library.stage_resources (
 stage_id text not null references career_library.stages(id) on delete cascade,
 resource_id text not null references career_library.resources(id),
 position int not null check(position>0), primary key(stage_id,resource_id)
);
create index resource_stage_reverse on career_library.stage_resources(resource_id);
create table career_library.projects (
 id text primary key, career_slug text not null references career_library.careers(slug) on delete cascade,
 position int not null check(position>0), title text not null, difficulty text not null,
 duration text not null, overview text not null, problem text not null,
 tools text[] not null, deliverables text[] not null, skills text[] not null,
 starter_resource_id text references career_library.resources(id), presentation text not null
);
create index projects_career on career_library.projects(career_slug,position);
create table career_library.project_requirements (
 project_id text not null references career_library.projects(id) on delete cascade,
 position int not null check(position>0), label text not null, primary key(project_id,position)
);
create table career_library.readiness (
 id text primary key, career_slug text not null references career_library.careers(slug) on delete cascade,
 position int not null check(position>0), label text not null
);
create index readiness_career on career_library.readiness(career_slug,position);
create table career_library.saved_careers (
 user_id uuid not null references auth.users(id) on delete cascade,
 career_slug text not null references career_library.careers(slug) on delete cascade,
 updated_at timestamptz not null default now(), primary key(user_id,career_slug)
);
create table career_library.stage_progress (
 user_id uuid not null references auth.users(id) on delete cascade,
 stage_id text not null references career_library.stages(id) on delete cascade,
 updated_at timestamptz not null default now(), primary key(user_id,stage_id)
);
create index stage_progress_subject on career_library.stage_progress(stage_id);
create table career_library.task_progress (
 user_id uuid not null references auth.users(id) on delete cascade,
 task_id text not null references career_library.tasks(id) on delete cascade,
 updated_at timestamptz not null default now(), primary key(user_id,task_id)
);
create index task_progress_subject on career_library.task_progress(task_id);
create table career_library.readiness_progress (
 user_id uuid not null references auth.users(id) on delete cascade,
 readiness_id text not null references career_library.readiness(id) on delete cascade,
 updated_at timestamptz not null default now(), primary key(user_id,readiness_id)
);
create index readiness_progress_subject on career_library.readiness_progress(readiness_id);

-- Public reads are limited to published content; there are no public editorial writes.
alter table career_library.careers enable row level security;
create policy published on career_library.careers for select to anon,authenticated using(published);
alter table career_library.categories enable row level security;
create policy published on career_library.categories for select to anon,authenticated using(exists(select 1 from career_library.careers c where c.category=name and c.published));
alter table career_library.skills enable row level security;
create policy published on career_library.skills for select to anon,authenticated using(exists(select 1 from career_library.career_skills cs join career_library.careers c on c.slug=cs.career_slug where cs.skill_name=name and c.published));
alter table career_library.career_skills enable row level security;
create policy published on career_library.career_skills for select to anon,authenticated using(exists(select 1 from career_library.careers c where c.slug=career_slug and c.published));
alter table career_library.stages enable row level security;
create policy published on career_library.stages for select to anon,authenticated using(exists(select 1 from career_library.careers c where c.slug=career_slug and c.published));
alter table career_library.tasks enable row level security;
create policy published on career_library.tasks for select to anon,authenticated using(exists(select 1 from career_library.stages s join career_library.careers c on c.slug=s.career_slug where s.id=stage_id and c.published));
alter table career_library.stage_resources enable row level security;
create policy published on career_library.stage_resources for select to anon,authenticated using(exists(select 1 from career_library.stages s join career_library.careers c on c.slug=s.career_slug where s.id=stage_id and c.published));
alter table career_library.resources enable row level security;
create policy published on career_library.resources for select to anon,authenticated using(exists(select 1 from career_library.stage_resources sr join career_library.stages s on s.id=sr.stage_id join career_library.careers c on c.slug=s.career_slug where sr.resource_id=resources.id and c.published));
alter table career_library.projects enable row level security;
create policy published on career_library.projects for select to anon,authenticated using(exists(select 1 from career_library.careers c where c.slug=career_slug and c.published));
alter table career_library.project_requirements enable row level security;
create policy published on career_library.project_requirements for select to anon,authenticated using(exists(select 1 from career_library.projects p join career_library.careers c on c.slug=p.career_slug where p.id=project_id and c.published));
alter table career_library.readiness enable row level security;
create policy published on career_library.readiness for select to anon,authenticated using(exists(select 1 from career_library.careers c where c.slug=career_slug and c.published));
do $$ declare t text; begin
 foreach t in array array['saved_careers','stage_progress','task_progress','readiness_progress'] loop
 execute format('alter table career_library.%I enable row level security',t);
 execute format('create policy own_read on career_library.%I for select to authenticated using ((select auth.uid())=user_id)',t);
 execute format('create policy own_insert on career_library.%I for insert to authenticated with check ((select auth.uid())=user_id)',t);
 execute format('create policy own_update on career_library.%I for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id)',t);
 execute format('create policy own_delete on career_library.%I for delete to authenticated using ((select auth.uid())=user_id)',t);
 end loop;
end $$;
revoke all on all tables in schema career_library from public, anon, authenticated;
grant select on career_library.categories,career_library.skills,career_library.careers,career_library.career_skills,career_library.resources,career_library.stages,career_library.tasks,career_library.stage_resources,career_library.projects,career_library.project_requirements,career_library.readiness to anon,authenticated;
grant select,insert,update,delete on career_library.saved_careers,career_library.stage_progress,career_library.task_progress,career_library.readiness_progress to authenticated;
grant all on all tables in schema career_library to service_role;

-- Atomic editorial operation, callable only by the trusted server database role.
-- Invoker privileges; no SECURITY DEFINER and no user-editable claims for admins.
create function career_library.save_career(p jsonb) returns void language plpgsql security invoker set search_path=career_library,pg_catalog as $$
declare s jsonb; t jsonb; r jsonb; q jsonb; v text; n int; cs text := p->>'slug';
begin
 insert into categories values(p->>'category') on conflict do nothing;
 insert into careers values(cs,p->>'title',p->>'category',p->>'difficulty',p->>'duration',p->>'weeklyHours',p->>'description',p->>'overview',
 array(select jsonb_array_elements_text(p->'entryTitles')),array(select jsonb_array_elements_text(p->'jobTerms')),p->>'seoTitle',p->>'seoDescription',(p->>'published')::boolean,now())
 on conflict(slug) do update set title=excluded.title,category=excluded.category,difficulty=excluded.difficulty,duration=excluded.duration,weekly_hours=excluded.weekly_hours,description=excluded.description,overview=excluded.overview,entry_titles=excluded.entry_titles,job_terms=excluded.job_terms,seo_title=excluded.seo_title,seo_description=excluded.seo_description,published=excluded.published,updated_at=now();
 delete from career_skills where career_slug=cs;
 n:=0;
 for v in select jsonb_array_elements_text(p->'skills') loop
 n:=n+1; insert into skills values(v) on conflict do nothing;
 insert into career_skills values(cs,v,n) on conflict do nothing;
 end loop;
 for r in select * from jsonb_array_elements(coalesce(p->'resources','[]')) loop
 insert into resources values(r->>'id',r->>'name',r->>'provider',r->>'url',r->>'description',r->>'type',r->>'access',r->>'difficulty',r->>'duration',nullif(r->>'verifiedAt','')::date)
 on conflict(id) do update set name=excluded.name,provider=excluded.provider,url=excluded.url,description=excluded.description,type=excluded.type,access=excluded.access,difficulty=excluded.difficulty,duration=excluded.duration,verified_at=excluded.verified_at;
 end loop;
 n:=0;
 for s in select * from jsonb_array_elements(p->'stages') loop
 n:=n+1;
 if exists(select 1 from stages where id=s->>'id' and career_slug<>cs) then raise exception 'Stage belongs to another career'; end if;
 insert into stages values(s->>'id',cs,n,s->>'title',s->>'duration',s->>'difficulty',s->>'description',array(select jsonb_array_elements_text(s->'skills')),s->>'exercise',s->>'milestone')
 on conflict(id) do update set position=excluded.position,title=excluded.title,duration=excluded.duration,difficulty=excluded.difficulty,description=excluded.description,skills=excluded.skills,exercise=excluded.exercise,milestone=excluded.milestone;
 for t in select * from jsonb_array_elements(s->'tasks') loop
 if exists(select 1 from tasks where id=t->>'id' and stage_id<>s->>'id') then raise exception 'Task belongs to another stage'; end if;
 insert into tasks values(t->>'id',s->>'id',(t->>'position')::int,t->>'label') on conflict(id) do update set position=excluded.position,label=excluded.label;
 end loop;
 delete from tasks where stage_id=s->>'id' and id not in(select x->>'id' from jsonb_array_elements(s->'tasks') x);
 delete from stage_resources where stage_id=s->>'id';
 declare k int:=0; begin
 for v in select jsonb_array_elements_text(s->'resourceIds') loop
 k:=k+1; insert into stage_resources values(s->>'id',v,k);
 end loop; end;
 end loop;
 delete from stages where career_slug=cs and id not in(select x->>'id' from jsonb_array_elements(p->'stages') x);
 n:=0;
 for q in select * from jsonb_array_elements(p->'projects') loop
 n:=n+1;
 if exists(select 1 from projects where id=q->>'id' and career_slug<>cs) then raise exception 'Project belongs to another career'; end if;
 insert into projects values(q->>'id',cs,n,q->>'title',q->>'difficulty',q->>'duration',q->>'overview',q->>'problem',array(select jsonb_array_elements_text(q->'tools')),array(select jsonb_array_elements_text(q->'deliverables')),array(select jsonb_array_elements_text(q->'skills')),q->>'starterResourceId',q->>'presentation')
 on conflict(id) do update set position=excluded.position,title=excluded.title,difficulty=excluded.difficulty,duration=excluded.duration,overview=excluded.overview,problem=excluded.problem,tools=excluded.tools,deliverables=excluded.deliverables,skills=excluded.skills,starter_resource_id=excluded.starter_resource_id,presentation=excluded.presentation;
 delete from project_requirements where project_id=q->>'id';
 declare k int:=0; begin
 for v in select jsonb_array_elements_text(q->'requirements') loop k:=k+1; insert into project_requirements values(q->>'id',k,v); end loop; end;
 end loop;
 delete from projects where career_slug=cs and id not in(select x->>'id' from jsonb_array_elements(p->'projects') x);
 for t in select * from jsonb_array_elements(p->'readiness') loop
 if exists(select 1 from readiness where id=t->>'id' and career_slug<>cs) then raise exception 'Checklist belongs to another career'; end if;
 insert into readiness values(t->>'id',cs,(t->>'position')::int,t->>'label') on conflict(id) do update set position=excluded.position,label=excluded.label;
 end loop;
 delete from readiness where career_slug=cs and id not in(select x->>'id' from jsonb_array_elements(p->'readiness') x);
end $$;
revoke all on function career_library.save_career(jsonb) from public,anon,authenticated,service_role;

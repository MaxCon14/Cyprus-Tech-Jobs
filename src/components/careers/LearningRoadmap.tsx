"use client";
import Link from "next/link";
import { ArrowUpRight, Bookmark, Check, ChevronDown } from "lucide-react";
import type { Career } from "@/lib/careers/types";
import { useCareerProgress } from "./useCareerProgress";
import { ResourceCard, ResourceLibrary } from "./ResourceLibrary";
export function LearningRoadmap({career, jobs}:{career:Career;jobs:React.ReactNode}){
 const p=useCareerProgress(career.slug);
 const completed=career.stages.filter(s=>p.progress.stages.includes(s.id)).length;
 const readiness=career.readiness.filter(r=>p.progress.readiness.includes(r.id)).length;
 const percentage=Math.round(completed/career.stages.length*100);
 const next=career.stages.find(s=>!p.progress.stages.includes(s.id));
 const disabled=!p.ready||p.busy;
 return <div className="cl-learning-layout">
  <aside className="cl-sidebar">
   <div className="cl-progress-panel">
    <p className="cl-eyebrow">Your learning journey</p><strong className="cl-progress-value">{percentage}<span>%</span></strong>
    <progress value={completed} max={career.stages.length} aria-label="Roadmap completion"/>
    <p>{completed} of {career.stages.length} stages completed</p>
    <button type="button" className={"btn "+(p.progress.saved?"btn-primary":"btn-outline")} disabled={disabled} onClick={()=>void p.change("saved",career.slug,!p.progress.saved)}><Bookmark size={16} fill={p.progress.saved?"currentColor":"none"}/>{p.progress.saved?"Path saved":"Save this path"}</button>
    {next&&<a className="cl-resume" href={"#"+next.id}>Continue to stage {next.position} <ArrowUpRight size={15}/></a>}
    <p className="cl-note">{p.userId?"Saved to your account across devices.":"Guest progress stays on this browser."}</p>
    {!p.userId&&<Link href="/login">Sign in to save across devices <ArrowUpRight size={14}/></Link>}
    {p.userId&&p.hasLocal&&<button type="button" className="btn btn-outline" disabled={disabled} onClick={()=>void p.importLocal()}>Import this browser&apos;s progress</button>}
    {p.error&&<div role="alert"><p>{p.error}</p><button type="button" className="btn btn-ghost" onClick={()=>void p.retry()}>Retry loading</button></div>}
    <span className="cl-note" role="status" aria-live="polite">{p.busy?"Saving…":p.notice||(!p.ready&&!p.error?"Loading progress…":"")}</span>
   </div>
   <nav aria-label="Career sections" className="cl-section-nav"><a href="#roadmap">01 · Learning roadmap</a><a href="#resources">02 · Learning resources</a><a href="#projects">03 · Portfolio projects</a><a href="#readiness">04 · Job readiness</a><a href="#career-jobs">05 · Jobs in Cyprus</a><Link href="/careers/saved">My learning <ArrowUpRight size={14}/></Link></nav>
  </aside>
  <div className="cl-learning-main">
   <section id="roadmap" className="cl-section">
    <div className="cl-section-heading"><p className="cl-eyebrow">01 / Learn the foundations</p><h2>Your step-by-step roadmap.</h2><p>Work through each stage in order. Check tasks as you practise, then mark the stage complete when you can demonstrate its milestone.</p></div>
    <div className="cl-stages">{career.stages.map((s,i)=>{
     const done=p.progress.stages.includes(s.id);
     const resources=s.resourceIds.map(id=>career.resources.find(r=>r.id===id)).filter(r=>r!==undefined);
     return <details key={s.id} id={s.id} className={"cl-stage "+(done?"is-complete":"")} open={i===0}>
      <summary><span className="cl-stage-number" aria-label={"Stage "+s.position}>{done?<Check size={18}/>:String(s.position).padStart(2,"0")}</span><div><h3>{s.title}</h3><p>{s.duration} · {s.difficulty}{done?" · Completed":""}</p></div><ChevronDown size={18} className="cl-chevron" aria-hidden="true"/></summary>
      <div className="cl-stage-content"><p>{s.description}</p><div className="cl-tags">{s.skills.map(skill=><span key={skill}>{skill}</span>)}</div>
       <h4>Practise these tasks</h4><div className="cl-checklist">{s.tasks.map(t=><label key={t.id}><input type="checkbox" checked={p.progress.tasks.includes(t.id)} disabled={disabled} onChange={e=>void p.change("task",t.id,e.target.checked)}/><span>{t.label}</span></label>)}</div>
       <div className="cl-milestone"><p className="cl-eyebrow">Your milestone</p><p>{s.milestone}</p><label><input type="checkbox" checked={done} disabled={disabled} onChange={e=>void p.change("stage",s.id,e.target.checked)}/><span>I can demonstrate this milestone</span></label></div>
       <h4>Recommended resources</h4><div className="cl-resource-grid">{resources.map(r=><ResourceCard key={r.id} resource={r}/>)}</div>
      </div>
     </details>;
    })}</div>
   </section>
   <section id="resources" className="cl-section"><div className="cl-section-heading"><p className="cl-eyebrow">02 / Curated, not overwhelming</p><h2>Your learning resource library.</h2><p>Choose the resources that fit your stage and budget. You do not need to complete every course.</p></div><ResourceLibrary career={career}/></section>
   <section id="projects" className="cl-section"><div className="cl-section-heading"><p className="cl-eyebrow">03 / Put your skills to work</p><h2>Build work you can show.</h2><p>Four practical briefs to help you demonstrate real decisions. Completion times are portfolio planning estimates.</p></div>
    <div className="cl-projects">{career.projects.map(project=>{
     const starter=career.resources.find(r=>r.id===project.starterResourceId);
     return <details className="cl-project" key={project.id}><summary><span className="cl-eyebrow">Project {String(project.position).padStart(2,"0")}</span><h3>{project.title}</h3><p>{project.difficulty} · {project.duration}</p><ChevronDown size={18} className="cl-chevron" aria-hidden="true"/></summary>
      <div className="cl-project-content"><p>{project.overview}</p><h4>The problem</h4><p>{project.problem}</p><h4>Tools</h4><div className="cl-tags">{project.tools.map(t=><span key={t}>{t}</span>)}</div><h4>Your brief</h4><ol>{project.requirements.map((r,i)=><li key={i}>{r}</li>)}</ol><h4>Deliverables</h4><ul>{project.deliverables.map((r,i)=><li key={i}>{r}</li>)}</ul><h4>Skills you demonstrate</h4><p>{project.skills.join(" · ")}</p><h4>Present your work</h4><p>{project.presentation}</p>{starter&&<a href={starter.url} target="_blank" rel="noopener noreferrer" className="cl-text-link">Starter resource: {starter.name} <ArrowUpRight size={16}/><span className="sr-only"> (opens in a new tab)</span></a>}</div>
     </details>;
    })}</div>
   </section>
   <section id="readiness" className="cl-section"><div className="cl-section-heading"><p className="cl-eyebrow">04 / Check your evidence</p><h2>Ready for your next step?</h2><p>Use this checklist to identify gaps and practise explaining your work. It is a self-assessment and does not guarantee employment.</p></div>
    <div className="cl-readiness"><div className="cl-readiness-heading"><strong>{readiness} of {career.readiness.length} skills demonstrated</strong><span>{Math.round(readiness/career.readiness.length*100)}%</span></div><progress aria-label="Job-readiness checklist completion" value={readiness} max={career.readiness.length}/><div className="cl-checklist">{career.readiness.map(r=><label key={r.id}><input type="checkbox" checked={p.progress.readiness.includes(r.id)} disabled={disabled} onChange={e=>void p.change("readiness",r.id,e.target.checked)}/><span>{r.label}</span></label>)}</div></div>
   </section>
   <section id="career-jobs" className="cl-section"><div className="cl-section-heading"><p className="cl-eyebrow">05 / Explore the local market</p><h2>Relevant jobs in Cyprus.</h2><p>These active vacancies match this career&apos;s role titles. Check each listing for its required experience; not all are entry-level.</p></div>{jobs}</section>
  </div>
 </div>;
}

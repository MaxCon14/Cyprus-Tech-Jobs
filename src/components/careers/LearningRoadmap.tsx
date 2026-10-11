"use client";
import Link from "next/link";
import { useEffect, useState, type KeyboardEvent } from "react";
import { ArrowUpRight, ArrowRight, Bookmark, Check, ChevronDown, BookOpen, Library, FolderKanban, ListChecks, Briefcase, Target, Sparkles } from "lucide-react";
import type { Career } from "@/lib/careers/types";
import { useCareerProgress } from "./useCareerProgress";
import { ResourceCard, ResourceLibrary } from "./ResourceLibrary";
import { ToolStack, RoleMark } from "./CareerVisuals";

const sections=[
 {id:"roadmap",step:"01",label:"Learning roadmap",short:"Learn",description:"Follow the steps",icon:BookOpen},
 {id:"resources",step:"↗",label:"Learning resources",short:"Resources",description:"Find your next resource",icon:Library},
 {id:"projects",step:"02",label:"Portfolio projects",short:"Build",description:"Put skills into practice",icon:FolderKanban},
 {id:"readiness",step:"03",label:"Job readiness",short:"Readiness",description:"Check your evidence",icon:ListChecks},
 {id:"career-jobs",step:"04",label:"Jobs in Cyprus",short:"Jobs",description:"Explore opportunities",icon:Briefcase}
] as const;
type SectionId=typeof sections[number]["id"];
export function LearningRoadmap({career,jobs}:{career:Career;jobs:React.ReactNode}){
 const p=useCareerProgress(career.slug);
 const [active,setActive]=useState<SectionId>("roadmap");
 const [navigation,setNavigation]=useState<{target:string;sequence:number}|null>(null);
 useEffect(()=>{if(!navigation)return;const el=document.getElementById(navigation.target);if(el instanceof HTMLDetailsElement)el.open=true;el?.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});},[navigation]);
 const completed=career.stages.filter(s=>p.progress.stages.includes(s.id)).length;
 const readiness=career.readiness.filter(r=>p.progress.readiness.includes(r.id)).length;
 const percentage=Math.round(completed/career.stages.length*100);
 const next=career.stages.find(s=>!p.progress.stages.includes(s.id));
 const disabled=!p.ready||p.busy;
 function moveTo(target:string){setNavigation(previous=>({target,sequence:(previous?.sequence??0)+1}));}
 function revealStage(id:string){setActive("roadmap");history.replaceState(history.state,"","#"+id);moveTo(id);}
 useEffect(()=>{
  function fromHash(){const id=location.hash.slice(1);const section=sections.find(s=>s.id===id);if(section){setActive(section.id);setNavigation(previous=>({target:id,sequence:(previous?.sequence??0)+1}));}else if(career.stages.some(s=>s.id===id)){setActive("roadmap");setNavigation(previous=>({target:id,sequence:(previous?.sequence??0)+1}));}}
  fromHash();window.addEventListener("hashchange",fromHash);return()=>window.removeEventListener("hashchange",fromHash);
 },[career.stages]);
 function select(id:SectionId){setActive(id);history.replaceState(history.state,"","#"+id);moveTo(id);}
 function tabKey(event:KeyboardEvent<HTMLButtonElement>,index:number){
  let target:number;
  if(event.key==="ArrowDown"||event.key==="ArrowRight")target=(index+1)%sections.length;
  else if(event.key==="ArrowUp"||event.key==="ArrowLeft")target=(index+sections.length-1)%sections.length;
  else if(event.key==="Home")target=0;else if(event.key==="End")target=sections.length-1;else return;
  event.preventDefault();select(sections[target].id);document.getElementById("tab-"+sections[target].id)?.focus();
 }
 const panel=(id:SectionId)=>({id,role:"tabpanel","aria-labelledby":"tab-"+id,hidden:active!==id,tabIndex:0});
 return <div className="cl-learning-layout" id="learning-journey">
  <aside className="cl-sidebar">
   <nav aria-label="Your career journey" className="cl-section-nav" role="tablist" aria-orientation="vertical">{sections.map((s,i)=>{
    const Icon=s.icon;return <button type="button" role="tab" id={"tab-"+s.id} aria-label={s.label} aria-selected={active===s.id} aria-controls={s.id} tabIndex={active===s.id?0:-1} key={s.id} onClick={()=>select(s.id)} onKeyDown={e=>tabKey(e,i)}><span className="cl-nav-icon"><Icon size={19} aria-hidden="true"/></span><span><strong><span className="cl-nav-full">{s.label}</span><span className="cl-nav-short">{s.short}</span></strong><small>{s.description}</small></span><span className="cl-nav-step">{s.step}</span></button>;
   })}</nav>
   <div className="cl-progress-panel">
    <p className="cl-eyebrow">Your progress</p><div className="cl-progress-header"><strong className="cl-progress-value">{percentage}<span>%</span></strong><span className="cl-progress-fraction">{completed}/{career.stages.length} stages</span></div>
    <progress value={completed} max={career.stages.length} aria-label="Roadmap completion"/>
    <button type="button" className={"btn "+(p.progress.saved?"btn-primary":"btn-outline")} disabled={disabled} onClick={()=>void p.change("saved",career.slug,!p.progress.saved)}><Bookmark size={16} fill={p.progress.saved?"currentColor":"none"}/>{p.progress.saved?"Path saved":"Save this path"}</button>
    <p className="cl-note">{p.userId?"Saved to your account across devices.":"Guest progress stays on this browser."}</p>
    {!p.userId&&<Link href="/login">Sign in to keep your progress <ArrowUpRight size={14}/></Link>}
    {p.userId&&p.hasLocal&&<button type="button" className="btn btn-outline" disabled={disabled} onClick={()=>void p.importLocal()}>Import this browser&apos;s progress</button>}
    {p.error&&<div role="alert"><p>{p.error}</p><button type="button" className="btn btn-ghost" onClick={()=>void p.retry()}>Retry loading</button></div>}
    <span className="cl-note" role="status" aria-live="polite">{p.busy?"Saving…":p.notice||(!p.ready&&!p.error?"Loading progress…":"")}</span>
    <Link href="/careers/saved" className="cl-my-learning">My learning <ArrowRight size={14}/></Link>
   </div>
  </aside>
  <div className="cl-learning-main">
   <section {...panel("roadmap")} className="cl-section">
    <div className="cl-section-heading"><span className="cl-section-symbol"><BookOpen size={24} aria-hidden="true"/></span><div><p className="cl-eyebrow">Step 01 / Learn the foundations</p><h2>Your step-by-step roadmap.</h2><p>One stage at a time. Learn the skill, practise it, then demonstrate the milestone.</p></div></div>
    <div className="cl-next-step"><span className="cl-next-icon"><Sparkles size={23} aria-hidden="true"/></span><div><span className="cl-eyebrow">{next?(completed?"Your next step":"Start here"):"Roadmap complete"}</span><h3>{next?next.title:"Put your skills to work."}</h3><p>{next?"Stage "+next.position+" of "+career.stages.length+" · "+next.duration:"Choose a portfolio project to demonstrate what you have learned."}</p></div><button type="button" className="btn cl-btn-color" onClick={()=>next?revealStage(next.id):select("projects")}>{next?(completed?"Continue learning":"Start stage 1"):"Explore projects"}<ArrowRight size={17} aria-hidden="true"/></button></div>
    <div className="cl-roadmap-key"><span><i/>To learn</span><span><i className="is-current"/>Your next step</span><span><i className="is-done"/>Completed</span><span>{career.stages.length} stages · {career.duration} estimated</span></div>
    <div className="cl-stages">{career.stages.map((s,i)=>{
     const done=p.progress.stages.includes(s.id),current=next?.id===s.id;
     const resources=s.resourceIds.map(id=>career.resources.find(r=>r.id===id)).filter(r=>r!==undefined);
     return <details key={s.id} id={s.id} className={"cl-stage "+(done?"is-complete ":"")+(current?"is-current":"")} open={i===0}>
      <summary><span className="cl-stage-number" aria-label={"Stage "+s.position}>{done?<Check size={18} aria-hidden="true"/>:String(s.position).padStart(2,"0")}</span><div><span className={"cl-stage-status "+(done?"is-done":"")}>{done?"Completed":current?"Your next step":"Stage "+s.position}</span><h3>{s.title}</h3><p>{s.duration} · {s.difficulty}</p></div><ChevronDown size={19} className="cl-chevron" aria-hidden="true"/></summary>
      <div className="cl-stage-content"><p className="cl-stage-description">{s.description}</p><ToolStack skills={s.skills} limit={8}/>
       <div className="cl-stage-practice"><div><h4><ListChecks size={19} aria-hidden="true"/>Practise these tasks</h4><div className="cl-checklist">{s.tasks.map(t=><label key={t.id}><input type="checkbox" checked={p.progress.tasks.includes(t.id)} disabled={disabled} onChange={e=>void p.change("task",t.id,e.target.checked)}/><span>{t.label}</span></label>)}</div></div><div className="cl-exercise"><p className="cl-eyebrow">Put it into practice</p><p>{s.exercise}</p></div></div>
       <h4><Library size={19} aria-hidden="true"/>Learn with these resources</h4><div className="cl-resource-grid cl-stage-resources">{resources.map(r=><ResourceCard key={r.id} resource={r} compact/>)}</div>
       <div className="cl-milestone"><Target size={23} aria-hidden="true"/><div><p className="cl-eyebrow">What you&apos;ll be able to do</p><p>{s.milestone}</p><label><input type="checkbox" checked={done} disabled={disabled} onChange={e=>void p.change("stage",s.id,e.target.checked)}/><span>I can demonstrate this milestone</span></label></div></div>
       <div className="cl-stage-next">{career.stages[i+1]?<button type="button" onClick={()=>revealStage(career.stages[i+1].id)}>Next: {career.stages[i+1].title}<ArrowRight size={16} aria-hidden="true"/></button>:<button type="button" onClick={()=>select("projects")}>Next: build your portfolio<ArrowRight size={16} aria-hidden="true"/></button>}</div>
      </div>
     </details>;
    })}</div>
    <div className="cl-section-next"><div><p className="cl-eyebrow">Learning by doing</p><h3>Turn a new skill into something real.</h3><p>Explore four practical project briefs for your portfolio.</p></div><button className="btn btn-primary" type="button" onClick={()=>select("projects")}>Explore projects<ArrowRight size={17} aria-hidden="true"/></button></div>
   </section>
   <section {...panel("resources")} className="cl-section"><div className="cl-section-heading"><span className="cl-section-symbol"><Library size={24} aria-hidden="true"/></span><div><p className="cl-eyebrow">Your learning toolkit</p><h2>Find the right resource.</h2><p>Browse by budget, level and format. Every recommendation connects to your roadmap.</p></div></div><ResourceLibrary career={career} onChooseStage={revealStage}/></section>
   <section {...panel("projects")} className="cl-section"><div className="cl-section-heading"><span className="cl-section-symbol"><FolderKanban size={24} aria-hidden="true"/></span><div><p className="cl-eyebrow">Step 02 / Put your skills to work</p><h2>Build work you can show.</h2><p>Choose a brief. Build it step by step. Show the decisions behind your finished work.</p></div></div>
    <div className="cl-projects">{career.projects.map(project=>{
     const starter=career.resources.find(r=>r.id===project.starterResourceId);
     return <details className="cl-project" key={project.id}><summary><div className="cl-project-cover"><span className="cl-project-number">Project {String(project.position).padStart(2,"0")}</span><RoleMark slug={career.slug}/><span className="cl-project-level">{project.difficulty}</span></div><div className="cl-project-summary"><h3>{project.title}</h3><p>{project.overview}</p><ToolStack skills={project.tools} limit={3}/><span className="cl-project-open">View project brief <span>{project.duration}</span><ChevronDown size={18} className="cl-chevron" aria-hidden="true"/></span></div></summary>
      <div className="cl-project-content"><div className="cl-project-problem"><p className="cl-eyebrow">The problem to solve</p><p>{project.problem}</p></div><div className="cl-project-columns"><div><h4>Your step-by-step brief</h4><ol>{project.requirements.map((r,i)=><li key={i}>{r}</li>)}</ol></div><div><h4>Deliverables</h4><ul>{project.deliverables.map((r,i)=><li key={i}>{r}</li>)}</ul><h4>Skills you demonstrate</h4><p>{project.skills.join(" · ")}</p><h4>Present your work</h4><p>{project.presentation}</p></div></div>{starter&&<a href={starter.url} target="_blank" rel="noopener noreferrer" className="cl-starter-link"><span><strong>Open your starter resource</strong><small>{starter.name} · {starter.provider}</small></span><ArrowUpRight size={20} aria-hidden="true"/><span className="sr-only"> (opens in a new tab)</span></a>}</div>
     </details>;
    })}</div><p className="cl-note">Completion times are portfolio planning estimates. You can work at your own pace.</p>
    <div className="cl-section-next"><div><p className="cl-eyebrow">Make your work count</p><h3>Can you explain what you built?</h3><p>Use the readiness checklist to find gaps in your evidence.</p></div><button className="btn btn-primary" type="button" onClick={()=>select("readiness")}>Check readiness<ArrowRight size={17} aria-hidden="true"/></button></div>
   </section>
   <section {...panel("readiness")} className="cl-section"><div className="cl-section-heading"><span className="cl-section-symbol"><ListChecks size={24} aria-hidden="true"/></span><div><p className="cl-eyebrow">Step 03 / Check your evidence</p><h2>Ready for your next step?</h2><p>Check what you can demonstrate. Use the gaps to decide what to practise next.</p></div></div>
    <div className="cl-readiness"><div className="cl-readiness-heading"><div><p className="cl-eyebrow">Your skills, backed by evidence</p><strong>{readiness} of {career.readiness.length} skills demonstrated</strong></div><span>{Math.round(readiness/career.readiness.length*100)}%</span></div><progress aria-label="Job-readiness checklist completion" value={readiness} max={career.readiness.length}/><div className="cl-checklist">{career.readiness.map((r,i)=><label key={r.id}><span className="cl-readiness-number">{String(i+1).padStart(2,"0")}</span><span>{r.label}</span><input type="checkbox" checked={p.progress.readiness.includes(r.id)} disabled={disabled} onChange={e=>void p.change("readiness",r.id,e.target.checked)}/></label>)}</div></div><p className="cl-note">This is a self-assessment, not a guarantee of employment. Focus on examples you can explain and show.</p>
    <div className="cl-section-next"><div><p className="cl-eyebrow">Step 04 / Explore opportunities</p><h3>See how your skills connect to real roles.</h3><p>Read the requirements, compare your evidence, and find your next opportunity.</p></div><button className="btn btn-primary" type="button" onClick={()=>select("career-jobs")}>Explore jobs<ArrowRight size={17} aria-hidden="true"/></button></div>
   </section>
   <section {...panel("career-jobs")} className="cl-section"><div className="cl-section-heading"><span className="cl-section-symbol"><Briefcase size={24} aria-hidden="true"/></span><div><p className="cl-eyebrow">Step 04 / Explore the local market</p><h2>Relevant jobs in Cyprus.</h2><p>Active vacancies that match this career&apos;s role titles. Check the required experience; not all are entry-level.</p></div></div>{jobs}<div className="cl-section-next"><div><h3>Keep building as you explore.</h3><p>Return to your next stage whenever you need to strengthen a skill.</p></div><button type="button" className="btn btn-primary" onClick={()=>next?revealStage(next.id):select("projects")}>Back to learning<ArrowRight size={17} aria-hidden="true"/></button></div></section>
  </div>
 </div>;
}

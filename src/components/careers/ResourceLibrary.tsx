"use client";
import { useState } from "react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import type { Career, Resource } from "@/lib/careers/types";
import { ProviderMark } from "./CareerVisuals";
export function ResourceCard({resource:r,compact=false}:{resource:Resource;compact?:boolean}){
 return <article className={"cl-resource "+(compact?"is-compact":"")}>
  <div className="cl-resource-identity"><ProviderMark provider={r.provider}/><div><p className="cl-resource-provider">{r.provider}</p><span className="cl-resource-format">{r.type} · {r.difficulty}</span></div><span className={"cl-access "+(r.access==="Free"?"is-free":r.access==="Paid"?"is-paid":"is-freemium")}>{r.access}</span></div>
  <h4><a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}<ArrowUpRight size={16} aria-hidden="true"/><span className="sr-only"> (external resource, opens in a new tab)</span></a></h4>
  <p>{r.description}</p>{r.duration&&<small>Provider estimate: {r.duration}</small>}
  {!compact&&<div className="cl-resource-action"><span>Learn with {r.provider}</span><ArrowUpRight size={17} aria-hidden="true"/></div>}
 </article>;
}
type FilterProps={label:string;value:string;options:string[];onChange:(value:string)=>void};
function Filter({label,value,options,onChange}:FilterProps){return <label><span>{label}</span><select aria-label={label} value={value} onChange={e=>onChange(e.target.value)}>{options.map(x=><option key={x}>{x}</option>)}</select></label>;}
export function ResourceLibrary({career,onChooseStage}:{career:Career;onChooseStage?:(id:string)=>void}){
 const [access,setAccess]=useState("All access"),[level,setLevel]=useState("All levels"),[type,setType]=useState("All types");
 const rows=career.resources.filter(r=>(access==="All access"||r.access===access)&&(level==="All levels"||r.difficulty===level)&&(type==="All types"||r.type===type));
 return <>
  <div className="cl-resource-guide"><ProviderMark provider="Google"/><div><strong>You don&apos;t need to take every course.</strong><p>Choose a resource for your current stage. Start with free material, then add a course if you need more structure.</p></div></div>
  <div className="cl-filters cl-resource-filters"><Filter label="Access" value={access} onChange={setAccess} options={["All access","Free","Freemium","Paid"]}/><Filter label="Difficulty" value={level} onChange={setLevel} options={["All levels","Beginner","Intermediate","Advanced"]}/><Filter label="Resource type" value={type} onChange={setType} options={["All types","Course","Tutorial","Documentation","Practice","Certification"]}/></div>
  <p className="cl-note" role="status">{rows.length} curated resources. Learning access is labelled below; software, cloud usage or exams can have separate costs.</p>
  <div className="cl-resource-grid">{rows.map(r=>{
   const stages=career.stages.filter(s=>s.resourceIds.includes(r.id));
   return <div key={r.id}><ResourceCard resource={r}/><div className="cl-resource-stage">{stages.length?stages.map(s=><button type="button" key={s.id} onClick={()=>onChooseStage?.(s.id)}>Stage {s.position} · {s.title}<ArrowRight size={13} aria-hidden="true"/></button>):<span>Portfolio project starter</span>}</div></div>;
  })}</div>
  {!rows.length&&<div className="cl-empty"><h3>Try another combination.</h3><p>No resources match these filters.</p><button type="button" className="btn btn-ghost" onClick={()=>{setAccess("All access");setLevel("All levels");setType("All types");}}>Clear resource filters</button></div>}
  <p className="cl-note">Check each provider for current terms. External resources open in a new tab.</p>
 </>;
}

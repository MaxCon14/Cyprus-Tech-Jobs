"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Career, Resource } from "@/lib/careers/types";
export function ResourceCard({resource:r}:{resource:Resource}) {
 return <article className="cl-resource"><div className="cl-resource-top"><span className={"cl-access "+(r.access==="Free"?"is-free":"")}>{r.access}</span><span>{r.type} · {r.difficulty}</span></div><p className="cl-eyebrow">{r.provider}</p><h4><a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}<ArrowUpRight size={16} aria-hidden="true"/><span className="sr-only"> (external resource, opens in a new tab)</span></a></h4><p>{r.description}</p>{r.duration&&<small>Provider estimate: {r.duration}</small>}</article>;
}
export function ResourceLibrary({career}:{career:Career}){
 const [access,setAccess]=useState("All access"),[level,setLevel]=useState("All levels"),[type,setType]=useState("All types");
 const rows=career.resources.filter(r=>(access==="All access"||r.access===access)&&(level==="All levels"||r.difficulty===level)&&(type==="All types"||r.type===type));
 return <>
  <div className="cl-filters cl-resource-filters">{[["Access",access,setAccess,["All access","Free","Freemium","Paid"]],["Difficulty",level,setLevel,["All levels","Beginner","Intermediate","Advanced"]],["Resource type",type,setType,["All types","Course","Tutorial","Documentation","Practice","Certification"]]].map(([label,value,set,options])=><label key={label as string}><span>{label as string}</span><select aria-label={label as string} value={value as string} onChange={e=>(set as (value:string)=>void)(e.target.value)}>{(options as string[]).map(x=><option key={x}>{x}</option>)}</select></label>)}</div>
  <p className="cl-note" role="status">{rows.length} curated resources. Free labels describe learning material; software, cloud usage or exams can have separate costs. Check each provider for current terms.</p>
  <div className="cl-resource-grid">{rows.map(r=><div key={r.id}><ResourceCard resource={r}/><p className="cl-resource-stage">{career.stages.some(s=>s.resourceIds.includes(r.id))?"Use in "+career.stages.filter(s=>s.resourceIds.includes(r.id)).map(s=>"stage "+s.position).join(", "):"Portfolio project starter"}</p></div>)}</div>
  {!rows.length&&<div className="cl-empty"><p>No resources match these filters.</p><button type="button" className="btn btn-ghost" onClick={()=>{setAccess("All access");setLevel("All levels");setType("All types");}}>Clear resource filters</button></div>}
 </>;
}

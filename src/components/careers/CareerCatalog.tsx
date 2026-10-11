"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Search, ChartNoAxesCombined, Code2, PenTool, ShieldCheck, Braces, BrainCircuit } from "lucide-react";
import type { CareerSummary } from "@/lib/careers/types";
const icons:Record<string,typeof Code2>={"data-analyst":ChartNoAxesCombined,"frontend-developer":Code2,"ux-ui-designer":PenTool,"cybersecurity-analyst":ShieldCheck,"data-scientist":BrainCircuit,"backend-developer":Braces};
export function CareerCatalog({careers}:{careers:CareerSummary[]}) {
 const [search,setSearch]=useState(""),[category,setCategory]=useState("All categories"),[difficulty,setDifficulty]=useState("All levels");
 const categories=[...new Set(careers.map(c=>c.category))].sort();
 const filtered=careers.filter(c=>(category==="All categories"||c.category===category)&&(difficulty==="All levels"||c.difficulty===difficulty)&&[c.title,c.description,c.category,...c.skills].join(" ").toLowerCase().includes(search.trim().toLowerCase()));
 const reset=()=>{setSearch("");setCategory("All categories");setDifficulty("All levels");};
 return <div>
  <div className="cl-filters">
   <label className="cl-search"><span className="sr-only">Search careers or skills</span><Search size={18} aria-hidden="true"/><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search a career or skill…"/></label>
   <label><span>Category</span><select value={category} onChange={e=>setCategory(e.target.value)}><option>All categories</option>{categories.map(x=><option key={x}>{x}</option>)}</select></label>
   <label><span>Starting level</span><select value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option>All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
  </div>
  <div className="cl-result-row"><p role="status">{filtered.length} {filtered.length===1?"career path":"career paths"} to explore</p><Link href="/careers/saved">My learning <ArrowUpRight size={15}/></Link></div>
  <div className="cl-card-grid">{filtered.map((c,i)=>{
   const Icon=icons[c.slug]??Code2;
   return <Link key={c.slug} href={"/careers/"+c.slug} className="cl-career-card">
    <div className="cl-card-top"><span className="cl-eyebrow">{c.category}</span><span className="cl-card-icon"><Icon size={24} strokeWidth={1.6}/></span></div>
    <span className="cl-card-number" aria-hidden="true">{String(i+1).padStart(2,"0")}</span><h3>{c.title}</h3><p>{c.description}</p>
    <div className="cl-tags">{c.skills.slice(0,4).map(s=><span key={s}>{s}</span>)}</div>
    <div className="cl-card-meta"><span>{c.difficulty==="Beginner"?"Beginner friendly":"Intermediate start"}</span><span>{c.duration}</span></div>
    <div className="cl-card-footer"><span>{c.stageCount} stages · {c.resourceCount} resources</span><strong>Explore roadmap <ArrowUpRight size={17}/></strong></div>
   </Link>;
  })}</div>
  {!filtered.length&&<div className="cl-empty"><h3>No paths match those filters.</h3><p>Try a broader skill or choose another category.</p><button type="button" className="btn btn-primary" onClick={reset}>Clear filters</button></div>}
  <p className="cl-note">Learning times are estimates based on consistent weekly study. Intermediate paths benefit from existing programming or maths foundations. Your starting point and study pace will change the timeline.</p>
 </div>;
}

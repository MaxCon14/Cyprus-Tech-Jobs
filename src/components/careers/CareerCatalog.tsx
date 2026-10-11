"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ArrowRight, Search, Clock3, BookOpen, Sparkles } from "lucide-react";
import type { CareerSummary } from "@/lib/careers/types";
import { careerTone, RoleMark, ToolStack } from "./CareerVisuals";
const interests:Record<string,string>={"Data & Analytics":"Find patterns. Solve problems.","Software Development":"Build things people use.","Design & Product":"Make experiences feel better.","Cybersecurity":"Protect people and systems."};
export function CareerCatalog({careers}:{careers:CareerSummary[]}){
 const [search,setSearch]=useState(""),[category,setCategory]=useState("All categories"),[difficulty,setDifficulty]=useState("All levels");
 const categories=[...new Set(careers.map(c=>c.category))].sort();
 const filtered=careers.filter(c=>(category==="All categories"||c.category===category)&&(difficulty==="All levels"||c.difficulty===difficulty)&&[c.title,c.description,c.category,...c.skills].join(" ").toLowerCase().includes(search.trim().toLowerCase()));
 const reset=()=>{setSearch("");setCategory("All categories");setDifficulty("All levels");};
 return <div>
  <div className="cl-interest-header"><Sparkles size={17} aria-hidden="true"/><p>What interests you? Choose a direction, or browse them all.</p></div>
  <div className="cl-interest-grid" aria-label="Browse by interest">{categories.map(x=><button type="button" className={"cl-interest cl-tone-"+careerTone(x)} aria-pressed={category===x} key={x} onClick={()=>setCategory(category===x?"All categories":x)}><span className="cl-interest-dot"/><strong>{x}</strong><span>{interests[x]??"Explore this direction."}</span><ArrowRight size={17} aria-hidden="true"/></button>)}</div>
  <div className="cl-filters">
   <label className="cl-search"><span className="sr-only">Search careers or skills</span><Search size={19} aria-hidden="true"/><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Try a career, Python, design…"/></label>
   <label><span>Category</span><select aria-label="Category" value={category} onChange={e=>setCategory(e.target.value)}><option>All categories</option>{categories.map(x=><option key={x}>{x}</option>)}</select></label>
   <label><span>Starting level</span><select aria-label="Starting level" value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option>All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
  </div>
  <div className="cl-result-row"><p role="status">{filtered.length} {filtered.length===1?"career path":"career paths"} to explore{category!=="All categories"?" · "+category:""}</p><Link href="/careers/saved">My learning <ArrowUpRight size={15}/></Link></div>
  <div className="cl-card-grid">{filtered.map(c=><Link key={c.slug} href={"/careers/"+c.slug} className={"cl-career-card cl-tone-"+careerTone(c.category)}>
   <div className="cl-card-visual"><span className="cl-card-category">{c.category}</span><RoleMark slug={c.slug} large/><span className="cl-card-visual-note">A path to your next chapter</span></div>
   <div className="cl-card-body"><div className="cl-card-meta"><span className="cl-level">{c.difficulty==="Beginner"?"Beginner friendly":c.difficulty+" start"}</span><span><Clock3 size={14} aria-hidden="true"/>{c.duration}</span></div>
    <h3>{c.title}</h3><p>{c.description}</p><ToolStack skills={c.skills} limit={3}/>
    <div className="cl-card-footer"><span><BookOpen size={15} aria-hidden="true"/>{c.stageCount} stages · {c.resourceCount} resources</span><strong>Explore this path <ArrowRight size={18} aria-hidden="true"/></strong></div>
   </div>
  </Link>)}</div>
  {!filtered.length&&<div className="cl-empty"><h3>No paths match those filters.</h3><p>Try a broader skill or choose another category.</p><button type="button" className="btn btn-primary" onClick={reset}>Clear filters</button></div>}
  <p className="cl-note">Learning times are estimates based on consistent weekly study. Intermediate paths benefit from existing programming or maths foundations. Your starting point and study pace will change the timeline.</p>
 </div>;
}

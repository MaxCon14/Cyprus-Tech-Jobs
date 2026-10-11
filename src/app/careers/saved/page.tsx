import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCareers,withLearner,readProgress } from "@/lib/careers/queries";
export const metadata={title:"My learning",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function SavedCareersPage(){
 const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();
 if(!user)return <div className="cl-container cl-saved"><p className="cl-eyebrow">Your next chapter</p><h1>My learning</h1><div className="cl-empty"><h2>Keep your paths in one place.</h2><p>Sign in to view saved careers and milestones across devices. Guest progress is available on each roadmap in this browser.</p><Link href="/login" className="btn btn-primary">Sign in</Link><Link href="/careers" className="btn btn-ghost">Explore careers</Link></div></div>;
 const careers=await getCareers();
 const rows=await withLearner(user.id,async tx=>{
  const progress=[];
  for(const career of careers){const p=await readProgress(tx,user.id,career.slug);if(p.saved||p.stages.length||p.tasks.length||p.readiness.length)progress.push({career,p});}
  return progress;
 });
 return <div className="cl-container cl-saved"><p className="cl-eyebrow">Your next chapter</p><h1>My learning</h1><p>Resume a saved path and see the milestones you have completed.</p><div className="cl-card-grid">{rows.map(({career:c,p})=><article className="cl-career-card" key={c.slug}><p className="cl-eyebrow">{p.saved?"Saved path":"In progress"}</p><h2>{c.title}</h2><p>{p.stages.length} of {c.stageCount} milestones completed · {p.tasks.length} tasks practised</p><progress value={p.stages.length} max={c.stageCount} aria-label={c.title+" completion"}/><Link href={"/careers/"+c.slug+"#roadmap"} className="btn btn-primary">Resume learning ↗</Link></article>)}</div>{!rows.length&&<div className="cl-empty"><h2>Your next chapter starts with one path.</h2><p>Save a career or complete a learning task to see it here.</p><Link href="/careers" className="btn btn-primary">Explore career paths</Link></div>}</div>;
}

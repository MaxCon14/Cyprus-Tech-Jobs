import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCareer,getCareers,getCareerJobs } from "@/lib/careers/queries";
import { LearningRoadmap } from "@/components/careers/LearningRoadmap";
import { JobCard } from "@/components/jobs/JobCard";
import { jsonLd } from "@/lib/schema";
import { ArrowRight, BookOpen, FolderKanban, ListChecks, Briefcase, Clock3 } from "lucide-react";
import { careerTone, RoleMark, ToolStack } from "@/components/careers/CareerVisuals";
export const revalidate=3600;
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const c=await getCareer((await params).slug);if(!c)return {title:"Career not found",robots:{index:false}};
 return {title:{absolute:c.seoTitle+" | CyprusTech.Careers"},description:c.seoDescription,alternates:{canonical:"/careers/"+c.slug},openGraph:{title:c.seoTitle,description:c.seoDescription,url:"/careers/"+c.slug},robots:process.env.VERCEL_ENV==="preview"?{index:false,follow:false}:undefined};
}
export default async function CareerPage({params}:Props){
 const c=await getCareer((await params).slug);if(!c)notFound();
 const [careers,jobs]=await Promise.all([getCareers(),getCareerJobs(c)]);
 const base="https://cyprustech.careers";
 const breadcrumb={"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[{name:"Home",item:base},{name:"Career Library",item:base+"/careers"},{name:c.title,item:base+"/careers/"+c.slug}].map((x,i)=>({"@type":"ListItem",position:i+1,...x}))};
 return <div className={"cl-container cl-tone-"+careerTone(c.category)}><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(breadcrumb)}}/>
  <nav className="cl-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/careers">Career Library</Link><span>/</span><span aria-current="page">{c.title}</span></nav>
  <header className="cl-detail-hero">
   <div className="cl-detail-copy"><div className="cl-role-label"><RoleMark slug={c.slug}/><p className="cl-eyebrow">{c.category} / Career roadmap</p></div><h1>{c.title}</h1><p className="cl-detail-intro">{c.description}</p>
    <div className="cl-hero-actions"><a className="btn cl-btn-color" href={"#"+c.stages[0].id}>Start learning<ArrowRight size={17} aria-hidden="true"/></a><a className="btn btn-outline" href="#resources">Browse resources<BookOpen size={17} aria-hidden="true"/></a></div>
    <div className="cl-detail-stats">{[["Starting point",c.difficulty],["Estimated journey",c.duration],["Weekly study",c.weeklyHours]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <ToolStack skills={c.skills} limit={8}/><details className="cl-career-about"><summary>What does a {c.title.toLowerCase()} actually do?</summary><p className="cl-overview">{c.overview}</p><p className="cl-note">Typical entry roles: {c.entryTitles.join(" · ")}.</p></details><p className="cl-note">Timelines are estimates based on consistent study, not guaranteed outcomes.</p>
   </div>
   <div className="cl-journey-preview"><p className="cl-eyebrow">Your path at a glance</p><h2>From curious<br/>to capable.</h2><ol>
    <li><span><BookOpen size={19} aria-hidden="true"/></span><div><strong>Learn the foundations</strong><p>{c.stages.length} guided stages, one step at a time</p></div><span className="cl-journey-number">01</span></li>
    <li><span><FolderKanban size={19} aria-hidden="true"/></span><div><strong>Build your portfolio</strong><p>{c.projects.length} practical project briefs</p></div><span className="cl-journey-number">02</span></li>
    <li><span><ListChecks size={19} aria-hidden="true"/></span><div><strong>Check your readiness</strong><p>{c.readiness.length} skills to demonstrate</p></div><span className="cl-journey-number">03</span></li>
    <li><span><Briefcase size={19} aria-hidden="true"/></span><div><strong>Explore jobs in Cyprus</strong><p>Connect your learning to real roles</p></div><span className="cl-journey-number">04</span></li>
   </ol><p className="cl-journey-note"><Clock3 size={15} aria-hidden="true"/>Go at your own pace. Your progress is yours.</p></div>
  </header>
  <LearningRoadmap career={c} jobs={jobs.length?<div className="cl-job-grid">{jobs.map(j=><JobCard key={j.id} {...j} company={j.company??{name:j.curatedCompanyName??"Company",slug:""}} tags={j.tags.map(t=>({name:t.tag.name}))}/>)}</div>:<div className="cl-empty"><h3>No matching vacancies right now.</h3><p>Hiring changes regularly. Explore all active jobs or return to this roadmap later.</p><Link className="btn btn-primary" href="/jobs">Browse all jobs</Link></div>}/>
  <section className="cl-related"><p className="cl-eyebrow">Keep exploring</p><h2>Other directions in tech.</h2><div className="cl-related-links">{careers.filter(x=>x.slug!==c.slug).map(x=><Link key={x.slug} href={"/careers/"+x.slug}>{x.title} ↗</Link>)}<Link href="/blog">Career advice ↗</Link></div></section>
 </div>;
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCareer,getCareers,getCareerJobs } from "@/lib/careers/queries";
import { LearningRoadmap } from "@/components/careers/LearningRoadmap";
import { JobCard } from "@/components/jobs/JobCard";
import { jsonLd } from "@/lib/schema";
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
 return <div className="cl-container"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(breadcrumb)}}/>
  <nav className="cl-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/careers">Career Library</Link><span>/</span><span aria-current="page">{c.title}</span></nav>
  <header className="cl-detail-hero"><p className="cl-eyebrow">{c.category} / Career roadmap</p><h1>{c.title}</h1><p className="cl-detail-intro">{c.description}</p><p className="cl-overview">{c.overview}</p>
   <div className="cl-detail-stats">{[["Starting point",c.difficulty],["Estimated journey",c.duration],["Weekly study",c.weeklyHours],["Practical work",c.projects.length+" portfolio projects"]].map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="cl-tags">{c.skills.map(s=><span key={s}>{s}</span>)}</div><p className="cl-note">Typical entry roles: {c.entryTitles.join(" · ")}. Timelines are estimates, not guarantees.</p>
  </header>
  <LearningRoadmap career={c} jobs={jobs.length?<div className="cl-job-grid">{jobs.map(j=><JobCard key={j.id} {...j} company={j.company??{name:j.curatedCompanyName??"Company",slug:""}} tags={j.tags.map(t=>({name:t.tag.name}))}/>)}</div>:<div className="cl-empty"><h3>No matching vacancies right now.</h3><p>Hiring changes regularly. Explore all active jobs or return to this roadmap later.</p><Link className="btn btn-primary" href="/jobs">Browse all jobs</Link></div>}/>
  <section className="cl-related"><p className="cl-eyebrow">Keep exploring</p><h2>Other directions in tech.</h2><div className="cl-related-links">{careers.filter(x=>x.slug!==c.slug).map(x=><Link key={x.slug} href={"/careers/"+x.slug}>{x.title} ↗</Link>)}<Link href="/blog">Career advice ↗</Link></div></section>
 </div>;
}

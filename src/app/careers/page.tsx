import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Compass, BookOpen, FolderKanban, Briefcase } from "lucide-react";
import { ProviderMark } from "@/components/careers/CareerVisuals";
import { getCareers } from "@/lib/careers/queries";
import { CareerCatalog } from "@/components/careers/CareerCatalog";
import { jsonLd } from "@/lib/schema";
export const revalidate=3600;
export const metadata:Metadata={
 title:"Explore Tech Career Paths",description:"Explore six technology career paths, free and paid learning resources, practical projects and step-by-step roadmaps for building job-ready skills in Cyprus.",
 alternates:{canonical:"/careers"},openGraph:{title:"Find your path in tech.",description:"Tech career roadmaps, curated resources and practical projects.",url:"/careers"},
 robots:process.env.VERCEL_ENV==="preview"?{index:false,follow:false}:undefined
};
export default async function CareersPage(){
 const careers=await getCareers();
 const schema={"@context":"https://schema.org","@type":"ItemList",name:"Tech career paths",itemListElement:careers.map((c,i)=>({"@type":"ListItem",position:i+1,name:c.title,url:"https://cyprustech.careers/careers/"+c.slug}))};
 return <div className="cl-container"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(schema)}}/>
  <section className="cl-hero"><div><p className="cl-eyebrow">Career Library / Built for your next chapter</p><h1>Find your path<br/><span>in tech.</span></h1><p className="cl-hero-copy">Explore technology careers, follow step-by-step learning roadmaps, and discover the resources you need to build job-ready skills.</p><a href="#career-paths" className="btn btn-primary">Explore the paths <ArrowUpRight size={17}/></a></div>
   <div className="cl-discovery-journey"><p className="cl-eyebrow">A little direction goes a long way</p><h2>You don&apos;t need to<br/>figure it out alone.</h2><ol>{[{title:"Find your direction",copy:"Choose a career that fits your interests.",icon:Compass},{title:"Learn one step at a time",copy:"A guided roadmap and the right resources.",icon:BookOpen},{title:"Build something you can show",copy:"Practical projects, with clear briefs.",icon:FolderKanban},{title:"Take your next career step",copy:"Check your skills. Explore real jobs.",icon:Briefcase}].map((s,i)=>{const Icon=s.icon;return <li key={s.title}><span className="cl-discovery-icon"><Icon size={19} aria-hidden="true"/></span><div><strong>{s.title}</strong><p>{s.copy}</p></div><span className="cl-discovery-number">0{i+1}</span></li>;})}</ol></div>
  </section>
  <div className="cl-provider-strip"><p>Learn with resources from</p><div>{["Google","Microsoft Learn","DataCamp","Figma","GitHub Skills"].map(provider=><span key={provider}><ProviderMark provider={provider}/>{provider}</span>)}</div></div>
  <section id="career-paths" className="cl-catalog-section"><div className="cl-catalog-heading"><div><p className="cl-eyebrow">Choose a direction</p><h2>Explore Tech Career Paths</h2></div><p>Start where you are.<br/>Build one useful skill at a time.</p></div><CareerCatalog careers={careers}/></section>
  <section className="cl-bottom-callout"><div><p className="cl-eyebrow">Already building your skills?</p><h2>See what employers are looking for.</h2><p>Use real vacancies to understand the skills and experience behind a role.</p></div><Link href="/jobs" className="btn btn-primary">Explore jobs in Cyprus <ArrowUpRight size={17}/></Link></section>
 </div>;
}

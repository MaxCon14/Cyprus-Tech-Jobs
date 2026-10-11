import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
   <div className="cl-hero-aside"><p>A clearer route<br/>from <strong>curiosity</strong><br/>to <strong>capability.</strong></p><ol>{["Discover a career","Learn the foundations","Build practical projects","Find your next opportunity"].map((x,i)=><li key={x}><span>{String(i+1).padStart(2,"0")}</span>{x}</li>)}</ol><small>Free to explore. Built for the Cyprus tech community.</small></div>
  </section>
  <section id="career-paths" className="cl-catalog-section"><div className="cl-catalog-heading"><div><p className="cl-eyebrow">Choose a direction</p><h2>Explore Tech Career Paths</h2></div><p>Start where you are.<br/>Build one useful skill at a time.</p></div><CareerCatalog careers={careers}/></section>
  <section className="cl-bottom-callout"><div><p className="cl-eyebrow">Already building your skills?</p><h2>See what employers are looking for.</h2><p>Use real vacancies to understand the skills and experience behind a role.</p></div><Link href="/jobs" className="btn btn-primary">Explore jobs in Cyprus <ArrowUpRight size={17}/></Link></section>
 </div>;
}

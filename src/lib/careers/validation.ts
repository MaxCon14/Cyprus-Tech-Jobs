import type { Career } from "./types";
const levels=["Beginner","Intermediate","Advanced"];
export function validateCareer(input:unknown): Career {
 if(!input||typeof input!=="object") throw Error("A career is required.");
 const c=input as Career;
 const text=(s:unknown,label:string,max=6000)=>{if(typeof s!=="string"||!s.trim()||s.length>max)throw Error(label+" must be non-empty text.");};
 const strings=(a:unknown,label:string,min=1)=>{if(!Array.isArray(a)||a.length<min||a.length>40)throw Error(label+" must be a list.");a.forEach(x=>text(x,label,500));};
 const list=(a:unknown,label:string,min=1,max=60)=>{if(!Array.isArray(a)||a.length<min||a.length>max)throw Error(label+" has an invalid item count.");};
 const id=(s:unknown)=>{text(s,"ID",180);if(!/^[a-zA-Z0-9_-]+$/.test(s as string))throw Error("Invalid ID.");};
 text(c.slug,"Slug",100);if(!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.slug)||["saved"].includes(c.slug))throw Error("Invalid or reserved slug.");
 for(const key of ["title","category","duration","weeklyHours","description","overview","seoTitle","seoDescription"] as const)text(c[key],key);
 if(typeof c.published!=="boolean"||!levels.includes(c.difficulty))throw Error("Invalid publication status or difficulty.");
 strings(c.skills,"Skills");strings(c.entryTitles,"Entry titles");strings(c.jobTerms,"Job matches");
 list(c.stages,"Stages");list(c.resources,"Resources",1,150);list(c.projects,"Projects",1,20);list(c.readiness,"Readiness",1,40);
 const resourceIds=new Set<string>(), subjectIds=new Set<string>();
 const unique=(value:string)=>{id(value);if(subjectIds.has(value))throw Error("Duplicate learning item ID.");subjectIds.add(value);};
 for(const r of c.resources){id(r.id);if(resourceIds.has(r.id))throw Error("Duplicate resource ID.");resourceIds.add(r.id);
  for(const key of ["name","provider","description"] as const)text(r[key],key);
  let url:URL;try{url=new URL(r.url);}catch{throw Error("Invalid resource URL.");}
  if(url.protocol!=="https:"||url.username||url.password)throw Error("Resource links must use HTTPS.");
  if(!levels.includes(r.difficulty)||!["Free","Freemium","Paid"].includes(r.access)||!["Course","Tutorial","Documentation","Practice","Certification"].includes(r.type))throw Error("Invalid resource labels.");
  if(r.duration!==null&&r.duration!==undefined)text(r.duration,"Resource duration",100);
  if(r.verifiedAt!=null&&!/^\d{4}-\d{2}-\d{2}$/.test(r.verifiedAt))throw Error("Invalid verification date.");
 }
 for(const [i,s] of c.stages.entries()){unique(s.id);s.position=i+1;
  for(const key of ["title","duration","description","exercise","milestone"] as const)text(s[key],key);
  if(!levels.includes(s.difficulty))throw Error("Invalid stage difficulty.");
  strings(s.skills,"Stage skills");strings(s.resourceIds,"Stage resources");list(s.tasks,"Stage tasks",1,30);
  if(new Set(s.resourceIds).size!==s.resourceIds.length||s.resourceIds.some(x=>!resourceIds.has(x)))throw Error("Unknown or duplicate stage resource.");
  for(const [j,t] of s.tasks.entries()){unique(t.id);text(t.label,"Task");t.position=j+1;}
 }
 for(const [i,p] of c.projects.entries()){unique(p.id);p.position=i+1;
  for(const key of ["title","duration","overview","problem","presentation"] as const)text(p[key],key);
  if(!levels.includes(p.difficulty))throw Error("Invalid project difficulty.");
  for(const key of ["tools","requirements","deliverables","skills"] as const)strings(p[key],key);
  if(!resourceIds.has(p.starterResourceId))throw Error("Unknown project starter resource.");
 }
 for(const [i,r] of c.readiness.entries()){unique(r.id);text(r.label,"Readiness item");r.position=i+1;}
 return c;
}

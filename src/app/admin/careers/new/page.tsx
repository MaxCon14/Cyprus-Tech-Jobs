import {redirect} from "next/navigation";
import {getAdminUser} from "@/lib/admin-auth";
import {prisma} from "@/lib/prisma";
import type {Career,Resource} from "@/lib/careers/types";
import {CareerEditor} from "../CareerEditor";
import "../editor.css";
export const dynamic="force-dynamic";
export default async function NewCareer(){
 if(!await getAdminUser())redirect("/admin/login");
 const resources=await prisma.$queryRaw<Resource[]>`SELECT id,name,provider,url,description,type,access,difficulty,duration,verified_at::text AS "verifiedAt" FROM career_library.resources ORDER BY name`;
 const c:Career={slug:"",title:"",category:"Software Development",difficulty:"Beginner",duration:"",weeklyHours:"",description:"",overview:"",skills:[],entryTitles:[],jobTerms:[],seoTitle:"",seoDescription:"",published:false,updatedAt:"",stages:[],resources:[],projects:[],readiness:[]};
 return <CareerEditor initial={c} resourceOptions={resources}/>;
}

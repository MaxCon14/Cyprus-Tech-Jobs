import {redirect,notFound} from "next/navigation";
import {getAdminUser} from "@/lib/admin-auth";
import {readCareer} from "@/lib/careers/queries";
import {prisma} from "@/lib/prisma";
import type {Resource} from "@/lib/careers/types";
import {CareerEditor} from "../CareerEditor";
import "../editor.css";
export const dynamic="force-dynamic";
export default async function EditCareer({params}:{params:Promise<{slug:string}>}){
 if(!await getAdminUser())redirect("/admin/login");
 const c=await readCareer((await params).slug,true);if(!c)notFound();
 const resources=await prisma.$queryRaw<Resource[]>`SELECT id,name,provider,url,description,type,access,difficulty,duration,verified_at::text AS "verifiedAt" FROM career_library.resources ORDER BY name`;
 return <CareerEditor initial={c} resourceOptions={resources}/>;
}

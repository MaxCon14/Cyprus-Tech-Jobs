import {NextResponse} from "next/server";
import {revalidateTag} from "next/cache";
import {Prisma} from "@prisma/client";
import {getAdminUser,adminUnauthorized} from "@/lib/admin-auth";
import {prisma} from "@/lib/prisma";
import {CAREER_CACHE_TAG} from "@/lib/careers/queries";
import {validateCareer} from "@/lib/careers/validation";
export async function POST(request:Request){
 if(request.headers.get("origin")!==new URL(request.url).origin)return NextResponse.json({error:"Invalid origin."},{status:403});
 if(!await getAdminUser())return adminUnauthorized();
 try{
  const text=await request.text();if(text.length>300000)return NextResponse.json({error:"Content is too large."},{status:413});
  const input=JSON.parse(text),career=validateCareer(input.career);
  await prisma.$transaction(async tx=>{
   await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${career.slug}))::text AS locked`;
   const rows=await tx.$queryRaw<{updated_at:Date}[]>`SELECT updated_at FROM career_library.careers WHERE slug=${career.slug}`;
   if(rows.length&&!input.expectedUpdatedAt)throw Error("This slug already exists. Open its editor to update it.");
   if(rows.length&&new Date(input.expectedUpdatedAt).getTime()!==rows[0].updated_at.getTime())throw Error("This career changed since you opened it. Reload before saving.");
   if(!rows.length&&input.expectedUpdatedAt)throw Error("This career no longer exists.");
   await tx.$queryRaw(Prisma.sql`SELECT career_library.save_career(${JSON.stringify(career)}::jsonb)::text AS saved`);
  },{timeout:30000});
  revalidateTag(CAREER_CACHE_TAG,"max");
  return NextResponse.json({slug:career.slug});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Could not save career."},{status:400});}
}

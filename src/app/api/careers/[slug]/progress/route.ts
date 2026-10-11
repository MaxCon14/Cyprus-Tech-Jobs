import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCareer, withLearner, readProgress, setProgress } from "@/lib/careers/queries";
import type { Progress, ProgressKind } from "@/lib/careers/types";
export const dynamic = "force-dynamic";
const fail = (error:string,status:number) => NextResponse.json({error},{status});
async function context(slug:string) {
 const supabase = await createSupabaseServerClient();
 const {data:{user}} = await supabase.auth.getUser();
 if(!user) return null;
 const career = await getCareer(slug);
 return career ? {user,career} : null;
}
export async function GET(_request:Request,{params}:{params:Promise<{slug:string}>}) {
 try {
  const ctx = await context((await params).slug);
  if(!ctx) return fail("Sign in to save progress.",401);
  const progress = await withLearner(ctx.user.id,tx=>readProgress(tx,ctx.user.id,ctx.career.slug));
  return NextResponse.json({userId:ctx.user.id,progress},{headers:{"Cache-Control":"private, no-store"}});
 } catch(error) {console.error("[career progress]",error);return fail("Progress is temporarily unavailable.",503);}
}
export async function PATCH(request:Request,{params}:{params:Promise<{slug:string}>}) {
 if(request.headers.get("origin")!==new URL(request.url).origin) return fail("Invalid request origin.",403);
 if(Number(request.headers.get("content-length")??0)>50000) return fail("Request too large.",413);
 try {
  const ctx = await context((await params).slug);
  if(!ctx) return fail("Sign in to save progress.",401);
  const body=await request.text();
  if(body.length>50000) return fail("Request too large.",413);
  const input=JSON.parse(body);
  const {career,user}=ctx;
  const allowed:Record<ProgressKind,Set<string>>={
   saved:new Set([career.slug]),stage:new Set(career.stages.map(s=>s.id)),
   task:new Set(career.stages.flatMap(s=>s.tasks.map(t=>t.id))),readiness:new Set(career.readiness.map(t=>t.id))
  };
  const changes:{kind:ProgressKind;id:string;value:boolean}[]=[];
  if(input.import) {
   const p=input.import as Progress;
   if(typeof p.saved!=="boolean" || ![p.stages,p.tasks,p.readiness].every(a=>Array.isArray(a)&&a.length<=300&&a.every(x=>typeof x==="string"))) return fail("Invalid progress.",400);
   if(p.saved) changes.push({kind:"saved",id:career.slug,value:true});
   for(const [key,kind] of [["stages","stage"],["tasks","task"],["readiness","readiness"]] as const)
    for(const id of new Set(p[key])) {if(!allowed[kind].has(id)) return fail("Unknown learning item.",400);changes.push({kind,id,value:true});}
  } else {
   const kind=input.kind as ProgressKind;
   if(!Object.hasOwn(allowed,kind)||typeof input.id!=="string"||typeof input.value!=="boolean"||!allowed[kind].has(input.id)) return fail("Invalid learning item.",400);
   changes.push({kind,id:input.id,value:input.value});
  }
  const progress = await withLearner(user.id,async tx=>{
   for(const change of changes) await setProgress(tx,user.id,change.kind,change.id,change.value);
   return readProgress(tx,user.id,career.slug);
  });
  return NextResponse.json({progress},{headers:{"Cache-Control":"private, no-store"}});
 } catch(error) {console.error("[career progress]",error);return fail("Could not save progress. Please retry.",500);}
}

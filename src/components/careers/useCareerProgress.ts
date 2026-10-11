"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { emptyProgress, type Progress, type ProgressKind } from "@/lib/careers/types";
export function useCareerProgress(slug:string) {
 const [progress,setProgress]=useState<Progress>(emptyProgress);
 const [userId,setUserId]=useState<string|null>(null);
 const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [hasLocal,setHasLocal]=useState(false);
 const generation=useRef(0),lock=useRef(false);
 const key="career-progress-v1:"+slug;
 const local=useCallback(():Progress=>{
  try{
   const x=JSON.parse(localStorage.getItem(key)??"null");
   return x&&typeof x.saved==="boolean"&&[x.stages,x.tasks,x.readiness].every(a=>Array.isArray(a)&&a.every((v:unknown)=>typeof v==="string"))?x:emptyProgress();
  }catch{return emptyProgress();}
 },[key]);
 const load=useCallback(async()=>{
  const ticket=++generation.current;
  setReady(false);setError("");setNotice("");
  try {
   const res=await fetch("/api/careers/"+slug+"/progress",{cache:"no-store"});
   if(ticket!==generation.current)return;
   if(res.status===401){setUserId(null);setProgress(local());setReady(true);return;}
   if(!res.ok)throw Error("Your saved progress could not be loaded. Retry before making changes.");
   const data=await res.json();
   if(ticket!==generation.current)return;
   setUserId(data.userId);setProgress(data.progress);setReady(true);
   const p=local();setHasLocal(p.saved||p.stages.length+p.tasks.length+p.readiness.length>0);
  }catch(e){if(ticket===generation.current)setError(e instanceof Error?e.message:"Progress could not be loaded.");}
 },[slug,local]);
 useEffect(()=>{
  void load();
  const supabase=createSupabaseBrowserClient();
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event)=>{if(event!=="INITIAL_SESSION")void load();});
  const onStorage=(event:StorageEvent)=>{if(event.key===key)void load();};
  window.addEventListener("storage",onStorage);
  return()=>{
   // This is a request generation counter, not a DOM ref; invalidate in-flight loads.
   // eslint-disable-next-line react-hooks/exhaustive-deps
   generation.current++;
   subscription.unsubscribe();window.removeEventListener("storage",onStorage);};
 },[load,key]);
 async function change(kind:ProgressKind,id:string,value:boolean) {
  if(!ready||lock.current)return;
  lock.current=true;setBusy(true);setError("");setNotice("");
  const ticket=generation.current,previous=progress;
  const field=kind==="stage"?"stages":kind==="task"?"tasks":"readiness";
  const next=kind==="saved"?{...progress,saved:value}:{...progress,[field]:value?[...new Set([...progress[field],id])]:progress[field].filter(x=>x!==id)};
  setProgress(next);
  try {
   if(!userId){localStorage.setItem(key,JSON.stringify(next));setNotice("Progress saved on this browser.");}
   else{
    const res=await fetch("/api/careers/"+slug+"/progress",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind,id,value})});
    if(!res.ok)throw Error("Could not save this change. Please retry.");
    const data=await res.json();if(ticket===generation.current){setProgress(data.progress);setNotice("Progress saved to your account.");}
   }
  }catch(e){if(ticket===generation.current){setProgress(previous);setError(e instanceof Error?e.message:"Could not save progress.");}}
  finally{lock.current=false;setBusy(false);}
 }
 async function importLocal(){
  if(lock.current||!userId||!ready)return;
  lock.current=true;setBusy(true);setError("");
  const ticket=generation.current;
  try{
   const res=await fetch("/api/careers/"+slug+"/progress",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({import:local()})});
   if(!res.ok)throw Error("Could not import browser progress. Please retry.");
   const data=await res.json();if(ticket===generation.current){setProgress(data.progress);localStorage.removeItem(key);setHasLocal(false);setNotice("Browser progress added to your account.");}
  }catch(e){setError(e instanceof Error?e.message:"Import failed.");}
  finally{lock.current=false;setBusy(false);}
 }
 return {progress,userId,ready,busy,error,notice,hasLocal,change,importLocal,retry:load};
}

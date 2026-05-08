import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: candidate } = await supabaseAdmin
    .from("candidates").select("id").eq("email", user.email).single();
  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

  const { data } = await supabaseAdmin
    .from("applied_jobs")
    .select("jobId, appliedAt")
    .eq("candidateId", candidate.id)
    .order("appliedAt", { ascending: false });

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: candidate } = await supabaseAdmin
    .from("candidates").select("id").eq("email", user.email).single();
  if (!candidate) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

  let jobId: string;
  try {
    ({ jobId } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  await supabaseAdmin
    .from("applied_jobs")
    .upsert({ candidateId: candidate.id, jobId }, { onConflict: "candidateId,jobId" });

  return NextResponse.json({ ok: true });
}

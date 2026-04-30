import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function getCandidate() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const { data } = await supabaseAdmin
    .from("candidates")
    .select("id")
    .eq("email", user.email)
    .single();
  return data ?? null;
}

export async function GET() {
  const candidate = await getCandidate();
  if (!candidate) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("saved_jobs")
    .select("jobId")
    .eq("candidateId", candidate.id);

  if (error) return NextResponse.json({ error: "Failed to fetch." }, { status: 500 });
  return NextResponse.json({ savedJobIds: (data ?? []).map((r) => r.jobId) });
}

export async function POST(req: NextRequest) {
  const candidate = await getCandidate();
  if (!candidate) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ error: "jobId required." }, { status: 422 });

  const { error } = await supabaseAdmin
    .from("saved_jobs")
    .upsert({ candidateId: candidate.id, jobId }, { onConflict: "candidateId,jobId" });

  if (error) return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const candidate = await getCandidate();
  if (!candidate) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ error: "jobId required." }, { status: 422 });

  const { error } = await supabaseAdmin
    .from("saved_jobs")
    .delete()
    .eq("candidateId", candidate.id)
    .eq("jobId", jobId);

  if (error) return NextResponse.json({ error: "Failed to unsave." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

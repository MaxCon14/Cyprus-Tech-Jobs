import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: candidate } = await supabaseAdmin
    .from("candidates")
    .select("id")
    .eq("email", user.email)
    .single();

  if (!candidate) return NextResponse.json({ error: "Candidate not found." }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const title   = typeof body.title === "string" ? body.title.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  if (!title || !company) {
    return NextResponse.json({ error: "Title and company are required." }, { status: 422 });
  }

  const { data, error } = await supabaseAdmin
    .from("candidate_positions")
    .insert({
      candidateId: candidate.id,
      title,
      company,
      startDate:   typeof body.startDate === "string" ? body.startDate || null : null,
      endDate:     typeof body.endDate === "string" ? body.endDate || null : null,
      current:     body.current === true,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[candidates/positions POST]", error);
    return NextResponse.json({ error: "Failed to add position." }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

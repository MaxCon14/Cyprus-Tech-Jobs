import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface PositionDraft {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const candidateId = typeof body.candidateId === "string" ? body.candidateId.trim() : "";
  if (!candidateId) {
    return NextResponse.json({ error: "candidateId required." }, { status: 400 });
  }

  const { data: candidate } = await supabaseAdmin
    .from("candidates")
    .select("id")
    .eq("id", candidateId)
    .single();

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
  }

  const raw = Array.isArray(body.positions) ? body.positions : [];
  const positions = (raw as PositionDraft[])
    .slice(0, 10)
    .filter((p) => typeof p.title === "string" && p.title.trim() && typeof p.company === "string" && p.company.trim())
    .map((p) => ({
      candidateId,
      title:       p.title.trim(),
      company:     p.company.trim(),
      startDate:   typeof p.startDate === "string" && p.startDate ? p.startDate : null,
      endDate:     typeof p.endDate === "string" && p.endDate && !p.current ? p.endDate : null,
      current:     !!p.current,
      description: typeof p.description === "string" ? p.description.trim() || null : null,
    }));

  if (positions.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabaseAdmin.from("candidate_positions").insert(positions);
  if (error) {
    console.error("[positions-onboarding]", error);
    return NextResponse.json({ error: "Failed to save positions." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

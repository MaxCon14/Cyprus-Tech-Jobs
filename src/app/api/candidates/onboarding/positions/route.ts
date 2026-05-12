import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface PositionInput {
  title: string;
  company: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export async function POST(req: NextRequest) {
  let body: { candidateId?: string; positions?: PositionInput[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { candidateId, positions } = body;
  if (!candidateId || !Array.isArray(positions) || positions.length === 0) {
    return NextResponse.json({ ok: true }); // Nothing to insert — treat as success
  }

  // Validate the candidateId actually exists (prevents inserting against random IDs)
  const { data: candidate } = await supabaseAdmin
    .from("candidates")
    .select("id")
    .eq("id", candidateId)
    .single();

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
  }

  const rows = positions
    .filter((p) => typeof p.title === "string" && p.title.trim() && typeof p.company === "string" && p.company.trim())
    .map((p) => ({
      candidateId,
      title:       p.title.trim(),
      company:     p.company.trim(),
      startDate:   typeof p.startDate === "string" && p.startDate ? p.startDate : null,
      endDate:     typeof p.endDate === "string" && p.endDate && !p.current ? p.endDate : null,
      current:     p.current === true,
      description: typeof p.description === "string" ? p.description.trim() || null : null,
    }));

  if (rows.length === 0) return NextResponse.json({ ok: true });

  const { error } = await supabaseAdmin.from("candidate_positions").insert(rows);
  if (error) {
    console.error("[onboarding/positions]", error);
    return NextResponse.json({ error: "Failed to save positions." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: rows.length });
}

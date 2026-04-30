import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;

  // Ensure the position belongs to this candidate
  const { data: candidate } = await supabaseAdmin
    .from("candidates")
    .select("id")
    .eq("email", user.email)
    .single();

  if (!candidate) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { error } = await supabaseAdmin
    .from("candidate_positions")
    .delete()
    .eq("id", id)
    .eq("candidateId", candidate.id);

  if (error) return NextResponse.json({ error: "Failed to delete position." }, { status: 500 });

  return NextResponse.json({ ok: true });
}

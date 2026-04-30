import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Only allow explicit profile fields to be updated
  const allowed = [
    "firstName", "lastName", "headline", "bio",
    "avatarUrl", "portfolioUrl", "githubUrl", "linkedinUrl",
    "dribbbleUrl", "behanceUrl", "twitterUrl", "mediumUrl", "cvUrl",
    "city", "remoteType", "experienceLevel", "salaryMin",
    "openToWork", "categories", "skills", "alertFrequency",
  ];

  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key] ?? null;
  }

  const { error } = await supabaseAdmin
    .from("candidates")
    .update(patch)
    .eq("email", user.email);

  if (error) {
    console.error("[candidates/profile PATCH]", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

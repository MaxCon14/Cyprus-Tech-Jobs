import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Valid email is required." }, { status: 422 });
  }

  // Return existing candidate if already signed up
  const { data: existing } = await supabaseAdmin
    .from("candidates")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return NextResponse.json({ candidateId: existing.id, exists: true });
  }

  const { data, error } = await supabaseAdmin
    .from("candidates")
    .insert({
      email,
      firstName:       typeof body.firstName === "string" ? body.firstName.trim() || null : null,
      lastName:        typeof body.lastName === "string" ? body.lastName.trim() || null : null,
      remoteType:      typeof body.remoteType === "string" && body.remoteType ? body.remoteType : null,
      city:            typeof body.city === "string" && body.city ? body.city.trim() : null,
      experienceLevel: typeof body.experienceLevel === "string" && body.experienceLevel ? body.experienceLevel : null,
      salaryMin:       typeof body.salaryMin === "number" && body.salaryMin > 0 ? body.salaryMin : null,
      categories:      Array.isArray(body.categories) ? body.categories : [],
      alertFrequency:  body.alertFrequency === "DAILY" ? "DAILY" : "WEEKLY",
      bio:             typeof body.bio === "string" ? body.bio.trim() || null : null,
      avatarUrl:       typeof body.avatarUrl === "string" ? body.avatarUrl.trim() || null : null,
      skills:          Array.isArray(body.skills) ? body.skills.slice(0, 10) : [],
      githubUrl:       typeof body.githubUrl === "string" ? body.githubUrl.trim() || null : null,
      linkedinUrl:     typeof body.linkedinUrl === "string" ? body.linkedinUrl.trim() || null : null,
      portfolioUrl:    typeof body.portfolioUrl === "string" ? body.portfolioUrl.trim() || null : null,
      dribbbleUrl:     typeof body.dribbbleUrl === "string" ? body.dribbbleUrl.trim() || null : null,
      behanceUrl:      typeof body.behanceUrl === "string" ? body.behanceUrl.trim() || null : null,
      twitterUrl:      typeof body.twitterUrl === "string" ? body.twitterUrl.trim() || null : null,
      mediumUrl:       typeof body.mediumUrl === "string" ? body.mediumUrl.trim() || null : null,
      cvUrl:           typeof body.cvUrl === "string" ? body.cvUrl.trim() || null : null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[candidates/onboarding]", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ candidateId: data.id }, { status: 201 });
}

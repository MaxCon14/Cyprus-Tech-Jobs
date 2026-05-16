import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notifyGoogle } from "@/lib/google-indexing";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await params;

  const employer = await prisma.employer.findUnique({
    where:   { email: user.email },
    include: { company: true },
  });
  if (!employer?.company) {
    return NextResponse.json({ error: "Employer not found." }, { status: 404 });
  }

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job || job.companyId !== employer.company.id) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  if (job.status !== "ACTIVE" && job.status !== "PAUSED") {
    return NextResponse.json(
      { error: "Only active or paused listings can be toggled." },
      { status: 400 },
    );
  }

  const newStatus = job.status === "ACTIVE" ? "PAUSED" : "ACTIVE";

  const updated = await prisma.job.update({
    where:  { id },
    data:   { status: newStatus as never },
    select: { slug: true },
  });

  // ACTIVE → tell Google the page is live; PAUSED → remove from Jobs results
  void notifyGoogle(updated.slug, newStatus === "ACTIVE" ? "URL_UPDATED" : "URL_DELETED");

  return NextResponse.json({ status: newStatus });
}

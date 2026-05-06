import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

const VALID_STATUSES = ["PENDING", "SHORTLISTED", "ACCEPTED", "REJECTED"];

type Params = { params: Promise<{ appId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { appId } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorised." }, { status: 401 });

  const employer = await prisma.employer.findUnique({
    where: { email: user.email },
    select: { id: true },
  });
  if (!employer) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const status = typeof body.status === "string" ? body.status : null;
  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 422 });
  }

  // Fetch app to get its jobId
  const { data: app } = await supabaseAdmin
    .from("job_applications")
    .select("id, jobId")
    .eq("id", appId)
    .single();

  if (!app) return NextResponse.json({ error: "Not found." }, { status: 404 });

  // Verify job belongs to this employer's company
  const job = await prisma.job.findFirst({
    where: {
      id: app.jobId,
      company: { employers: { some: { email: user.email } } },
    },
    select: { id: true },
  });
  if (!job) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { error } = await supabaseAdmin
    .from("job_applications")
    .update({ status })
    .eq("id", appId);

  if (error) return NextResponse.json({ error: "Something went wrong." }, { status: 500 });

  return NextResponse.json({ ok: true });
}

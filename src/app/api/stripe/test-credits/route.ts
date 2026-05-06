import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Development-only endpoint — blocked in production
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const employer = await prisma.employer.findUnique({ where: { email: user.email } });
  if (!employer) {
    return NextResponse.json({ error: "Employer account not found." }, { status: 403 });
  }

  let body: { standardQty?: number; featuredQty?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const standardQty = Math.max(0, Math.floor(body.standardQty ?? 0));
  const featuredQty = Math.max(0, Math.floor(body.featuredQty ?? 0));

  if (standardQty === 0 && featuredQty === 0) {
    return NextResponse.json({ error: "Select at least one listing." }, { status: 422 });
  }

  const updated = await prisma.employer.update({
    where: { id: employer.id },
    data: {
      ...(standardQty > 0 ? { standardCredits: { increment: standardQty } } : {}),
      ...(featuredQty > 0 ? { featuredCredits: { increment: featuredQty } } : {}),
    },
  });

  return NextResponse.json({
    ok: true,
    standardCredits: updated.standardCredits,
    featuredCredits: updated.featuredCredits,
  });
}

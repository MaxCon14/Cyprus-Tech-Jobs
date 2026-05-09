import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employer = await prisma.employer.findUnique({
    where: { email: user.email },
    select: { standardSlots: true, featuredSlots: true },
  });

  if (!employer) {
    return NextResponse.json({ error: "Not an employer" }, { status: 404 });
  }

  return NextResponse.json({
    standardSlots: employer.standardSlots,
    featuredSlots: employer.featuredSlots,
  });
}

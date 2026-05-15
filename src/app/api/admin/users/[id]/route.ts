import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAdminUser, adminUnauthorized } from "@/lib/admin-auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await getAdminUser()) return adminUnauthorized();
  const { id } = await params;
  const { type, blocked } = await req.json();

  if (type === "employer") {
    await prisma.employer.update({ where: { id }, data: { blocked } });
  } else {
    await supabaseAdmin.from("candidates").update({ blocked }).eq("id", id);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!await getAdminUser()) return adminUnauthorized();
  const { id } = await params;
  const { type } = await req.json();

  if (type === "employer") {
    await prisma.employer.delete({ where: { id } });
  } else {
    // Delete candidate data + Supabase auth user
    const { data: candidate } = await supabaseAdmin.from("candidates").select("email").eq("id", id).single();
    await supabaseAdmin.from("candidates").delete().eq("id", id);
    // Try to delete auth user too (id may be the auth uid)
    await supabaseAdmin.auth.admin.deleteUser(id).catch(() => null);
    if (candidate?.email) {
      // Also clean up job applications
      await supabaseAdmin.from("job_applications").delete().eq("candidateId", id);
    }
  }
  return NextResponse.json({ ok: true });
}

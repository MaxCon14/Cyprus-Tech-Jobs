import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.applyClick.create({ data: { jobId: id } });
  } catch {
    // Silently ignore if job doesn't exist (deleted mid-session)
  }
  return NextResponse.json({ ok: true });
}

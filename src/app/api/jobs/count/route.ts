import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ExperienceLevel, RemoteType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const categoryId      = searchParams.get("category") ?? undefined;
  const remoteType      = searchParams.get("type") as RemoteType | null;
  const city            = searchParams.get("city") ?? undefined;
  const experienceLevel = searchParams.get("level") as ExperienceLevel | null;

  const count = await prisma.job.count({
    where: {
      status: "ACTIVE",
      ...(categoryId      && { categoryId }),
      ...(remoteType      && { remoteType }),
      ...(city            && { city: { contains: city, mode: "insensitive" } }),
      ...(experienceLevel && { experienceLevel }),
    },
  });

  return NextResponse.json({ count });
}

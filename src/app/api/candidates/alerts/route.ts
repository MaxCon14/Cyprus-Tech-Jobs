import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user.email.toLowerCase();

  const alerts = await prisma.jobAlert.findMany({
    where:   { email },
    orderBy: { createdAt: "desc" },
  });

  // Resolve company names for company-specific alerts
  const companyIds = [...new Set(alerts.map(a => a.companyId).filter(Boolean) as string[])];
  const companies  = companyIds.length
    ? await prisma.company.findMany({
        where:  { id: { in: companyIds } },
        select: { id: true, name: true, slug: true },
      })
    : [];
  const companyMap = Object.fromEntries(companies.map(c => [c.id, c]));

  // Resolve category names for category-specific alerts
  const categorySlugs = [...new Set(alerts.map(a => a.categoryId).filter(Boolean) as string[])];
  const categories    = categorySlugs.length
    ? await prisma.category.findMany({
        where:  { slug: { in: categorySlugs } },
        select: { slug: true, name: true },
      })
    : [];
  const categoryMap = Object.fromEntries(categories.map(c => [c.slug, c]));

  const result = alerts.map(a => ({
    id:            a.id,
    alertFrequency: a.alertFrequency,
    createdAt:     a.createdAt,
    // Company alert
    companyId:     a.companyId,
    companyName:   a.companyId ? (companyMap[a.companyId]?.name ?? null) : null,
    companySlug:   a.companyId ? (companyMap[a.companyId]?.slug ?? null) : null,
    // Category alert
    categoryId:    a.categoryId,
    categoryName:  a.categoryId ? (categoryMap[a.categoryId]?.name ?? null) : null,
    // Other filters
    remoteType:    a.remoteType,
    city:          a.city,
  }));

  return NextResponse.json(result);
}

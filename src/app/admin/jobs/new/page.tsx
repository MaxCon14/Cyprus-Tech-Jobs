import { PageHeading } from "../../_components/AdminUI";
import { prisma } from "@/lib/prisma";
import { TECH_STACK_OPTIONS } from "@/lib/onboarding-types";
import { AdminJobForm } from "../../_components/AdminJobForm";

export const dynamic = "force-dynamic";

export default async function AdminJobNewPage() {
  const [categories, allTagRows] = await Promise.all([
    prisma.category.findMany({
      where:   { parentId: null },
      orderBy: { name: "asc" },
      include: { children: { orderBy: { name: "asc" }, select: { id: true, name: true } } },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
  ]);

  return (
    <div>
      <PageHeading eyebrow="Grow your job board" title="Add a job" description="Import a posting or build a curated listing. Review the details before publishing." />
      <AdminJobForm categories={categories} allTags={[...new Set([...TECH_STACK_OPTIONS, ...allTagRows.map(t => t.name)])]} />
    </div>
  );
}

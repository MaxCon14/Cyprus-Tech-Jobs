import { prisma } from "./prisma";

// ─── Jobs ──────────────────────────────────────────────────────

export async function getJobs({
  categorySlug,
  remoteType,
  experienceLevel,
  city,
  search,
  take = 20,
  skip = 0,
}: {
  categorySlug?: string;
  remoteType?: string;
  experienceLevel?: string;
  city?: string;
  search?: string;
  take?: number;
  skip?: number;
} = {}) {
  return prisma.job.findMany({
    where: {
      status: "ACTIVE",
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(remoteType   && { remoteType: remoteType as never }),
      ...(experienceLevel && { experienceLevel: experienceLevel as never }),
      ...(city         && { city: { contains: city, mode: "insensitive" } }),
      ...(search       && {
        OR: [
          { title:       { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { company:     { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
    },
    include: {
      company:  true,
      category: true,
      tags:     { include: { tag: true } },
    },
    orderBy: [
      { featured: "desc" },
      { postedAt: "desc" },
    ],
    take,
    skip,
  });
}

export async function getJobBySlug(slug: string) {
  return prisma.job.findUnique({
    where: { slug },
    include: {
      company:  true,
      category: true,
      tags:     { include: { tag: true } },
    },
  });
}

export async function getFeaturedJobs(take = 5) {
  return prisma.job.findMany({
    where: { status: "ACTIVE", featured: true },
    include: { company: true, category: true, tags: { include: { tag: true } } },
    orderBy: { postedAt: "desc" },
    take,
  });
}

export async function getJobCount(categorySlug?: string) {
  return prisma.job.count({
    where: {
      status: "ACTIVE",
      ...(categorySlug && { category: { slug: categorySlug } }),
    },
  });
}

export async function getSimilarJobs(jobId: string, categoryId: string, take = 3) {
  return prisma.job.findMany({
    where: { status: "ACTIVE", categoryId, id: { not: jobId } },
    include: { company: true, category: true, tags: { include: { tag: true } } },
    orderBy: { postedAt: "desc" },
    take,
  });
}

// ─── Employer dashboard ────────────────────────────────────────

export async function getEmployerWithCompanyAndJobs(email: string) {
  return prisma.employer.findUnique({
    where: { email },
    include: {
      company: {
        include: {
          jobs: {
            include: {
              category: true,
              tags: { include: { tag: true } },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });
}

// ─── Companies ─────────────────────────────────────────────────

export async function getCompanies({ featured }: { featured?: boolean } = {}) {
  return prisma.company.findMany({
    where:   { ...(featured !== undefined && { featured }) },
    include: { _count: { select: { jobs: { where: { status: "ACTIVE" } } } } },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
}

export async function getCompanyBySlug(slug: string) {
  return prisma.company.findUnique({
    where:   { slug },
    include: {
      jobs: {
        where:   { status: "ACTIVE" },
        include: { category: true, tags: { include: { tag: true } } },
        orderBy: { postedAt: "desc" },
      },
      _count: { select: { jobs: { where: { status: "ACTIVE" } } } },
    },
  });
}

// ─── Categories ────────────────────────────────────────────────

export async function getCategoriesWithCount() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { jobs: { where: { status: "ACTIVE" } } } } },
    orderBy: { name: "asc" },
  });

  const total = await getJobCount();

  return [
    { label: "All jobs", slug: "", count: total },
    ...categories.map(c => ({
      label: c.name,
      slug:  c.slug,
      count: c._count.jobs,
    })),
  ];
}

// ─── Job alerts ────────────────────────────────────────────────

export async function createJobAlert({
  email,
  categoryId,
  remoteType,
  city,
}: {
  email: string;
  categoryId?: string;
  remoteType?: string;
  city?: string;
}) {
  return prisma.jobAlert.upsert({
    where: {
      email_categoryId_remoteType: {
        email,
        categoryId: categoryId ?? "",
        remoteType: (remoteType ?? "") as never,
      },
    },
    update: {},
    create: {
      email,
      categoryId: categoryId ?? undefined,
      remoteType: remoteType as never | undefined,
      city,
    },
  });
}

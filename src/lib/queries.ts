import { prisma } from "./prisma";

// ─── Jobs ──────────────────────────────────────────────────────

export async function getJobs({
  categorySlug,
  remoteType,
  experienceLevel,
  city,
  search,
  salary,
  take = 20,
  skip = 0,
}: {
  categorySlug?: string;
  remoteType?: string;
  experienceLevel?: string;
  city?: string;
  search?: string;
  salary?: number;
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
      ...(salary       && { salaryMin: { gte: salary } }),
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

export async function getJobCount({
  categorySlug,
  remoteType,
  experienceLevel,
  city,
  search,
  salary,
}: {
  categorySlug?: string;
  remoteType?: string;
  experienceLevel?: string;
  city?: string;
  search?: string;
  salary?: number;
} = {}) {
  return prisma.job.count({
    where: {
      status: "ACTIVE",
      ...(categorySlug    && { category: { slug: categorySlug } }),
      ...(remoteType      && { remoteType: remoteType as never }),
      ...(experienceLevel && { experienceLevel: experienceLevel as never }),
      ...(city            && { city: { contains: city, mode: "insensitive" } }),
      ...(salary          && { salaryMin: { gte: salary } }),
      ...(search          && {
        OR: [
          { title:       { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { company:     { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
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

export async function getJobById(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: { company: true, category: true, tags: { include: { tag: true } } },
  });
}

export async function getMatchingJobsForCandidate({
  remoteType,
  experienceLevel,
  categories,
}: {
  remoteType?:      string | null;
  experienceLevel?: string | null;
  categories?:      string[];
}, take = 3) {
  const hasCats = (categories ?? []).length > 0;
  const catFilter  = hasCats          ? { category: { slug: { in: categories! } } } : null;
  const expFilter  = experienceLevel  ? { experienceLevel: experienceLevel as never } : null;
  const remFilter  = remoteType       ? { remoteType: remoteType as never }           : null;

  // Priority waterfall: most specific → broadest
  const attempts = [
    catFilter && expFilter && remFilter ? { ...catFilter, ...expFilter, ...remFilter } : null,
    catFilter && expFilter              ? { ...catFilter, ...expFilter }               : null,
    catFilter && remFilter              ? { ...catFilter, ...remFilter }               : null,
    catFilter                           ? { ...catFilter }                             : null,
    expFilter && remFilter              ? { ...expFilter, ...remFilter }               : null,
    expFilter                           ? { ...expFilter }                             : null,
    {},
  ].filter((f): f is object => f !== null);

  // Deduplicate (e.g. when some signals are null, steps collapse)
  const seen = new Set<string>();
  const steps = attempts.filter(f => {
    const key = JSON.stringify(f);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  for (const extra of steps) {
    const jobs = await prisma.job.findMany({
      where:   { status: "ACTIVE", ...extra },
      include: { company: true, category: true, tags: { include: { tag: true } } },
      orderBy: [{ featured: "desc" }, { postedAt: "desc" }],
      take,
    });
    if (jobs.length > 0) return jobs;
  }
  return [];
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
  const existing = await prisma.jobAlert.findFirst({
    where: {
      email,
      categoryId: categoryId ?? null,
      remoteType: (remoteType ?? null) as never,
      companyId:  null,
    },
  });
  if (existing) return existing;
  return prisma.jobAlert.create({
    data: {
      email,
      categoryId: categoryId ?? null,
      remoteType: (remoteType ?? null) as never,
      city: city ?? null,
      confirmed: true,
    },
  });
}

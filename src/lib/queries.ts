import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { CATEGORY_CACHE_TAG, type NavCategory } from "./taxonomy";

// ─── Jobs ──────────────────────────────────────────────────────

export async function getJobs({
  categorySlug,
  remoteType,
  employmentType,
  experienceLevel,
  city,
  skill,
  search,
  salary,
  take = 20,
  skip = 0,
}: {
  categorySlug?: string;
  /** Where the work happens: REMOTE | HYBRID | ON_SITE. */
  remoteType?: string;
  /** The contract: FULL_TIME | PART_TIME | CONTRACT | INTERNSHIP | FREELANCE.
   *  Distinct from remoteType — the two were previously conflated behind a
   *  single `type` query param, so asking for full-time work searched the
   *  remote column and matched nothing. */
  employmentType?: string;
  experienceLevel?: string;
  city?: string;
  /** A skill tag name, e.g. "React". Employers attach these when posting and
   *  the cards show them, but until now nothing could filter on them. */
  skill?: string;
  search?: string;
  salary?: number;
  take?: number;
  skip?: number;
} = {}) {
  return prisma.job.findMany({
    where: {
      status: "ACTIVE",
      // Match jobs assigned directly to this category OR to any of its children
      ...(categorySlug && {
        category: { OR: [{ slug: categorySlug }, { parent: { slug: categorySlug } }] },
      }),
      ...(remoteType   && { remoteType: remoteType as never }),
      ...(employmentType && { employmentType: employmentType as never }),
      ...(experienceLevel && { experienceLevel: experienceLevel as never }),
      ...(city         && { city: { contains: city, mode: "insensitive" } }),
      ...(skill        && { tags: { some: { tag: { name: { equals: skill, mode: "insensitive" } } } } }),
      ...(salary       && { salaryMin: { gte: salary } }),
      ...(search       && {
        OR: [
          { title:       { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { company:     { name: { contains: search, mode: "insensitive" } } },
          /* Curated listings have no Company row — the employer's name lives on
             the job itself. Without this, searching for a curated company found
             none of its jobs, which is every job an admin adds by hand. */
          { curatedCompanyName: { contains: search, mode: "insensitive" } },
        ],
      }),
    },
    // Explicit select: the listing only needs card fields. Crucially this
    // omits the large `description` body column (used only in the search
    // WHERE clause above, not selected) and the unused `category` relation,
    // shrinking each row and lowering server render / TTFB.
    select: {
      id:                 true,
      slug:               true,
      title:              true,
      city:               true,
      remoteType:         true,
      employmentType:     true,
      experienceLevel:    true,
      salaryMin:          true,
      salaryMax:          true,
      salaryCurrency:     true,
      salaryDisclosed:    true,
      featured:           true,
      isCurated:          true,
      curatedCompanyName: true,
      curatedCompanyLogoUrl: true,
      postedAt:           true,
      company: { select: { name: true, slug: true, logoUrl: true, website: true } },
      tags:    { select: { tag: { select: { name: true } } } },
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
  employmentType,
  experienceLevel,
  city,
  skill,
  search,
  salary,
}: {
  categorySlug?: string;
  remoteType?: string;
  employmentType?: string;
  experienceLevel?: string;
  city?: string;
  skill?: string;
  search?: string;
  salary?: number;
} = {}) {
  return prisma.job.count({
    where: {
      status: "ACTIVE",
      ...(categorySlug    && {
        category: { OR: [{ slug: categorySlug }, { parent: { slug: categorySlug } }] },
      }),
      ...(remoteType      && { remoteType: remoteType as never }),
      ...(employmentType  && { employmentType: employmentType as never }),
      ...(experienceLevel && { experienceLevel: experienceLevel as never }),
      ...(city            && { city: { contains: city, mode: "insensitive" } }),
      ...(skill           && { tags: { some: { tag: { name: { equals: skill, mode: "insensitive" } } } } }),
      ...(salary          && { salaryMin: { gte: salary } }),
      ...(search          && {
        OR: [
          { title:       { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { company:     { name: { contains: search, mode: "insensitive" } } },
          /* Curated listings have no Company row — the employer's name lives on
             the job itself. Without this, searching for a curated company found
             none of its jobs, which is every job an admin adds by hand. */
          { curatedCompanyName: { contains: search, mode: "insensitive" } },
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

/**
 * @param withAccount  Restrict to companies that have at least one registered
 *   employer. The public directory uses this so it lists companies that signed
 *   up, not seeded or imported rows. Curated (admin-listed) jobs never create a
 *   Company at all, so they cannot appear here by construction.
 */
export async function getCompanies(
  { featured, withAccount }: { featured?: boolean; withAccount?: boolean } = {},
) {
  return prisma.company.findMany({
    where: {
      ...(featured !== undefined && { featured }),
      ...(withAccount && { employers: { some: {} } }),
    },
    include: { _count: { select: { jobs: { where: { status: "ACTIVE" } } } } },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });
}

/** Slugs for the sitemap — directory members only, matching the index. */
export async function getCompanySlugs() {
  return prisma.company.findMany({
    where:  { employers: { some: {} } },
    select: { slug: true, updatedAt: true },
  });
}

export async function getCompanyBySlug(slug: string) {
  return prisma.company.findUnique({
    where:   { slug },
    include: {
      jobs: {
        where:   { status: "ACTIVE" },
        include: { category: true, tags: { include: { tag: true } } },
        orderBy: [{ featured: "desc" }, { postedAt: "desc" }],
      },
      _count: { select: { jobs: { where: { status: "ACTIVE" } } } },
    },
  });
}

// ─── Categories ────────────────────────────────────────────────

/**
 * The category tree for navigation: top-level categories with their children.
 *
 * Cached because the root layout renders it on every page and the taxonomy only
 * changes when an admin edits it — those routes revalidate CATEGORY_CACHE_TAG,
 * so an edit still appears immediately. Job counts are deliberately excluded:
 * they change with every posting and would either go stale here or make the
 * cache pointless. Pages that show counts call getCategoriesWithCount instead.
 */
const getNavCategoriesCached = unstable_cache(
  async (): Promise<NavCategory[]> =>
    prisma.category.findMany({
      where:   { parentId: null },
      select:  {
        slug:     true,
        name:     true,
        children: { select: { slug: true, name: true }, orderBy: { name: "asc" } },
      },
      orderBy: { name: "asc" },
    }),
  ["nav-categories"],
  { tags: [CATEGORY_CACHE_TAG], revalidate: 3600 },
);

/**
 * The nav renders on every page, including ones that do not otherwise touch the
 * database. A dropped connection should cost the menu, not the whole site, so
 * failure degrades to an empty tree.
 */
export async function getNavCategories(): Promise<NavCategory[]> {
  try {
    return await getNavCategoriesCached();
  } catch (err) {
    console.error("[queries] category tree unavailable:", err);
    return [];
  }
}

/** Resolve a submitted category slug. Callers reject an unknown slug rather
 *  than creating it: an invented category has no parent, so its jobs are
 *  invisible under every category page the site actually links to. */
export async function findCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function getCategoriesWithCount() {
  // Parallelize the two round-trips instead of awaiting them back-to-back.
  const [parents, total] = await Promise.all([
    prisma.category.findMany({
      where:   { parentId: null },
      include: {
        _count:   { select: { jobs: { where: { status: "ACTIVE" } } } },
        children: {
          include: { _count: { select: { jobs: { where: { status: "ACTIVE" } } } } },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    getJobCount(),
  ]);

  return [
    { id: "", label: "All jobs", slug: "", count: total, children: [] as { id: string; label: string; slug: string; count: number }[] },
    ...parents.map(p => ({
      id:       p.id,
      label:    p.name,
      slug:     p.slug,
      count:    p._count.jobs + p.children.reduce((s, c) => s + c._count.jobs, 0),
      children: p.children.map(c => ({ id: c.id, label: c.name, slug: c.slug, count: c._count.jobs })),
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

// Converts Prisma job rows into plain objects safe to pass as props.
// Prisma returns Date objects which can't cross the server→client boundary.

type PrismaJob = {
  id: string;
  slug: string;
  title: string;
  city: string | null;
  remoteType: string;
  employmentType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  salaryDisclosed: boolean;
  featured: boolean;
  isCurated: boolean;
  curatedCompanyName: string | null;
  postedAt: Date | null;
  company: { name: string; slug: string; logoUrl: string | null; website: string | null; description?: string | null } | null;
  tags: { tag: { name: string } }[];
};

export function serialiseJob(job: PrismaJob) {
  const companyName = job.company?.name ?? job.curatedCompanyName ?? "";
  return {
    id:                 job.id,
    slug:               job.slug,
    title:              job.title,
    city:               job.city,
    remoteType:         job.remoteType,
    employmentType:     job.employmentType,
    experienceLevel:    job.experienceLevel,
    salaryMin:          job.salaryMin,
    salaryMax:          job.salaryMax,
    salaryCurrency:     job.salaryCurrency,
    salaryDisclosed:    job.salaryDisclosed,
    featured:           job.featured,
    isCurated:          job.isCurated,
    curatedCompanyName: job.curatedCompanyName,
    postedAt:           job.postedAt?.toISOString() ?? null,
    company: {
      name:        companyName,
      slug:        job.company?.slug ?? "",
      logoUrl:     job.company?.logoUrl ?? null,
      website:     job.company?.website ?? null,
      description: job.company?.description ?? null,
    },
    tags: job.tags.map(t => ({ name: t.tag.name })),
  };
}

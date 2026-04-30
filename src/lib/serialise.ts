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
  featured: boolean;
  postedAt: Date | null;
  company: { name: string; slug: string; logoUrl: string | null; website: string | null };
  tags: { tag: { name: string } }[];
};

export function serialiseJob(job: PrismaJob) {
  return {
    id:             job.id,
    slug:           job.slug,
    title:          job.title,
    city:           job.city,
    remoteType:     job.remoteType,
    employmentType: job.employmentType,
    experienceLevel:job.experienceLevel,
    salaryMin:      job.salaryMin,
    salaryMax:      job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    featured:       job.featured,
    postedAt:       job.postedAt?.toISOString() ?? null,
    company: {
      name:    job.company.name,
      slug:    job.company.slug,
      logoUrl: job.company.logoUrl,
      website: job.company.website,
    },
    tags: job.tags.map(t => ({ name: t.tag.name })),
  };
}

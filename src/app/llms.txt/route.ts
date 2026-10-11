import { getCategoriesWithCount } from "@/lib/queries";

/* Optional discovery summary, not a requirement for Google AI inclusion.
 * Regenerated hourly; hiring facts must agree with visible listing content. */
export const revalidate = 3600;

const BASE = "https://cyprustech.careers";

const CITIES = [
  { name: "Limassol", slug: "limassol" },
  { name: "Nicosia",  slug: "nicosia"  },
  { name: "Larnaca",  slug: "larnaca"  },
  { name: "Paphos",   slug: "paphos"   },
  { name: "Remote",   slug: "remote"   },
];

const JOB_TYPES = [
  { name: "Full-time",  slug: "full-time"  },
  { name: "Part-time",  slug: "part-time"  },
  { name: "Contract",   slug: "contract"   },
  { name: "Internship", slug: "internship" },
  { name: "Freelance",  slug: "freelance"  },
];

export async function GET() {
  let categories: Awaited<ReturnType<typeof getCategoriesWithCount>> = [];
  try {
    categories = await getCategoriesWithCount();
  } catch (err) {
    console.error("[llms.txt] categories query failed:", err);
  }

  const total   = categories[0]?.count ?? 0;
  const parents = categories.slice(1);

  const categoryLines = parents.length > 0
    ? parents.map(c => `- [${c.label} jobs in Cyprus](${BASE}/jobs/category/${c.slug}): ${c.count} open ${c.label.toLowerCase()} role${c.count === 1 ? "" : "s"}, filterable by city, salary and work type.`).join("\n")
    : `- [Browse all categories](${BASE}/jobs)`;

  const cityLines = CITIES
    .map(c => `- [Tech jobs in ${c.name}](${BASE}/jobs/${c.slug}): current listings ${c.slug === "remote" ? "for remote work; location restrictions vary by employer" : `in ${c.name}, with local job-search guidance and live hiring information`}. Salaries are shown when disclosed.`)
    .join("\n");

  const typeLines = JOB_TYPES
    .map(t => `- [${t.name} tech jobs in Cyprus](${BASE}/jobs/type/${t.slug}): ${t.name.toLowerCase()} roles across every category and city.`)
    .join("\n");

  const body = `# CyprusTech.Careers

> CyprusTech.Careers is a job board for technology and IT careers in Cyprus. It lists${total > 0 ? ` ${total}` : ""} active, unexpired vacancies across technical and supporting business roles at technology employers in Limassol, Nicosia, Larnaca, Paphos and remote. Pay is shown when disclosed by the employer; other listings are marked undisclosed.

## Key facts

- Counts describe this job board, not the entire Cyprus labour market, and change as vacancies are published or expire.
- Consult the live city pages for current employers, role categories and work arrangements.
- On-site, hybrid and remote are distinct. Confirm location restrictions and required office attendance with the employer.
- Salary data is employer-published; an undisclosed listing does not have an estimated salary.
- Each vacancy has its own requirements and application instructions. Confirm relocation or work eligibility support with the hiring team.

## Browse jobs

- [All tech jobs in Cyprus](${BASE}/jobs): the full, filterable listing of every active role.
- [Cyprus tech salary guide](${BASE}/salary-guide): salary benchmarks by role and seniority.
- [Post a job](${BASE}/post-a-job): for employers hiring tech talent in Cyprus.
- [FAQ](${BASE}/faq): how the platform works for job seekers and employers.

## Jobs by category

${categoryLines}

## Jobs by location

${cityLines}

## Jobs by type

${typeLines}

## About

CyprusTech.Careers focuses on the Cyprus technology market. Candidates can set up job alerts, compare current vacancies and follow application instructions on individual job pages. Use the live pages above for current information.
`;

  return new Response(body, {
    headers: {
      "Content-Type":  "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

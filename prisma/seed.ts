import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CyprusTech.Jobs database…\n");

  // ─── Categories ───────────────────────────────────────────
  console.log("Creating categories…");
  const categories = await Promise.all([
    { name: "Frontend",  slug: "frontend"  },
    { name: "Backend",   slug: "backend"   },
    { name: "DevOps",    slug: "devops"    },
    { name: "Design",    slug: "design"    },
    { name: "Data",      slug: "data"      },
    { name: "Mobile",    slug: "mobile"    },
    { name: "Product",   slug: "product"   },
    { name: "Security",  slug: "security"  },
    { name: "QA",        slug: "qa"        },
    { name: "Full Stack",slug: "full-stack"},
  ].map(c =>
    prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    })
  ));

  const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]));
  console.log(`  ✓ ${categories.length} categories\n`);

  // ─── Tags ─────────────────────────────────────────────────
  console.log("Creating tags…");
  const tagNames = [
    "React", "TypeScript", "Next.js", "Vue", "Angular", "Svelte",
    "Node.js", "Python", "Go", "Java", "Kotlin", "Swift", "Rust", "C++",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
    "AWS", "GCP", "Azure", "Kubernetes", "Docker", "Terraform", "Ansible",
    "GraphQL", "REST", "gRPC", "Kafka", "RabbitMQ",
    "Figma", "Design Systems", "Prototyping", "User Research",
    "dbt", "Spark", "Airflow", "BigQuery", "Snowflake",
    "React Native", "Flutter", "iOS", "Android",
    "SAST", "OWASP", "Penetration Testing",
    "Agile", "Scrum", "Product Strategy",
  ];

  const tags = await Promise.all(
    tagNames.map(name =>
      prisma.tag.upsert({
        where: { slug: slugify(name) },
        update: {},
        create: { name, slug: slugify(name) },
      })
    )
  );
  const tagMap = Object.fromEntries(tags.map(t => [t.name, t.id]));
  console.log(`  ✓ ${tags.length} tags\n`);

  // ─── Companies ────────────────────────────────────────────
  console.log("Creating companies…");
  const companiesData = [
    {
      name: "Revolut",
      slug: "revolut",
      website: "revolut.com",
      city: "Limassol",
      verified: true,
      featured: true,
      description:
        "Revolut is a global fintech company offering banking, payments, and financial services. Their Cyprus hub is a major engineering centre focused on payments infrastructure, growth, and financial crime prevention.",
    },
    {
      name: "Wargaming",
      slug: "wargaming",
      website: "wargaming.net",
      city: "Nicosia",
      verified: true,
      featured: true,
      description:
        "Wargaming is a global gaming company best known for World of Tanks. Their Nicosia studio is one of their largest, working on core game development, backend services, and live operations.",
    },
    {
      name: "XM Group",
      slug: "xm-group",
      website: "xm.com",
      city: "Limassol",
      verified: true,
      featured: false,
      description:
        "XM is a global forex and CFD broker headquartered in Limassol. Their technology team builds trading platforms, risk systems, and data infrastructure for millions of active traders.",
    },
    {
      name: "eToro",
      slug: "etoro",
      website: "etoro.com",
      city: "Limassol",
      verified: true,
      featured: true,
      description:
        "eToro is the world's leading social trading platform. Their Cyprus team works on investment products, crypto infrastructure, and the platform used by 35 million users globally.",
    },
    {
      name: "Exness",
      slug: "exness",
      website: "exness.com",
      city: "Limassol",
      verified: true,
      featured: false,
      description:
        "Exness is a global forex broker with one of the highest trading volumes in the industry. Their Limassol tech hub builds high-performance trading infrastructure, data platforms, and internal tooling.",
    },
    {
      name: "Cablenet",
      slug: "cablenet",
      website: "cablenet.com.cy",
      city: "Nicosia",
      verified: true,
      featured: false,
      description:
        "Cablenet is Cyprus's leading telecommunications provider, offering broadband, TV, and mobile services. Their tech team builds billing systems, network management tools, and customer platforms.",
    },
    {
      name: "Riskified",
      slug: "riskified",
      website: "riskified.com",
      city: "Limassol",
      verified: false,
      featured: false,
      description:
        "Riskified is an eCommerce fraud prevention platform that uses machine learning to help merchants grow revenue safely. Their Cyprus office focuses on ML engineering and data science.",
    },
    {
      name: "Veracode",
      slug: "veracode",
      website: "veracode.com",
      city: "Limassol",
      verified: false,
      featured: false,
      description:
        "Veracode is a leading application security company. Their Cyprus team works on static analysis tools, developer security tooling, and cloud-based security testing infrastructure.",
    },
  ];

  const companies = await Promise.all(
    companiesData.map(co =>
      prisma.company.upsert({
        where: { slug: co.slug },
        update: co,
        create: co,
      })
    )
  );
  const coMap = Object.fromEntries(companies.map(c => [c.slug, c.id]));
  console.log(`  ✓ ${companies.length} companies\n`);

  // ─── Jobs ─────────────────────────────────────────────────
  console.log("Creating jobs…");

  const jobsData = [
    {
      slug: "senior-product-designer-revolut",
      title: "Senior Product Designer — Growth",
      description: `We're looking for a Senior Product Designer to join our Growth team in Limassol. You'll own end-to-end design for acquisition, activation, and monetisation flows used by millions of customers globally.

**What you'll do**
- Own the full design process from discovery through to shipped product
- Work closely with PMs, engineers, and data analysts to identify opportunities
- Maintain and evolve the Revolut design system
- Run user research and usability tests

**What we're looking for**
- 5+ years of product design experience, ideally in fintech or consumer tech
- A portfolio showing end-to-end product thinking, not just polished screens
- Strong Figma skills and experience with design systems at scale
- Comfortable with data — you use metrics to inform and validate decisions`,
      salaryMin: 75000,
      salaryMax: 95000,
      city: "Limassol",
      remoteType: "HYBRID" as const,
      employmentType: "FULL_TIME" as const,
      experienceLevel: "SENIOR" as const,
      featured: true,
      status: "ACTIVE" as const,
      applyUrl: "https://revolut.com/careers",
      postedAt: new Date(Date.now() - 2 * 3_600_000),
      expiresAt: new Date(Date.now() + 28 * 86_400_000),
      companySlug: "revolut",
      categorySlug: "design",
      tags: ["Figma", "Design Systems", "Prototyping", "User Research"],
    },
    {
      slug: "staff-frontend-engineer-wargaming",
      title: "Staff Frontend Engineer (React)",
      description: `Wargaming is looking for a Staff Frontend Engineer to lead the web platform team in Nicosia. You'll set technical direction for the frontend across multiple game titles.

**What you'll do**
- Define frontend architecture and coding standards across teams
- Lead a team of 6 senior frontend engineers
- Drive performance optimisation initiatives

**What we're looking for**
- 8+ years of frontend engineering experience
- Deep expertise in React and TypeScript
- Experience leading teams or acting as a technical lead`,
      salaryMin: 85000,
      salaryMax: 120000,
      city: "Nicosia",
      remoteType: "ON_SITE" as const,
      employmentType: "FULL_TIME" as const,
      experienceLevel: "LEAD" as const,
      featured: false,
      status: "ACTIVE" as const,
      applyUrl: "https://wargaming.com/careers",
      postedAt: new Date(Date.now() - 5 * 3_600_000),
      expiresAt: new Date(Date.now() + 25 * 86_400_000),
      companySlug: "wargaming",
      categorySlug: "frontend",
      tags: ["React", "TypeScript"],
    },
    {
      slug: "devops-engineer-xm-group",
      title: "DevOps Engineer — Platform",
      description: `XM Group is hiring a DevOps Engineer to join the Platform team. You'll work on the infrastructure that powers XM's trading platform, serving millions of active traders.

**What you'll do**
- Manage and scale Kubernetes clusters across multiple cloud regions
- Build and maintain CI/CD pipelines
- Implement infrastructure as code with Terraform

**What we're looking for**
- 3+ years of DevOps or SRE experience
- Solid Kubernetes and Docker knowledge
- Experience with Terraform or similar IaC tools`,
      salaryMin: 55000,
      salaryMax: 75000,
      city: "Limassol",
      remoteType: "REMOTE" as const,
      employmentType: "FULL_TIME" as const,
      experienceLevel: "MID" as const,
      featured: false,
      status: "ACTIVE" as const,
      applyUrl: "https://xm.com/careers",
      postedAt: new Date(Date.now() - 24 * 3_600_000),
      expiresAt: new Date(Date.now() + 24 * 86_400_000),
      companySlug: "xm-group",
      categorySlug: "devops",
      tags: ["Kubernetes", "Terraform", "Docker", "AWS"],
    },
    {
      slug: "senior-backend-engineer-etoro",
      title: "Senior Backend Engineer (Python)",
      description: `eToro is looking for a Senior Backend Engineer to join our investments platform team. You'll build the systems that power stock, ETF, and crypto investing for 35 million users.

**What you'll do**
- Design and build high-throughput Python microservices
- Own services from design through deployment and monitoring
- Work with product and data teams to deliver new investment features

**What we're looking for**
- 5+ years of backend engineering experience
- Strong Python skills (FastAPI or Django)
- Experience with PostgreSQL and Redis`,
      salaryMin: 70000,
      salaryMax: 90000,
      city: "Limassol",
      remoteType: "HYBRID" as const,
      employmentType: "FULL_TIME" as const,
      experienceLevel: "SENIOR" as const,
      featured: false,
      status: "ACTIVE" as const,
      applyUrl: "https://etoro.com/careers",
      postedAt: new Date(Date.now() - 2 * 86_400_000),
      expiresAt: new Date(Date.now() + 22 * 86_400_000),
      companySlug: "etoro",
      categorySlug: "backend",
      tags: ["Python", "PostgreSQL", "Redis"],
    },
    {
      slug: "data-engineer-exness",
      title: "Data Engineer — Analytics Platform",
      description: `Exness is hiring a Data Engineer to join the Analytics Platform team. You'll build and maintain the data infrastructure that powers business intelligence and ML across the company.

**What you'll do**
- Build and maintain data pipelines using Spark and Airflow
- Develop dbt models and maintain our data warehouse
- Work with analysts and data scientists to deliver data products

**What we're looking for**
- 3+ years of data engineering experience
- Strong SQL and Python skills
- Experience with dbt, Spark, or Airflow`,
      salaryMin: 60000,
      salaryMax: 80000,
      city: "Limassol",
      remoteType: "HYBRID" as const,
      employmentType: "FULL_TIME" as const,
      experienceLevel: "MID" as const,
      featured: false,
      status: "ACTIVE" as const,
      applyUrl: "https://exness.com/careers",
      postedAt: new Date(Date.now() - 3 * 86_400_000),
      expiresAt: new Date(Date.now() + 21 * 86_400_000),
      companySlug: "exness",
      categorySlug: "data",
      tags: ["dbt", "Spark", "Airflow"],
    },
    {
      slug: "ios-engineer-revolut",
      title: "iOS Engineer — Consumer App",
      description: `Join Revolut's iOS team and build features used daily by millions of customers. You'll work on the core consumer app across payments, accounts, and new financial products.

**What you'll do**
- Build new features in Swift and SwiftUI
- Work closely with designers to deliver pixel-perfect experiences
- Write testable, performant code

**What we're looking for**
- 4+ years of iOS development experience
- Strong Swift and SwiftUI skills
- Experience with unit and UI testing`,
      salaryMin: 80000,
      salaryMax: 100000,
      city: "Limassol",
      remoteType: "HYBRID" as const,
      employmentType: "FULL_TIME" as const,
      experienceLevel: "SENIOR" as const,
      featured: false,
      status: "ACTIVE" as const,
      applyUrl: "https://revolut.com/careers",
      postedAt: new Date(Date.now() - 4 * 86_400_000),
      expiresAt: new Date(Date.now() + 20 * 86_400_000),
      companySlug: "revolut",
      categorySlug: "mobile",
      tags: ["Swift", "iOS"],
    },
    {
      slug: "security-engineer-veracode",
      title: "Application Security Engineer",
      description: `Veracode is looking for an Application Security Engineer to work on their static analysis engine. You'll build tooling that helps developers find and fix security vulnerabilities before they ship.

**What you'll do**
- Build and improve static analysis rules
- Work with customers to integrate security into their CI/CD pipelines
- Research new vulnerability classes

**What we're looking for**
- 3+ years in application security
- Experience with SAST or DAST tools
- Strong understanding of OWASP Top 10`,
      salaryMin: 65000,
      salaryMax: 85000,
      city: "Limassol",
      remoteType: "HYBRID" as const,
      employmentType: "FULL_TIME" as const,
      experienceLevel: "MID" as const,
      featured: false,
      status: "ACTIVE" as const,
      applyUrl: "https://veracode.com/careers",
      postedAt: new Date(Date.now() - 5 * 86_400_000),
      expiresAt: new Date(Date.now() + 19 * 86_400_000),
      companySlug: "veracode",
      categorySlug: "security",
      tags: ["SAST", "OWASP"],
    },
    {
      slug: "senior-product-manager-wargaming",
      title: "Senior Product Manager — Live Ops",
      description: `Wargaming needs a Senior PM to own live operations for World of Tanks. You'll drive engagement, retention, and monetisation features for one of the world's most popular online games.

**What you'll do**
- Own the live ops product roadmap
- Work with data analysts to identify growth opportunities
- Collaborate with engineering and design to ship features fast

**What we're looking for**
- 5+ years of product management experience
- Experience in gaming or consumer tech
- Strong analytical skills — comfortable with SQL and A/B testing`,
      salaryMin: 70000,
      salaryMax: 90000,
      city: "Nicosia",
      remoteType: "ON_SITE" as const,
      employmentType: "FULL_TIME" as const,
      experienceLevel: "SENIOR" as const,
      featured: false,
      status: "ACTIVE" as const,
      applyUrl: "https://wargaming.com/careers",
      postedAt: new Date(Date.now() - 6 * 86_400_000),
      expiresAt: new Date(Date.now() + 18 * 86_400_000),
      companySlug: "wargaming",
      categorySlug: "product",
      tags: ["Product Strategy", "Agile"],
    },
  ];

  for (const job of jobsData) {
    const { companySlug, categorySlug, tags: jobTags, ...jobData } = job;

    await prisma.job.upsert({
      where: { slug: job.slug },
      update: {},
      create: {
        ...jobData,
        companyId:  coMap[companySlug],
        categoryId: catMap[categorySlug],
        tags: {
          create: jobTags
            .filter(t => tagMap[t])
            .map(t => ({ tagId: tagMap[t] })),
        },
      },
    });
  }

  console.log(`  ✓ ${jobsData.length} jobs\n`);
  console.log("✅ Seed complete!");
}

main()
  .catch(e => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CyprusTech.Jobs database…\n");

  // ─── Categories ───────────────────────────────────────────
  // The `categories` table is the single source of truth for the taxonomy (the
  // nav, homepage grid and every job picker read it). Broad parents, each with
  // the specific roles beneath them — the whole tree is searchable in one box
  // when posting, so breadth here costs an employer nothing to navigate. Both
  // engineering and the wider business functions a Cyprus fintech/forex/
  // corporate-services employer hires for.
  console.log("Creating categories…");
  const TAXONOMY: { name: string; slug: string; children: { name: string; slug: string }[] }[] = [
    { name: "Frontend", slug: "frontend", children: [
      { name: "Angular Developer", slug: "angular-developer" },
      { name: "Frontend Engineer", slug: "frontend-engineer" },
      { name: "React Developer", slug: "react-developer" },
      { name: "Vue.js Developer", slug: "vue-developer" },
      { name: "Web Developer", slug: "web-developer" },
    ] },
    { name: "Backend", slug: "backend", children: [
      { name: "API Developer", slug: "api-developer" },
      { name: "Backend Engineer", slug: "backend-engineer" },
      { name: "Platform Engineer", slug: "platform-engineer" },
      { name: "Software Engineer", slug: "software-engineer" },
      { name: "Systems Engineer", slug: "systems-engineer" },
    ] },
    { name: "Full Stack", slug: "full-stack", children: [
      { name: "Full Stack Engineer", slug: "fullstack-engineer" },
      { name: "Software Developer", slug: "software-developer" },
    ] },
    { name: "Mobile", slug: "mobile", children: [
      { name: "Android Developer", slug: "android-developer" },
      { name: "Flutter Developer", slug: "flutter-developer" },
      { name: "iOS Developer", slug: "ios-developer" },
      { name: "React Native Developer", slug: "rn-developer" },
    ] },
    { name: "DevOps & Cloud", slug: "devops", children: [
      { name: "Cloud Engineer", slug: "cloud-engineer" },
      { name: "DevOps Engineer", slug: "devops-engineer" },
      { name: "Infrastructure Engineer", slug: "infrastructure-engineer" },
      { name: "Kubernetes Engineer", slug: "kubernetes-engineer" },
      { name: "Site Reliability Engineer", slug: "sre-engineer" },
    ] },
    /* Corporate/internal IT, deliberately separate from DevOps & Cloud above.
       DevOps is product infrastructure — the systems the company sells run on.
       This is the systems the company runs ON: helpdesk, endpoints, networks,
       AD, internal ops. A sysadmin and an SRE are not interchangeable hires,
       and lumping them together is why neither side finds the other's roles.
       Names are prefixed "IT " where an unprefixed one would collide with an
       existing role (it-project-manager vs Operations' project-manager,
       it-operations-manager vs Operations' operations-manager). */
    { name: "IT & Systems", slug: "it", children: [
      { name: "IT Support Specialist", slug: "it-support-specialist" },
      { name: "IT Helpdesk Technician", slug: "it-helpdesk-technician" },
      { name: "Desktop Support Engineer", slug: "desktop-support-engineer" },
      { name: "Service Desk Analyst", slug: "service-desk-analyst" },
      { name: "System Administrator", slug: "system-administrator" },
      { name: "Network Engineer", slug: "network-engineer" },
      { name: "Network Administrator", slug: "network-administrator" },
      { name: "Database Administrator", slug: "database-administrator" },
      { name: "IT Operations Engineer", slug: "it-operations-engineer" },
      { name: "IT Operations Manager", slug: "it-operations-manager" },
      { name: "IT Project Manager", slug: "it-project-manager" },
      { name: "Solutions Architect", slug: "solutions-architect" },
      { name: "IT Manager", slug: "it-manager" },
      { name: "Head of IT", slug: "head-of-it" },
    ] },
    { name: "Data & AI", slug: "data", children: [
      { name: "AI Engineer", slug: "ai-engineer" },
      { name: "BI Analyst", slug: "bi-analyst" },
      { name: "Data Analyst", slug: "data-analyst" },
      { name: "Data Engineer", slug: "data-engineer" },
      { name: "Data Scientist", slug: "data-scientist" },
      { name: "ML Engineer", slug: "ml-engineer" },
    ] },
    { name: "Design", slug: "design", children: [
      { name: "Graphic Designer", slug: "graphic-designer" },
      { name: "Motion Designer", slug: "motion-designer" },
      { name: "Product Designer", slug: "product-designer" },
      { name: "UI/UX Designer", slug: "uiux-designer" },
      { name: "Visual Designer", slug: "visual-designer" },
    ] },
    /* Gaming is a hiring vertical, not a discipline — Cyprus has real studio
       headcount (Wargaming and the Limassol/Nicosia studios around it) and those
       roles were unfileable. A 3D character artist is not a Graphic Designer, a
       gameplay programmer is not a Backend Engineer, and a game economy designer
       is not a Data Analyst — the tools, portfolios and pipelines differ. Kept as
       one parent because the picker flattens the tree and searches it, so "3d",
       "unreal" or "economy" finds the role without anyone guessing a parent. */
    { name: "Gaming", slug: "gaming", children: [
      { name: "3D Artist", slug: "3d-artist" },
      { name: "3D Character Artist", slug: "3d-character-artist" },
      { name: "3D Environment Artist", slug: "3d-environment-artist" },
      { name: "Animator", slug: "animator" },
      { name: "Art Director", slug: "art-director" },
      { name: "Concept Artist", slug: "concept-artist" },
      { name: "Game Analyst", slug: "game-analyst" },
      { name: "Game Backend Engineer", slug: "game-backend-engineer" },
      { name: "Game Designer", slug: "game-designer" },
      { name: "Game Economy Designer", slug: "game-economy-designer" },
      { name: "Game Producer", slug: "game-producer" },
      { name: "Game QA Tester", slug: "game-qa-tester" },
      { name: "Gameplay Programmer", slug: "gameplay-programmer" },
      { name: "Graphics Programmer", slug: "graphics-programmer" },
      { name: "Level Designer", slug: "level-designer" },
      { name: "LiveOps Manager", slug: "liveops-manager" },
      { name: "Monetisation Manager", slug: "monetisation-manager" },
      { name: "Narrative Designer", slug: "narrative-designer" },
      { name: "Rigging Artist", slug: "rigging-artist" },
      { name: "Systems Designer", slug: "systems-designer" },
      { name: "Technical Artist", slug: "technical-artist" },
      { name: "Tools Programmer", slug: "tools-programmer" },
      { name: "UI Artist", slug: "ui-artist" },
      { name: "Unity Developer", slug: "unity-developer" },
      { name: "Unreal Developer", slug: "unreal-developer" },
      { name: "VFX Artist", slug: "vfx-artist" },
    ] },
    { name: "Product", slug: "product", children: [
      { name: "Business Analyst", slug: "business-analyst" },
      { name: "Head of Product", slug: "head-of-product" },
      { name: "Product Manager", slug: "product-manager" },
      { name: "Product Owner", slug: "product-owner" },
      { name: "Scrum Master", slug: "scrum-master" },
      { name: "Technical PM", slug: "technical-pm" },
    ] },
    { name: "QA & Testing", slug: "qa", children: [
      { name: "Automation Engineer", slug: "automation-engineer" },
      { name: "QA Engineer", slug: "qa-engineer" },
      { name: "SDET", slug: "sdet" },
      { name: "Test Engineer", slug: "test-engineer" },
    ] },
    { name: "Security", slug: "security", children: [
      { name: "Cybersecurity Analyst", slug: "cybersecurity-analyst" },
      { name: "Penetration Tester", slug: "penetration-tester" },
      { name: "Security Architect", slug: "security-architect" },
      { name: "Security Engineer", slug: "security-engineer" },
    ] },
    { name: "Management", slug: "management", children: [
      { name: "CTO", slug: "cto" },
      { name: "Engineering Manager", slug: "engineering-manager" },
      { name: "Head of Engineering", slug: "head-of-engineering" },
      { name: "Tech Lead", slug: "tech-lead" },
      { name: "VP of Engineering", slug: "vp-engineering" },
    ] },
    { name: "Finance & Trading", slug: "finance", children: [
      { name: "Compliance Analyst", slug: "compliance-analyst" },
      { name: "Financial Analyst", slug: "financial-analyst" },
      { name: "Financial Engineer", slug: "financial-engineer" },
      { name: "Quantitative Analyst", slug: "quant-analyst" },
      { name: "Risk Analyst", slug: "risk-analyst" },
      { name: "Trading Developer", slug: "trading-developer" },
    ] },
    { name: "Customer Support", slug: "customer-support", children: [
      { name: "Customer Support Agent", slug: "customer-support-agent" },
      { name: "Customer Service Representative", slug: "customer-service-representative" },
      { name: "Technical Support Engineer", slug: "technical-support-engineer" },
      { name: "Customer Success Manager", slug: "customer-success-manager" },
      { name: "Client Relationship Manager", slug: "client-relationship-manager" },
      { name: "Support Team Lead", slug: "support-team-lead" },
      { name: "Retention Specialist", slug: "retention-specialist" },
      { name: "Head of Customer Support", slug: "head-of-customer-support" },
    ] },
    { name: "Compliance & Financial Crime", slug: "compliance", children: [
      { name: "Compliance Officer", slug: "compliance-officer" },
      { name: "Compliance Manager", slug: "compliance-manager" },
      { name: "AML Analyst", slug: "aml-analyst" },
      { name: "KYC Analyst", slug: "kyc-analyst" },
      { name: "Financial Crime Analyst", slug: "financial-crime-analyst" },
      { name: "Financial Crime Compliance Manager", slug: "financial-crime-compliance-manager" },
      { name: "FinCrime Escalation Officer", slug: "fincrime-escalation-officer" },
      { name: "Fraud Analyst", slug: "fraud-analyst" },
      { name: "Transaction Monitoring Analyst", slug: "transaction-monitoring-analyst" },
      { name: "MLRO (Money Laundering Reporting Officer)", slug: "mlro" },
      { name: "Regulatory Affairs Officer", slug: "regulatory-affairs-officer" },
      { name: "Head of Compliance", slug: "head-of-compliance" },
    ] },
    { name: "Risk", slug: "risk", children: [
      { name: "Risk Manager", slug: "risk-manager" },
      { name: "Financial Risk Manager", slug: "financial-risk-manager" },
      { name: "Credit Risk Analyst", slug: "credit-risk-analyst" },
      { name: "Market Risk Analyst", slug: "market-risk-analyst" },
      { name: "Operational Risk Manager", slug: "operational-risk-manager" },
      { name: "Risk & Compliance Officer", slug: "risk-and-compliance-officer" },
      { name: "Head of Risk", slug: "head-of-risk" },
    ] },
    { name: "Legal & Corporate", slug: "legal", children: [
      { name: "Legal Counsel", slug: "legal-counsel" },
      { name: "Corporate Lawyer", slug: "corporate-lawyer" },
      { name: "Legal Advisor", slug: "legal-advisor" },
      { name: "Company Secretary", slug: "company-secretary" },
      { name: "Corporate Administrator", slug: "corporate-administrator" },
      { name: "Paralegal", slug: "paralegal" },
      { name: "Contracts Manager", slug: "contracts-manager" },
      { name: "Head of Legal", slug: "head-of-legal" },
    ] },
    { name: "Finance & Accounting", slug: "accounting", children: [
      { name: "Accountant", slug: "accountant" },
      { name: "Senior Accountant", slug: "senior-accountant" },
      { name: "Bookkeeper", slug: "bookkeeper" },
      { name: "Financial Controller", slug: "financial-controller" },
      { name: "Finance Manager", slug: "finance-manager" },
      { name: "Auditor", slug: "auditor" },
      { name: "Internal Auditor", slug: "internal-auditor" },
      { name: "Tax Advisor", slug: "tax-advisor" },
      { name: "Payroll Specialist", slug: "payroll-specialist" },
      { name: "Accounts Assistant", slug: "accounts-assistant" },
      { name: "Head of Finance", slug: "head-of-finance" },
    ] },
    { name: "HR & People", slug: "hr", children: [
      { name: "HR Officer", slug: "hr-officer" },
      { name: "HR Manager", slug: "hr-manager" },
      { name: "Recruiter", slug: "recruiter" },
      { name: "Technical Recruiter", slug: "technical-recruiter" },
      { name: "Talent Acquisition Specialist", slug: "talent-acquisition-specialist" },
      { name: "People Operations Manager", slug: "people-operations-manager" },
      { name: "HR Business Partner", slug: "hr-business-partner" },
      { name: "Head of HR", slug: "head-of-hr" },
    ] },
    { name: "Marketing", slug: "marketing", children: [
      { name: "Marketing Manager", slug: "marketing-manager" },
      { name: "Digital Marketing Specialist", slug: "digital-marketing-specialist" },
      { name: "Content Writer", slug: "content-writer" },
      { name: "SEO Specialist", slug: "seo-specialist" },
      { name: "Social Media Manager", slug: "social-media-manager" },
      { name: "Performance Marketing Manager", slug: "performance-marketing-manager" },
      { name: "Brand Manager", slug: "brand-manager" },
      { name: "PPC Specialist", slug: "ppc-specialist" },
      { name: "Affiliate Manager", slug: "affiliate-manager" },
      { name: "CRM Manager", slug: "crm-manager" },
      { name: "Head of Marketing", slug: "head-of-marketing" },
    ] },
    { name: "Sales & Business Development", slug: "sales", children: [
      { name: "Sales Representative", slug: "sales-representative" },
      { name: "Account Manager", slug: "account-manager" },
      { name: "Business Development Manager", slug: "business-development-manager" },
      { name: "Sales Manager", slug: "sales-manager" },
      { name: "Account Executive", slug: "account-executive" },
      { name: "Partnerships Manager", slug: "partnerships-manager" },
      { name: "Sales Development Representative", slug: "sales-development-representative" },
      { name: "Head of Sales", slug: "head-of-sales" },
    ] },
    { name: "Operations", slug: "operations", children: [
      { name: "Operations Manager", slug: "operations-manager" },
      { name: "Operations Analyst", slug: "operations-analyst" },
      { name: "Project Manager", slug: "project-manager" },
      { name: "Office Manager", slug: "office-manager" },
      { name: "Executive Assistant", slug: "executive-assistant" },
      { name: "Payments Operations Specialist", slug: "payments-operations-specialist" },
      { name: "Dealing Room Operator", slug: "dealing-room-operator" },
      { name: "Head of Operations", slug: "head-of-operations" },
    ] },
  ];

  const catMap: Record<string, string> = {};
  let catCount = 0;
  for (const parent of TAXONOMY) {
    const p = await prisma.category.upsert({
      where:  { slug: parent.slug },
      update: { name: parent.name },
      create: { name: parent.name, slug: parent.slug },
    });
    catMap[parent.slug] = p.id;
    catCount++;
    for (const child of parent.children) {
      const c = await prisma.category.upsert({
        where:  { slug: child.slug },
        update: { name: child.name, parentId: p.id },
        create: { name: child.name, slug: child.slug, parentId: p.id },
      });
      catMap[child.slug] = c.id;
      catCount++;
    }
  }
  console.log(`  ✓ ${catCount} categories\n`);

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

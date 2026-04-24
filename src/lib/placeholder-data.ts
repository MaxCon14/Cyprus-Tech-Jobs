// Centralised placeholder data — swap each export for a DB query when ready.

export const CATEGORIES = [
  { label: "All jobs",  slug: "",           count: 248 },
  { label: "Frontend",  slug: "frontend",   count: 62 },
  { label: "Backend",   slug: "backend",    count: 48 },
  { label: "DevOps",    slug: "devops",     count: 24 },
  { label: "Design",    slug: "design",     count: 18 },
  { label: "Data",      slug: "data",       count: 15 },
  { label: "Mobile",    slug: "mobile",     count: 11 },
  { label: "Product",   slug: "product",    count: 9 },
  { label: "Security",  slug: "security",   count: 7 },
  { label: "QA",        slug: "qa",         count: 5 },
];

export const CITIES = ["Limassol", "Nicosia", "Larnaca", "Paphos", "Remote"];

export const COMPANIES = [
  {
    slug: "revolut",
    name: "Revolut",
    initial: "R",
    bg: "#0A0A0A",
    fg: "#FFFFFF",
    city: "Limassol",
    website: "revolut.com",
    description:
      "Revolut is a global fintech company offering banking, payments, and financial services. Their Cyprus hub is a major engineering centre focused on payments infrastructure, growth, and financial crime prevention.",
    size: "5,000+ employees",
    founded: "2015",
    tags: ["Fintech", "Payments", "Banking"],
    openRoles: 8,
    verified: true,
    featured: true,
  },
  {
    slug: "wargaming",
    name: "Wargaming",
    initial: "W",
    bg: "#FFE8F0",
    fg: "#E6336F",
    city: "Nicosia",
    website: "wargaming.net",
    description:
      "Wargaming is a global gaming company best known for World of Tanks. Their Nicosia studio is one of their largest, working on core game development, backend services, and live operations.",
    size: "1,000–5,000 employees",
    founded: "1998",
    tags: ["Gaming", "Backend", "C++"],
    openRoles: 12,
    verified: true,
    featured: true,
  },
  {
    slug: "xm-group",
    name: "XM Group",
    initial: "X",
    bg: "#1F1E1A",
    fg: "#FFFFFF",
    city: "Limassol",
    website: "xm.com",
    description:
      "XM is a global forex and CFD broker headquartered in Limassol. Their technology team builds trading platforms, risk systems, and data infrastructure for millions of clients worldwide.",
    size: "1,000–5,000 employees",
    founded: "2009",
    tags: ["Fintech", "Trading", "Platform"],
    openRoles: 7,
    verified: true,
    featured: false,
  },
  {
    slug: "etoro",
    name: "eToro",
    initial: "E",
    bg: "#DCFCE7",
    fg: "#16A34A",
    city: "Limassol",
    website: "etoro.com",
    description:
      "eToro is the world's leading social trading platform. Their Cyprus team works on investment products, crypto infrastructure, and the platform used by 35 million users globally.",
    size: "1,000–5,000 employees",
    founded: "2007",
    tags: ["Fintech", "Crypto", "Social Trading"],
    openRoles: 5,
    verified: true,
    featured: true,
  },
  {
    slug: "exness",
    name: "Exness",
    initial: "Ex",
    bg: "#DBEAFE",
    fg: "#2563EB",
    city: "Limassol",
    website: "exness.com",
    description:
      "Exness is a global forex broker with one of the highest trading volumes in the industry. Their Limassol tech hub builds high-performance trading infrastructure, data platforms, and internal tooling.",
    size: "1,000–5,000 employees",
    founded: "2008",
    tags: ["Fintech", "Data", "Infrastructure"],
    openRoles: 6,
    verified: true,
    featured: false,
  },
  {
    slug: "cablenet",
    name: "Cablenet",
    initial: "Ca",
    bg: "#FEF3C7",
    fg: "#D97706",
    city: "Nicosia",
    website: "cablenet.com.cy",
    description:
      "Cablenet is Cyprus's leading telecommunications provider, offering broadband, TV, and mobile services. Their tech team builds billing systems, network management tools, and customer platforms.",
    size: "200–500 employees",
    founded: "2003",
    tags: ["Telecom", "Infrastructure", "B2C"],
    openRoles: 3,
    verified: true,
    featured: false,
  },
  {
    slug: "riskified",
    name: "Riskified",
    initial: "Ri",
    bg: "#F5F4F2",
    fg: "#3A3933",
    city: "Limassol",
    website: "riskified.com",
    description:
      "Riskified is an eCommerce fraud prevention platform that uses machine learning to help merchants grow revenue safely. Their Cyprus office focuses on ML engineering and data science.",
    size: "500–1,000 employees",
    founded: "2012",
    tags: ["ML", "Fraud Detection", "eCommerce"],
    openRoles: 4,
    verified: false,
    featured: false,
  },
  {
    slug: "veracode",
    name: "Veracode",
    initial: "V",
    bg: "#EDE9FE",
    fg: "#7C3AED",
    city: "Limassol",
    website: "veracode.com",
    description:
      "Veracode is a leading application security company. Their Cyprus team works on static analysis tools, developer security tooling, and cloud-based security testing infrastructure.",
    size: "500–1,000 employees",
    founded: "2006",
    tags: ["Security", "DevSecOps", "SaaS"],
    openRoles: 4,
    verified: false,
    featured: false,
  },
];

export const JOBS = [
  {
    id: "1",
    slug: "senior-product-designer-revolut",
    title: "Senior Product Designer — Growth",
    company: COMPANIES[0],
    city: "Limassol",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    experienceLevel: "SENIOR",
    salaryMin: 75000,
    salaryMax: 95000,
    featured: true,
    postedAt: new Date(Date.now() - 2 * 3_600_000),
    tags: [{ name: "Figma" }, { name: "Design Systems" }, { name: "Prototyping" }],
    category: "design",
    description: `We're looking for a Senior Product Designer to join our Growth team in Limassol. You'll own end-to-end design for acquisition, activation, and monetisation flows used by millions of customers globally.

**What you'll do**
- Own the full design process from discovery through to shipped product
- Work closely with PMs, engineers, and data analysts to identify opportunities
- Maintain and evolve the Revolut design system
- Run user research and usability tests
- Present work to senior stakeholders with clarity and conviction

**What we're looking for**
- 5+ years of product design experience, ideally in fintech or consumer tech
- A portfolio showing end-to-end product thinking, not just polished screens
- Strong Figma skills and experience with design systems at scale
- Comfortable with data — you use metrics to inform and validate decisions
- Fluent English; additional languages are a bonus`,
    requirements: ["Figma", "Design Systems", "User Research", "Prototyping", "Data Analysis"],
    benefits: ["Relocation support", "Stock options", "Private health insurance", "Flexible hours", "Home office setup budget"],
    applyUrl: "https://revolut.com/careers",
  },
  {
    id: "2",
    slug: "staff-frontend-engineer-wargaming",
    title: "Staff Frontend Engineer (React)",
    company: COMPANIES[1],
    city: "Nicosia",
    remoteType: "ON_SITE",
    employmentType: "FULL_TIME",
    experienceLevel: "LEAD",
    salaryMin: 85000,
    salaryMax: 120000,
    featured: false,
    postedAt: new Date(Date.now() - 5 * 3_600_000),
    tags: [{ name: "React" }, { name: "TypeScript" }, { name: "Performance" }],
    category: "frontend",
    description: `Wargaming is looking for a Staff Frontend Engineer to lead the web platform team in Nicosia. You'll set technical direction for the frontend across multiple game titles and help us scale our web presence to 150M+ players.

**What you'll do**
- Define frontend architecture and coding standards across teams
- Lead a team of 6 senior frontend engineers
- Drive performance optimisation initiatives (core web vitals, rendering)
- Collaborate with game teams to build features used by millions
- Mentor engineers and run technical interviews

**What we're looking for**
- 8+ years of frontend engineering experience
- Deep expertise in React and TypeScript
- Experience leading teams or acting as a technical lead
- Obsession with performance and user experience
- Strong communication skills — you can explain complex trade-offs to non-engineers`,
    requirements: ["React", "TypeScript", "Web Performance", "Team Leadership", "System Design"],
    benefits: ["Relocation package", "Annual bonus", "Game credits", "Private medical", "Gym membership"],
    applyUrl: "https://wargaming.com/careers",
  },
  {
    id: "3",
    slug: "devops-engineer-xm-group",
    title: "DevOps Engineer — Platform",
    company: COMPANIES[2],
    city: "Limassol",
    remoteType: "REMOTE",
    employmentType: "FULL_TIME",
    experienceLevel: "MID",
    salaryMin: 55000,
    salaryMax: 75000,
    featured: false,
    postedAt: new Date(Date.now() - 24 * 3_600_000),
    tags: [{ name: "Kubernetes" }, { name: "Terraform" }, { name: "AWS" }],
    category: "devops",
    description: `XM Group is hiring a DevOps Engineer to join the Platform team. You'll work on the infrastructure that powers XM's trading platform, serving millions of active traders.

**What you'll do**
- Manage and scale Kubernetes clusters across multiple cloud regions
- Build and maintain CI/CD pipelines
- Implement infrastructure as code with Terraform
- Monitor system health and respond to incidents
- Work with development teams to improve deployment workflows

**What we're looking for**
- 3+ years of DevOps or SRE experience
- Solid Kubernetes and Docker knowledge
- Experience with Terraform or similar IaC tools
- AWS or GCP certification is a plus
- On-call rotation experience`,
    requirements: ["Kubernetes", "Terraform", "AWS", "CI/CD", "Docker"],
    benefits: ["Fully remote", "Home office allowance", "Annual bonus", "Private health insurance"],
    applyUrl: "https://xm.com/careers",
  },
  {
    id: "4",
    slug: "senior-backend-engineer-etoro",
    title: "Senior Backend Engineer (Python)",
    company: COMPANIES[3],
    city: "Limassol",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    experienceLevel: "SENIOR",
    salaryMin: 70000,
    salaryMax: 90000,
    featured: false,
    postedAt: new Date(Date.now() - 2 * 86_400_000),
    tags: [{ name: "Python" }, { name: "PostgreSQL" }, { name: "Microservices" }],
    category: "backend",
    description: `eToro is looking for a Senior Backend Engineer to join our investments platform team. You'll build the systems that power stock, ETF, and crypto investing for 35 million users.

**What you'll do**
- Design and build high-throughput Python microservices
- Own services from design through deployment and monitoring
- Work with product and data teams to deliver new investment features
- Improve reliability, performance, and scalability of existing systems

**What we're looking for**
- 5+ years of backend engineering experience
- Strong Python skills (FastAPI, Django, or similar)
- Experience with PostgreSQL and Redis
- Understanding of distributed systems and microservices
- Experience with financial systems is a plus`,
    requirements: ["Python", "PostgreSQL", "Redis", "Microservices", "FastAPI"],
    benefits: ["Hybrid work", "Stock options", "Annual bonus", "Private health", "Learning budget"],
    applyUrl: "https://etoro.com/careers",
  },
  {
    id: "5",
    slug: "data-engineer-exness",
    title: "Data Engineer — Analytics Platform",
    company: COMPANIES[4],
    city: "Limassol",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    experienceLevel: "MID",
    salaryMin: 60000,
    salaryMax: 80000,
    featured: false,
    postedAt: new Date(Date.now() - 3 * 86_400_000),
    tags: [{ name: "dbt" }, { name: "Spark" }, { name: "Airflow" }],
    category: "data",
    description: `Exness is hiring a Data Engineer to join the Analytics Platform team. You'll build and maintain the data infrastructure that powers business intelligence and ML across the company.

**What you'll do**
- Build and maintain data pipelines using Spark and Airflow
- Develop dbt models and maintain our data warehouse
- Work with analysts and data scientists to deliver data products
- Improve data quality, lineage, and observability

**What we're looking for**
- 3+ years of data engineering experience
- Strong SQL and Python skills
- Experience with dbt, Spark, or Airflow
- Familiarity with cloud data warehouses (BigQuery, Snowflake, or Redshift)
- Experience in fintech or high-volume transactional environments is a plus`,
    requirements: ["dbt", "Apache Spark", "Airflow", "SQL", "Python"],
    benefits: ["Hybrid work", "Annual bonus", "Gym membership", "Private medical", "Continuous learning budget"],
    applyUrl: "https://exness.com/careers",
  },
  {
    id: "6",
    slug: "ios-engineer-revolut",
    title: "iOS Engineer — Consumer App",
    company: COMPANIES[0],
    city: "Limassol",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    experienceLevel: "SENIOR",
    salaryMin: 80000,
    salaryMax: 100000,
    featured: false,
    postedAt: new Date(Date.now() - 4 * 86_400_000),
    tags: [{ name: "Swift" }, { name: "SwiftUI" }, { name: "iOS" }],
    category: "mobile",
    description: `Join Revolut's iOS team and build features used daily by millions of customers. You'll work on the core consumer app across payments, accounts, and new financial products.

**What you'll do**
- Build new features in Swift and SwiftUI
- Work closely with designers to deliver pixel-perfect experiences
- Write testable, performant code
- Contribute to the iOS platform and shared libraries`,
    requirements: ["Swift", "SwiftUI", "UIKit", "XCTest", "CI/CD"],
    benefits: ["Relocation support", "Stock options", "Private health", "Flexible hours"],
    applyUrl: "https://revolut.com/careers",
  },
  {
    id: "7",
    slug: "security-engineer-veracode",
    title: "Application Security Engineer",
    company: COMPANIES[7],
    city: "Limassol",
    remoteType: "HYBRID",
    employmentType: "FULL_TIME",
    experienceLevel: "MID",
    salaryMin: 65000,
    salaryMax: 85000,
    featured: false,
    postedAt: new Date(Date.now() - 5 * 86_400_000),
    tags: [{ name: "SAST" }, { name: "OWASP" }, { name: "Java" }],
    category: "security",
    description: `Veracode is looking for an Application Security Engineer to work on their static analysis engine. You'll build tooling that helps developers find and fix security vulnerabilities before they ship.`,
    requirements: ["SAST", "Java", "OWASP Top 10", "Security Testing", "CI/CD Integration"],
    benefits: ["Hybrid work", "Annual bonus", "Private health", "Conference budget"],
    applyUrl: "https://veracode.com/careers",
  },
  {
    id: "8",
    slug: "product-manager-wargaming",
    title: "Senior Product Manager — Live Ops",
    company: COMPANIES[1],
    city: "Nicosia",
    remoteType: "ON_SITE",
    employmentType: "FULL_TIME",
    experienceLevel: "SENIOR",
    salaryMin: 70000,
    salaryMax: 90000,
    featured: false,
    postedAt: new Date(Date.now() - 6 * 86_400_000),
    tags: [{ name: "Gaming" }, { name: "Live Ops" }, { name: "Analytics" }],
    category: "product",
    description: `Wargaming needs a Senior PM to own live operations for World of Tanks. You'll drive engagement, retention, and monetisation features for one of the world's most popular online games.`,
    requirements: ["Product Management", "Gaming", "A/B Testing", "Analytics", "Stakeholder Management"],
    benefits: ["Annual bonus", "Game credits", "Private medical", "Gym membership"],
    applyUrl: "https://wargaming.com/careers",
  },
];

export const SALARY_DATA = [
  {
    category: "Frontend",
    junior: { min: 28000, max: 42000 },
    mid:    { min: 42000, max: 65000 },
    senior: { min: 65000, max: 95000 },
    lead:   { min: 85000, max: 130000 },
  },
  {
    category: "Backend",
    junior: { min: 30000, max: 44000 },
    mid:    { min: 44000, max: 68000 },
    senior: { min: 68000, max: 100000 },
    lead:   { min: 90000, max: 140000 },
  },
  {
    category: "DevOps / SRE",
    junior: { min: 32000, max: 48000 },
    mid:    { min: 48000, max: 72000 },
    senior: { min: 72000, max: 105000 },
    lead:   { min: 95000, max: 145000 },
  },
  {
    category: "Data Engineering",
    junior: { min: 30000, max: 45000 },
    mid:    { min: 45000, max: 70000 },
    senior: { min: 70000, max: 100000 },
    lead:   { min: 90000, max: 135000 },
  },
  {
    category: "Mobile (iOS/Android)",
    junior: { min: 28000, max: 42000 },
    mid:    { min: 42000, max: 65000 },
    senior: { min: 65000, max: 95000 },
    lead:   { min: 85000, max: 125000 },
  },
  {
    category: "Product Design",
    junior: { min: 25000, max: 38000 },
    mid:    { min: 38000, max: 58000 },
    senior: { min: 58000, max: 85000 },
    lead:   { min: 75000, max: 115000 },
  },
  {
    category: "Product Management",
    junior: { min: 32000, max: 48000 },
    mid:    { min: 48000, max: 72000 },
    senior: { min: 72000, max: 105000 },
    lead:   { min: 95000, max: 145000 },
  },
  {
    category: "Security",
    junior: { min: 32000, max: 50000 },
    mid:    { min: 50000, max: 78000 },
    senior: { min: 78000, max: 115000 },
    lead:   { min: 100000, max: 150000 },
  },
];

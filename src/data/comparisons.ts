export interface FeatureRow {
  feature: string;
  cyprusTech: string | boolean;
  competitor: string | boolean;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface Comparison {
  slug: string;
  competitor: {
    name: string;
    url: string;
    tagline: string;
    founded: string;
    type: string; // "general" | "tech" | "recruitment"
    description: string;
  };
  metaTitle: string;
  metaDescription: string;
  verdict: string;
  features: FeatureRow[];
  aboutCyprusTech: string;
  aboutCompetitor: string;
  whoShouldUseCyprusTech: string[];
  whoShouldUseCompetitor: string[];
  faq: FaqItem[];
  lastReviewed: string; // ISO date
}

export const comparisons: Comparison[] = [
  // ─── Ergodotisi ──────────────────────────────────────────────
  {
    slug: "ergodotisi",
    competitor: {
      name: "Ergodotisi",
      url: "https://www.ergodotisi.com",
      tagline: "Cyprus's largest general job board",
      founded: "2006",
      type: "general",
      description:
        "Ergodotisi (εργοδοτήσι) is one of Cyprus's oldest and most visited job portals. It covers every sector — hospitality, retail, finance, construction, and tech — and is available in both Greek and English. Employers post vacancies directly; candidates browse and apply via the platform.",
    },
    metaTitle: "CyprusTech.Careers vs Ergodotisi — Best Tech Job Board in Cyprus 2026",
    metaDescription:
      "Comparing CyprusTech.Careers and Ergodotisi for tech hiring in Cyprus. See which platform is better for software engineers, developers, and IT professionals.",
    verdict:
      "Ergodotisi is Cyprus's most established general job board and covers every industry. For tech roles specifically, CyprusTech.Careers offers a more focused experience: every listing is technology-related, salaries are displayed upfront, and job seekers get AI-powered CV matching. If you work in software, engineering, or IT in Cyprus, you'll spend less time filtering noise on CyprusTech.Careers.",
    features: [
      { feature: "Tech-only listings", cyprusTech: true, competitor: false },
      { feature: "Salary transparency", cyprusTech: true, competitor: false },
      { feature: "Remote / hybrid filter", cyprusTech: true, competitor: false },
      { feature: "AI CV review", cyprusTech: true, competitor: false },
      { feature: "Job alerts by tech stack", cyprusTech: true, competitor: false },
      { feature: "Greek-language interface", cyprusTech: false, competitor: true },
      { feature: "Non-tech job listings", cyprusTech: false, competitor: true },
      { feature: "Free job posting", cyprusTech: "Paid", competitor: "Free tier" },
      { feature: "Mobile app", cyprusTech: false, competitor: true },
    ],
    aboutCyprusTech:
      "CyprusTech.Careers launched in 2024 as a dedicated technology job board for Cyprus. It focuses exclusively on software, engineering, data, design, and IT roles — filtering out the noise of general job boards. Candidates create a free profile with their preferred tech stack, experience level, and salary expectations. Employers post roles with full salary ranges and remote-work policies disclosed upfront.",
    aboutCompetitor:
      "Ergodotisi has been connecting Cypriot employers and job seekers since 2006. It is the broadest job portal on the island, listing roles from every sector and company size. The platform is bilingual (Greek and English) and has a native mobile app. Its strength is volume — thousands of active listings at any time — but that breadth means tech candidates must filter through many unrelated roles.",
    whoShouldUseCyprusTech: [
      "Software developers and engineers based in Cyprus",
      "Tech candidates who want salary info before applying",
      "Remote and hybrid workers looking for flexibility",
      "Candidates who want AI-assisted CV feedback against specific roles",
      "Companies hiring exclusively for tech or product teams",
    ],
    whoShouldUseCompetitor: [
      "Job seekers looking for non-tech roles (hospitality, finance, retail)",
      "Employers who need one platform for all departments",
      "Candidates who prefer a Greek-language interface",
      "Anyone who wants a native mobile app experience",
    ],
    faq: [
      {
        question: "Is CyprusTech.Careers better than Ergodotisi for software engineers?",
        answer:
          "For software engineers and IT professionals specifically, CyprusTech.Careers is more focused. Every listing is technology-related, salaries are shown upfront, and you can filter by tech stack. Ergodotisi covers more sectors but requires more filtering to find relevant tech roles.",
      },
      {
        question: "Does Ergodotisi show salaries on job listings?",
        answer:
          "Ergodotisi leaves salary disclosure to the individual employer, so many listings do not include salary information. CyprusTech.Careers requires employers to post a salary range with every listing.",
      },
      {
        question: "Can I search for remote tech jobs in Cyprus on Ergodotisi?",
        answer:
          "Ergodotisi has a general remote filter, but it applies across all sectors. CyprusTech.Careers has dedicated remote, hybrid, and on-site filters specifically for tech roles in Cyprus.",
      },
      {
        question: "Is Ergodotisi free for job seekers?",
        answer:
          "Yes, creating a candidate account and applying for jobs on Ergodotisi is free. CyprusTech.Careers is also free for candidates.",
      },
      {
        question: "Which platform has more tech job listings in Cyprus?",
        answer:
          "Ergodotisi has a larger overall volume of listings across all sectors. For tech-specific roles in Cyprus, CyprusTech.Careers curates only technology positions, so the signal-to-noise ratio is higher for developers and engineers.",
      },
    ],
    lastReviewed: "2026-04-01",
  },

  // ─── CyprusWork ───────────────────────────────────────────────
  {
    slug: "cypruswork",
    competitor: {
      name: "CyprusWork",
      url: "https://www.cypruswork.com",
      tagline: "General jobs board covering Cyprus",
      founded: "2010",
      type: "general",
      description:
        "CyprusWork is a generalist job portal serving the Cypriot market. It aggregates vacancies from employers and recruitment agencies across all industries. The site is English-language, straightforward to use, and accepts both direct employer postings and agency listings.",
    },
    metaTitle: "CyprusTech.Careers vs CyprusWork — Tech Job Search in Cyprus 2026",
    metaDescription:
      "Side-by-side comparison of CyprusTech.Careers and CyprusWork for technology professionals in Cyprus. Find out which job board is right for your tech career.",
    verdict:
      "CyprusWork is a capable general-purpose job board for the Cypriot market. For technology professionals, CyprusTech.Careers is the more targeted option — with tech-only listings, mandatory salary transparency, and smart filtering by tech stack. CyprusWork is worth checking if you're open to roles across multiple industries.",
    features: [
      { feature: "Tech-only listings", cyprusTech: true, competitor: false },
      { feature: "Salary transparency", cyprusTech: true, competitor: false },
      { feature: "Remote / hybrid filter", cyprusTech: true, competitor: "Basic" },
      { feature: "AI CV review", cyprusTech: true, competitor: false },
      { feature: "Tech stack filtering", cyprusTech: true, competitor: false },
      { feature: "Agency listings included", cyprusTech: false, competitor: true },
      { feature: "Non-tech job listings", cyprusTech: false, competitor: true },
      { feature: "English-language interface", cyprusTech: true, competitor: true },
      { feature: "Candidate profile / CV builder", cyprusTech: true, competitor: true },
    ],
    aboutCyprusTech:
      "CyprusTech.Careers is a niche job board built exclusively for the technology sector in Cyprus. Developers, engineers, data professionals, designers, and IT specialists can create a detailed profile — including their preferred tech stack, seniority level, and salary expectations — and receive personalised job alerts. Employers post with salary ranges required, making every listing fully transparent.",
    aboutCompetitor:
      "CyprusWork provides a clean English-language job search experience for the Cypriot market. It accepts postings from direct employers and recruitment agencies, covering sectors from accounting and legal through to technology and logistics. The platform's breadth makes it useful for multi-role hiring, but tech candidates need to apply category filters to surface relevant listings.",
    whoShouldUseCyprusTech: [
      "Tech professionals who want to avoid sifting through non-tech listings",
      "Candidates who need upfront salary data before applying",
      "Engineers seeking remote or hybrid roles in Cyprus",
      "Job seekers who want AI-powered CV feedback per role",
      "Tech startups and scale-ups hiring product and engineering teams",
    ],
    whoShouldUseCompetitor: [
      "Professionals open to roles across multiple industries",
      "Candidates working with recruitment agencies",
      "Employers with diverse cross-department hiring needs",
      "Job seekers who prefer English-language general boards",
    ],
    faq: [
      {
        question: "How does CyprusTech.Careers compare to CyprusWork for developers?",
        answer:
          "CyprusTech.Careers is purpose-built for developers and tech professionals — every listing is tech-related, salaries are shown upfront, and you can filter by specific technologies. CyprusWork covers all industries, so developers need to filter more carefully.",
      },
      {
        question: "Does CyprusWork display salary information on job ads?",
        answer:
          "Salary disclosure on CyprusWork depends on each employer or agency. Many listings do not include salary information. On CyprusTech.Careers, all listings must include a salary range.",
      },
      {
        question: "Are recruitment agency listings on CyprusTech.Careers?",
        answer:
          "CyprusTech.Careers currently focuses on direct employer postings for technology roles. CyprusWork includes both direct employer and recruitment agency listings.",
      },
      {
        question: "Which is easier to use for a tech job search in Cyprus?",
        answer:
          "Both platforms have clean English interfaces. CyprusTech.Careers requires less filtering because only tech roles are listed, making the search experience faster for developers and engineers.",
      },
      {
        question: "Is CyprusWork free to use?",
        answer:
          "CyprusWork is free for job seekers. CyprusTech.Careers is also free for candidates — creating a profile and applying for roles costs nothing.",
      },
    ],
    lastReviewed: "2026-04-01",
  },

  // ─── Carierista ────────────────────────────────────────────────
  {
    slug: "carierista",
    competitor: {
      name: "Carierista",
      url: "https://www.carierista.com",
      tagline: "Cyprus's bilingual career platform",
      founded: "2012",
      type: "general",
      description:
        "Carierista is a well-established bilingual (Greek and English) career platform focused on the Cypriot job market. It hosts a wide range of listings across finance, banking, professional services, tech, and more. The platform also publishes career advice content and salary surveys.",
    },
    metaTitle: "CyprusTech.Careers vs Carierista — Best Platform for Tech Jobs in Cyprus 2026",
    metaDescription:
      "Comparing CyprusTech.Careers and Carierista for technology professionals in Cyprus. Salary transparency, tech stack filters, and AI CV tools side by side.",
    verdict:
      "Carierista is one of the most reputable career platforms in Cyprus, particularly strong in finance and professional services. For tech roles, CyprusTech.Careers provides a more specialised experience: every listing is technology-focused, salaries are mandatory, and candidates get AI-powered CV matching. Tech professionals who also want career content and salary benchmarks may find value in using both.",
    features: [
      { feature: "Tech-only listings", cyprusTech: true, competitor: false },
      { feature: "Salary transparency", cyprusTech: true, competitor: false },
      { feature: "Remote / hybrid filter", cyprusTech: true, competitor: "Limited" },
      { feature: "AI CV review", cyprusTech: true, competitor: false },
      { feature: "Tech stack filtering", cyprusTech: true, competitor: false },
      { feature: "Career advice content", cyprusTech: false, competitor: true },
      { feature: "Salary survey reports", cyprusTech: false, competitor: true },
      { feature: "Bilingual (Greek/English)", cyprusTech: false, competitor: true },
      { feature: "Job alerts", cyprusTech: true, competitor: true },
    ],
    aboutCyprusTech:
      "CyprusTech.Careers exists to make tech hiring in Cyprus faster and fairer. All listings are technology roles — software, data, cloud, design, product, and IT. Candidates specify their tech stack and preferences; employers must disclose salaries. The result is a higher signal-to-noise ratio for both sides of the market.",
    aboutCompetitor:
      "Carierista has built a strong reputation in Cyprus since 2012, covering a broad range of professional roles and publishing original career content including salary surveys and career guides. Its finance and banking listings are particularly strong. The platform is bilingual and is widely used by both Cypriot and international professionals based on the island.",
    whoShouldUseCyprusTech: [
      "Developers and engineers who want a curated tech-only job board",
      "Candidates who prioritise salary transparency",
      "Remote workers seeking flexible tech roles in Cyprus",
      "Job seekers wanting AI-powered CV analysis before applying",
      "Tech companies that want their listings seen only by relevant candidates",
    ],
    whoShouldUseCompetitor: [
      "Finance, banking, and legal professionals in Cyprus",
      "Job seekers who want Cyprus salary benchmark data",
      "Candidates who prefer a Greek-language option",
      "Professionals looking for career advice alongside listings",
    ],
    faq: [
      {
        question: "Is CyprusTech.Careers or Carierista better for software developers in Cyprus?",
        answer:
          "CyprusTech.Careers is designed specifically for software developers and tech professionals. Carierista covers many more sectors and is particularly strong for finance and professional services. For a pure tech job search, CyprusTech.Careers will surface more relevant listings without manual filtering.",
      },
      {
        question: "Does Carierista publish salary information on listings?",
        answer:
          "Salary disclosure on Carierista is at the employer's discretion, and many listings omit this information. CyprusTech.Careers mandates salary ranges on all postings, so candidates always know what a role pays before applying.",
      },
      {
        question: "Does Carierista have a CV review tool?",
        answer:
          "Carierista does not currently offer an AI-powered CV review tool. CyprusTech.Careers includes a built-in AI CV reviewer that scores your CV against a specific job description and provides actionable improvement suggestions.",
      },
      {
        question: "Can I find remote tech jobs on Carierista?",
        answer:
          "Carierista includes some remote listings but does not have a dedicated remote-work or hybrid filter for tech specifically. CyprusTech.Careers has dedicated remote, hybrid, and on-site filters across all its tech listings.",
      },
      {
        question: "Is Carierista's salary survey useful for tech professionals?",
        answer:
          "Carierista's annual salary survey covers multiple sectors including technology, which makes it a useful benchmarking tool for tech professionals in Cyprus. CyprusTech.Careers complements this with live salary data visible on active job listings.",
      },
    ],
    lastReviewed: "2026-04-01",
  },

  // ─── Kariera.com.cy ───────────────────────────────────────────
  {
    slug: "kariera",
    competitor: {
      name: "Kariera.com.cy",
      url: "https://www.kariera.com.cy",
      tagline: "Greek-rooted career platform serving Cyprus",
      founded: "2009",
      type: "general",
      description:
        "Kariera.com.cy is the Cypriot extension of the Kariera brand originating in Greece. It serves the Cypriot job market with listings across all professional sectors, and is particularly recognised among employers who operate across both Cyprus and Greece.",
    },
    metaTitle: "CyprusTech.Careers vs Kariera.com.cy — Tech Jobs in Cyprus Compared 2026",
    metaDescription:
      "CyprusTech.Careers vs Kariera.com.cy for tech professionals in Cyprus. See how a dedicated tech job board compares to a general platform.",
    verdict:
      "Kariera.com.cy is a solid general-purpose career platform with cross-market coverage of Cyprus and Greece. For technology professionals working specifically in Cyprus, CyprusTech.Careers offers a more focused search experience — every listing is a tech role, salary ranges are always shown, and smart filtering by tech stack makes discovery faster.",
    features: [
      { feature: "Tech-only listings", cyprusTech: true, competitor: false },
      { feature: "Salary transparency", cyprusTech: true, competitor: false },
      { feature: "Remote / hybrid filter", cyprusTech: true, competitor: "Basic" },
      { feature: "AI CV review", cyprusTech: true, competitor: false },
      { feature: "Tech stack filtering", cyprusTech: true, competitor: false },
      { feature: "Greece + Cyprus coverage", cyprusTech: false, competitor: true },
      { feature: "Non-tech job listings", cyprusTech: false, competitor: true },
      { feature: "Employer branding tools", cyprusTech: "Basic", competitor: true },
      { feature: "Job alerts", cyprusTech: true, competitor: true },
    ],
    aboutCyprusTech:
      "CyprusTech.Careers is a Cyprus-native technology job board. By listing only tech roles and requiring full salary transparency, it aims to reduce friction for both candidates and employers in the island's growing tech sector. Candidates set up a profile once — tech stack, location preferences, salary expectations — and receive tailored alerts when matching roles appear.",
    aboutCompetitor:
      "Kariera.com.cy has served the Cypriot professional market since 2009 and benefits from its connection to the larger Greek-market Kariera brand. It covers a broad range of sectors and is used by multinational employers with offices across Cyprus and Greece. The platform offers employer branding and featured listings for companies that want greater visibility.",
    whoShouldUseCyprusTech: [
      "Software engineers and tech professionals based in Cyprus",
      "Candidates who want all listings to include salary ranges",
      "Tech workers seeking remote or hybrid opportunities",
      "Job seekers who want AI CV analysis tailored to each role",
      "Employers who want their tech vacancies seen by relevant candidates only",
    ],
    whoShouldUseCompetitor: [
      "Companies hiring across Cyprus and Greece simultaneously",
      "Professionals open to roles in multiple sectors",
      "Employers wanting advanced employer-branding tools",
      "Candidates interested in opportunities across the broader Greek-speaking market",
    ],
    faq: [
      {
        question: "Which is better for finding tech jobs in Cyprus — CyprusTech.Careers or Kariera.com.cy?",
        answer:
          "For tech-specific roles, CyprusTech.Careers is more targeted. Every listing is a technology role, salaries are always shown, and you can filter by tech stack. Kariera.com.cy covers all industries across Cyprus and Greece, so tech candidates need to apply more filters.",
      },
      {
        question: "Does Kariera.com.cy show salaries on job listings?",
        answer:
          "Salary display on Kariera.com.cy is determined by the employer; many listings do not include a salary. CyprusTech.Careers requires all employers to post a salary range, so candidates always see compensation before applying.",
      },
      {
        question: "Can I search for jobs across both Cyprus and Greece on CyprusTech.Careers?",
        answer:
          "CyprusTech.Careers focuses on technology roles in Cyprus. For jobs spanning Cyprus and Greece, Kariera.com.cy's cross-market presence may be more useful.",
      },
      {
        question: "Is there an AI-powered CV tool on Kariera.com.cy?",
        answer:
          "Kariera.com.cy does not currently offer an AI CV review feature. CyprusTech.Careers includes an AI CV reviewer that evaluates your CV against a specific job listing and provides a match score with personalised recommendations.",
      },
      {
        question: "Are both platforms free for job seekers?",
        answer:
          "Yes, both CyprusTech.Careers and Kariera.com.cy are free for candidates to register and apply for roles.",
      },
    ],
    lastReviewed: "2026-04-01",
  },

  // ─── CyprusJobs.com ───────────────────────────────────────────
  {
    slug: "cyprusjobs",
    competitor: {
      name: "CyprusJobs.com",
      url: "https://www.cyprusjobs.com",
      tagline: "Online recruitment platform for Cyprus",
      founded: "2005",
      type: "general",
      description:
        "CyprusJobs.com is one of Cyprus's longest-running online job boards, catering to employers and candidates across all industries. It offers a straightforward job search and CV submission experience and is well known among Cypriot employers for its ease of posting.",
    },
    metaTitle: "CyprusTech.Careers vs CyprusJobs.com — Tech Job Boards in Cyprus 2026",
    metaDescription:
      "Comparing CyprusTech.Careers and CyprusJobs.com for tech hiring in Cyprus. Discover which platform works best for software engineers and IT professionals.",
    verdict:
      "CyprusJobs.com is a veteran Cypriot job board with broad industry coverage and a simple posting experience. For technology professionals, CyprusTech.Careers offers a more specialised alternative — all listings are tech roles, salaries are always disclosed, and an AI CV review tool helps candidates prepare stronger applications. CyprusJobs.com remains useful for non-tech roles or employers with cross-department hiring.",
    features: [
      { feature: "Tech-only listings", cyprusTech: true, competitor: false },
      { feature: "Salary transparency", cyprusTech: true, competitor: false },
      { feature: "Remote / hybrid filter", cyprusTech: true, competitor: false },
      { feature: "AI CV review", cyprusTech: true, competitor: false },
      { feature: "Tech stack filtering", cyprusTech: true, competitor: false },
      { feature: "Non-tech job listings", cyprusTech: false, competitor: true },
      { feature: "Simple employer posting", cyprusTech: true, competitor: true },
      { feature: "CV database for employers", cyprusTech: false, competitor: true },
      { feature: "Job alerts", cyprusTech: true, competitor: true },
    ],
    aboutCyprusTech:
      "CyprusTech.Careers launched in 2024 to address a gap in the Cypriot market: a job board built exclusively for technology professionals. It combines curated tech listings, mandatory salary transparency, and AI-powered tools in one platform. Candidates create a profile with their tech stack and preferences; employers reach only relevant, pre-filtered candidates.",
    aboutCompetitor:
      "CyprusJobs.com has been facilitating employment in Cyprus since 2005. It serves a wide range of industries with a no-frills job search and application experience. Employers appreciate the platform's straightforward posting flow and access to a broad CV database. For generalist hiring across multiple departments, it remains a practical choice.",
    whoShouldUseCyprusTech: [
      "Developers, engineers, and IT professionals in Cyprus",
      "Tech candidates who want salary ranges shown upfront",
      "Workers seeking remote or hybrid technology roles",
      "Job seekers who want AI-guided CV improvements",
      "Tech-focused companies wanting more targeted candidate reach",
    ],
    whoShouldUseCompetitor: [
      "Employers hiring across non-tech departments",
      "Employers who want access to a broad CV database",
      "Job seekers looking for roles across all industries in Cyprus",
      "Candidates seeking a simple, no-account-required application flow",
    ],
    faq: [
      {
        question: "How does CyprusTech.Careers differ from CyprusJobs.com?",
        answer:
          "The main difference is focus: CyprusTech.Careers lists only technology roles in Cyprus, while CyprusJobs.com covers all industries. CyprusTech.Careers also mandates salary ranges on every listing and includes an AI CV review tool, which CyprusJobs.com does not offer.",
      },
      {
        question: "Does CyprusJobs.com show salaries on listings?",
        answer:
          "Salary information on CyprusJobs.com is optional for employers, so most listings do not include it. CyprusTech.Careers requires all employers to display a salary range.",
      },
      {
        question: "Is CyprusJobs.com good for tech job seekers?",
        answer:
          "CyprusJobs.com does include tech listings, but they are mixed with roles from all other sectors. For a focused tech job search in Cyprus, CyprusTech.Careers provides a better signal-to-noise ratio.",
      },
      {
        question: "Can employers search CVs on CyprusTech.Careers?",
        answer:
          "CyprusTech.Careers focuses on inbound job applications with candidate profiles and job alerts. CyprusJobs.com offers employers a CV database search to proactively reach candidates.",
      },
      {
        question: "Is CyprusJobs.com free for job seekers?",
        answer:
          "Yes, job seekers can browse and apply on CyprusJobs.com for free. CyprusTech.Careers is also entirely free for candidates.",
      },
    ],
    lastReviewed: "2026-04-01",
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return comparisons.find((c) => c.slug === slug);
}

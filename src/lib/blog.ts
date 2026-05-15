export interface BlogSection {
  type:     "h2" | "h3" | "paragraph" | "list" | "callout" | "quote";
  text?:    string;
  items?:   string[];
  variant?: "info" | "tip" | "warning";
}

export interface BlogPost {
  slug:        string;
  title:       string;
  excerpt:     string;
  author:      string;
  authorRole:  string;
  publishedAt: string;
  readTime:    number;
  category:    string;
  tags:        string[];
  content:     BlogSection[];
}

export const POSTS: BlogPost[] = [
  // ── Post 1 ────────────────────────────────────────────────────────────────
  {
    slug:        "limassol-tech-hub-2026",
    title:       "The Rise of Limassol as a Tech Hub: What's Driving It and Who's Hiring",
    excerpt:     "Limassol now accounts for nearly 70% of all tech roles in Cyprus. We break down the industries, the companies, and the economic forces turning a Mediterranean port city into one of Europe's most interesting tech scenes.",
    author:      "CyprusTech.Jobs Editorial",
    authorRole:  "Market Research",
    publishedAt: "2026-04-28",
    readTime:    9,
    category:    "Market Insights",
    tags:        ["Limassol", "Tech Hub", "Fintech", "Hiring", "Cyprus"],
    content: [
      { type: "paragraph", text: "A decade ago, Limassol was best known for its seafront promenade, its wine festival, and the offshore financial services firms that had quietly clustered around its port. Today, something different is happening. The city is in the middle of a sustained technology boom — one that has made it, by most measures, the most dynamic tech market in the eastern Mediterranean." },
      { type: "paragraph", text: "Walk through the Limassol Marina or past the cluster of glass-fronted offices along Spyrou Araouzou and you'll pass the logos of companies that process billions of euros in transactions every day. These are not startups finding their feet. They are global financial platforms with tens of millions of users — and they have chosen Limassol as a primary operating base." },
      { type: "paragraph", text: "The question worth asking is: why here, why now, and what does it mean for the tech job market?" },

      { type: "h2", text: "The Numbers Behind the Story" },
      { type: "paragraph", text: "Based on active job postings and company headcounts, Limassol now accounts for approximately 68% of all tech roles advertised in Cyprus. That figure is striking given that Nicosia — the capital — hosts the country's largest concentration of public-sector and banking employment. The tech industry has quietly reshaped the economic geography of the island." },
      { type: "paragraph", text: "The roles on offer span the full technical spectrum: software engineers, platform architects, data scientists, quantitative analysts, DevOps engineers, cybersecurity specialists, UX designers, product managers. But the single biggest driver of this concentration is the fintech and forex/CFD trading sector, which alone accounts for an estimated 45% of Limassol's tech workforce." },

      { type: "h2", text: "The Industries Driving It" },

      { type: "h3", text: "Fintech and Payments" },
      { type: "paragraph", text: "The major fintech platforms operating out of Limassol process millions of transactions daily from their Cyprus-based systems. They hire aggressively across full-stack engineering, backend infrastructure, and data engineering disciplines, and their presence has created a deep local talent market for these specialisations." },
      { type: "paragraph", text: "The reasons these companies chose Cyprus are layered. EU passporting rights allow Cyprus-registered entities to operate across all 27 member states without needing separate licences in each jurisdiction. Cyprus's 12.5% corporate tax rate — the joint-lowest in the EU — provides a structural cost advantage. And the non-domicile (non-dom) tax regime, which exempts qualifying individuals from dividend and passive income taxes for up to 17 years, makes the country genuinely attractive to the senior international talent these companies need to recruit." },

      { type: "h3", text: "Forex and CFD Trading" },
      { type: "paragraph", text: "Cyprus has been the European hub of choice for forex and CFD brokers since CySEC — the Cyprus Securities and Exchange Commission — became one of the first regulators globally to formally licence these products in the early 2010s. Dozens of major brokers have established their European headquarters in Limassol. The regulatory maturity of CySEC: strict enough to satisfy institutional counterparties, flexible enough to allow innovation, remains a competitive advantage that few other EU jurisdictions can match." },
      { type: "paragraph", text: "The tech roles in these firms tend to skew toward trading infrastructure, risk systems, and data. Backend engineers working on low-latency execution systems, quantitative developers building pricing models, and cybersecurity specialists protecting financial platforms are all in sustained demand." },

      { type: "h3", text: "Gaming and Interactive Entertainment" },
      { type: "paragraph", text: "Nicosia has established itself as a hub for gaming companies, but the gaming cluster's influence spreads across the island. A number of mobile gaming studios and iGaming platform providers have established engineering teams in Limassol specifically. The iGaming sector, which occupies a distinct but adjacent space to the fintech industry, has created demand for Unity developers, backend engineers, and data analysts with gambling-sector experience." },

      { type: "h2", text: "Why Limassol Specifically?" },
      { type: "paragraph", text: "This is the question that puzzles newcomers most. Cyprus has four major cities. Why has one of them accumulated such an outsized share of tech employment?" },
      { type: "list", items: [
        "Port city infrastructure: Limassol handles the majority of Cyprus's maritime trade, which historically attracted international business and the supporting infrastructure — English-speaking professional services, international schools, serviced apartments for relocating families.",
        "Climate and lifestyle: 320 days of sunshine, a functioning beach within walking distance of most offices, and a cost of living that remains materially lower than London or Amsterdam. For tech workers considering relocation, this matters enormously.",
        "English language prevalence: Limassol has a long history as an expat hub. English is the working language at most of the major tech employers and is widely spoken across the city's professional community.",
        "Proximity to Larnaca Airport: Cyprus's main international airport is a 45-minute drive from central Limassol — close enough for regular travel to headquarters in London, Amsterdam, or Tel Aviv.",
        "Network effects: Once a critical mass of tech firms established themselves, the recruiting pool deepened, specialist service providers followed, and the appeal compounded. Limassol today has a genuine tech community with meetups, co-working spaces, and cross-company talent circulation.",
      ]},

      { type: "h2", text: "Who's Hiring in 2026" },
      { type: "paragraph", text: "The active hiring market in Limassol in 2026 reflects both the sustained growth of established players and a wave of newer entrants. Established fintech and trading platforms continue to expand their local engineering teams, particularly in data infrastructure and platform reliability. Well-funded scale-ups and regional tech companies are building engineering presence in the city, creating demand at every experience level." },
      { type: "paragraph", text: "Beyond these headline names, a cohort of well-funded scale-ups and regional tech companies is building engineering presence in the city. Payments infrastructure companies, crypto custody platforms, and B2B SaaS businesses serving the financial sector are all recruiting actively. The hiring is not limited to senior engineers — there is strong demand at the mid-level (3–6 years of experience) across backend, data, and DevOps disciplines." },

      { type: "h2", text: "Salary Benchmarks for Limassol Tech Roles" },
      { type: "paragraph", text: "Salaries for tech roles in Limassol have risen materially over the past four years, driven by competition from the large fintech players and the global benchmarking that comes with international hiring practices." },
      { type: "list", items: [
        "Junior software engineer (0–2 years): €28,000–€42,000 gross/year",
        "Mid-level software engineer (3–5 years): €48,000–€72,000 gross/year",
        "Senior software engineer (6+ years): €75,000–€110,000 gross/year",
        "Engineering manager / Staff engineer: €90,000–€135,000 gross/year",
        "Data engineer / Data scientist (mid-senior): €52,000–€85,000 gross/year",
        "DevOps / Platform engineer (senior): €68,000–€100,000 gross/year",
        "Product manager (mid-senior): €55,000–€90,000 gross/year",
      ]},
      { type: "callout", variant: "info", text: "These figures represent gross annual salary in euros. Cyprus's personal income tax tops out at 35% for income above €60,001. Qualifying non-domiciled residents benefit from a 50% income tax exemption on first employment income above €100,000, making net packages highly competitive by European standards." },

      { type: "h2", text: "What This Means for Job Seekers" },
      { type: "paragraph", text: "If you are a software engineer, data professional, or product specialist considering a move, Limassol in 2026 offers something rare: a genuine abundance of well-paying roles from credible employers, in a jurisdiction that actively wants skilled tech workers and has the regulatory and fiscal infrastructure to welcome them." },
      { type: "paragraph", text: "The larger employers typically offer structured relocation support including flights, initial accommodation, and legal assistance with residency and work permit applications. The work permit process for non-EU nationals has been streamlined and typically takes eight to twelve weeks for tech professionals sponsored by licensed employers." },
      { type: "paragraph", text: "For EU/EEA nationals, there is no work permit requirement. You can start a role in Limassol as straightforwardly as in any other EU member state." },

      { type: "h2", text: "The Outlook" },
      { type: "paragraph", text: "The structural drivers of Limassol's tech boom — EU regulatory access, competitive tax, English-speaking talent pool, Mediterranean quality of life — are not going away. If anything, they are strengthening as geopolitical shifts make operating in stable, EU-regulated jurisdictions more valuable." },
      { type: "paragraph", text: "The risk, as with any concentrated cluster, is that wage inflation and housing costs eventually erode the cost advantage that originally made the city attractive. Limassol's residential market has already seen significant price appreciation. Whether the city can build enough housing and infrastructure to sustain growth without pricing out the mid-level talent it needs is the open question for the next decade." },
      { type: "paragraph", text: "For now, though, the hiring is real, the salaries are strong, and the pipeline of companies looking to establish or expand their Cyprus presence continues to grow." },

      { type: "callout", variant: "tip", text: "Browsing tech roles in Limassol? CyprusTech.Jobs lists every active position with verified salary ranges — no surprises, no salary negotiation theatre. Filter by city, category, or experience level to find what you're looking for." },
    ],
  },

  // ── Post 2 ────────────────────────────────────────────────────────────────
  {
    slug:        "attract-tech-talent-cyprus-hiring-guide-2026",
    title:       "How to Attract Tech Talent to Cyprus: A Hiring Guide for 2026",
    excerpt:     "Competing for engineers and data professionals in a global market is hard. This guide covers what tech candidates actually want, what salary benchmarks look like in 2026, how to structure a relocation package, and where to post your roles.",
    author:      "CyprusTech.Jobs Editorial",
    authorRole:  "Employer Insights",
    publishedAt: "2026-05-05",
    readTime:    11,
    category:    "Employer Guides",
    tags:        ["Hiring", "Recruitment", "Employer", "Salary", "Relocation"],
    content: [
      { type: "paragraph", text: "Hiring a senior backend engineer used to mean posting to a few job boards and waiting. In 2026, it means competing with remote-first employers in Berlin, Amsterdam, and London, while also competing with the other fintech and gaming companies across town. The tech talent market in Cyprus has internationalised and tightened in equal measure." },
      { type: "paragraph", text: "This guide is for hiring managers and HR teams at Cyprus-based tech companies who want to improve their hit rate. We cover salary benchmarking, relocation packages, what candidates actually read in a job posting, and where the hiring process most often goes wrong." },

      { type: "h2", text: "Understand the Candidate's Alternatives" },
      { type: "paragraph", text: "The first step in any effective recruiting strategy is understanding who you are actually competing with for a given candidate. For a senior React developer with five years of experience based in Warsaw, you are competing with every EU-based remote employer — which is essentially every employer in the world. For a backend engineer already living in Limassol, you are competing with the major fintech and tech employers in the area and dozens of other local companies all actively hiring." },
      { type: "paragraph", text: "This distinction matters because it shapes everything: how you pitch the role, what you offer in terms of package, and how much urgency you need to show in your process. A candidate who is comfortable relocating and excited about Cyprus has fundamentally different leverage than one who is already embedded in the local tech ecosystem and weighing competing offers." },
      { type: "callout", variant: "info", text: "Approximately 42% of candidates hired for Cyprus tech roles in 2025 relocated from abroad. The largest source countries were Ukraine, Egypt, India, Serbia, Romania, and the UK." },

      { type: "h2", text: "Salary Benchmarking: What the Market Actually Pays" },
      { type: "paragraph", text: "Underpaying relative to market is the single most common reason Cyprus tech employers lose candidates they wanted. Candidates do their research. They talk to peers, check public salary data, and increasingly expect job postings to include salary ranges upfront. If your offer comes in 20% below what someone with identical skills is earning across town, no amount of culture pitch will save the deal." },

      { type: "h3", text: "2026 Salary Benchmarks by Role" },
      { type: "list", items: [
        "Junior software engineer (0–2 yrs): €28,000–€42,000 gross/year",
        "Mid-level software engineer (3–5 yrs): €48,000–€72,000 gross/year",
        "Senior software engineer (6+ yrs): €75,000–€110,000 gross/year",
        "Staff / principal engineer: €100,000–€140,000 gross/year",
        "Backend engineer (Python / Go / Rust, fintech): €60,000–€100,000 gross/year",
        "Frontend engineer (React / TypeScript): €45,000–€80,000 gross/year",
        "Data engineer: €52,000–€85,000 gross/year",
        "Data scientist / ML engineer: €60,000–€95,000 gross/year",
        "DevOps / SRE / platform engineer: €58,000–€95,000 gross/year",
        "Engineering manager: €85,000–€130,000 gross/year",
        "Product manager: €55,000–€90,000 gross/year",
        "UX / product designer: €40,000–€70,000 gross/year",
        "QA engineer (automation): €35,000–€60,000 gross/year",
        "Cybersecurity / infosec specialist: €55,000–€90,000 gross/year",
      ]},
      { type: "paragraph", text: "These figures represent total gross salary before income tax. Performance bonuses, equity, and benefits are additional and vary significantly by employer and seniority. The major fintech players tend to pay at or above the top of these ranges for strong candidates. Smaller companies and non-fintech employers typically pay in the middle." },
      { type: "callout", variant: "warning", text: "These benchmarks will shift further in 2026 as EU Pay Transparency legislation requires Cyprus employers to include salary ranges in all job postings. Companies that withhold salary information will face regulatory pressure — and candidates are already filtering out postings without ranges." },

      { type: "h2", text: "What Tech Candidates Actually Care About in 2026" },
      { type: "paragraph", text: "Beyond salary, the candidates you most want to hire are evaluating employers on criteria that have shifted over the past three years. Here is what consistently matters most:" },
      { type: "list", items: [
        "Salary transparency from the first interaction: Candidates who see a salary range in a job posting are significantly more likely to apply. Those who do not are increasingly likely to assume the worst and move on.",
        "Engineering quality: Senior engineers ask about tech stack, code review culture, deployment frequency, incident rates, and whether there is meaningful technical work or just maintenance. A job description that lists only requirements and says nothing about the engineering environment loses strong candidates.",
        "Career trajectory and growth: What does progression look like? Is there a defined engineering ladder? Who are the technical leaders in the organisation and what is their background?",
        "Remote and hybrid flexibility: Even in Cyprus, where the weather makes office life pleasant, candidates now negotiate remote days as standard. Requiring five days in-office without strong justification is a meaningful disadvantage.",
        "Team composition and diversity: International candidates want to know they will be joining a team with colleagues from multiple countries. A homogeneous team is a mild red flag for candidates who value intellectual breadth.",
        "Speed of process: Candidates with multiple offers — which describes every strong mid-senior engineer — are impatient with slow hiring processes. An eight-week interview loop in 2026 is a losing strategy. Top candidates accept offers in two to three weeks.",
      ]},

      { type: "h2", text: "Relocation Packages: What Works and What Doesn't" },
      { type: "paragraph", text: "If you are hiring internationally, your relocation package is a significant selling point — or a dealbreaker. Here is what a competitive relocation package looks like for Cyprus-based tech roles in 2026:" },
      { type: "list", items: [
        "Flights: Return flights for the candidate (and partner / family if applicable) for an initial visit, plus one-way flights on the start date.",
        "Accommodation: One to three months of employer-provided or employer-subsidised accommodation to allow time to find a permanent rental.",
        "Relocation allowance: A lump sum of €1,500–€3,500 to cover shipping, visa fees, and incidental costs. Larger employers sometimes pay actuals rather than a fixed amount.",
        "Legal support: Assistance with the residence permit and employment registration process. For non-EU nationals, employer sponsorship of the work permit application. Candidates are not willing to navigate Ministry of Interior bureaucracy alone.",
        "Banking setup: Cyprus banking for international hires can be slow. Some employers have relationships with banks or fintech providers that accelerate this process.",
        "Settling-in support: School research, GP registration, car rental. Not universal, but highly valued by candidates with families.",
      ]},
      { type: "paragraph", text: "What does not work: a €500 'relocation contribution' paid after three months of employment. If you cannot afford a proper relocation package, say so clearly and adjust your salary expectation accordingly — candidates who really want the role will self-fund, but they need to know upfront." },

      { type: "h2", text: "The Work Permit Process for Non-EU Nationals" },
      { type: "paragraph", text: "Cyprus's work permit process for tech professionals has improved significantly with the introduction of the fast-track permit for skilled workers. Here is the current process for an employer sponsoring a non-EU national:" },
      { type: "list", items: [
        "Step 1: Candidate receives a job offer letter and employment contract.",
        "Step 2: Employer files a temporary employment permit application with the Civil Registry and Migration Department. For skilled tech professionals, this is processed under the fast-track scheme.",
        "Step 3: Processing typically takes 8–12 weeks. The candidate can enter Cyprus on a Category D long-stay visa while the permit is processed.",
        "Step 4: On approval, the permit is issued for one year and is renewable annually. After five years of continuous legal residence, the candidate may apply for permanent residence.",
      ]},
      { type: "callout", variant: "info", text: "EU/EEA nationals require no work permit. They can start employment in Cyprus as freely as in any other EU member state — which makes EU-national candidates significantly easier to onboard and is worth factoring into your sourcing strategy." },

      { type: "h2", text: "Writing a Job Description That Converts" },
      { type: "paragraph", text: "Most tech job descriptions are written by HR generalists working from a requirements list provided by an engineering manager. The result is a procurement specification. Good candidates — particularly those with options — stop reading after the first paragraph." },
      { type: "paragraph", text: "Here is what a job description that converts actually looks like:" },
      { type: "list", items: [
        "Lead with the interesting problem, not company boilerplate. What does this engineer actually build? What scale, what constraints, what technical decisions will they own?",
        "Include a salary range. This is both best practice and, under the incoming EU Pay Transparency Directive, a legal requirement. Ranges improve application quality and filter out mismatches early.",
        "Be honest about the tech stack. Candidates will find out in the technical interview. Advertising 'modern stack' when you are running a PHP monolith is counterproductive.",
        "Name the direct manager. Anonymous postings feel impersonal. A named hiring manager signals accountability.",
        "Describe what success looks like in 90 days — the actual outcome you need, not just a list of required years of experience.",
        "Keep it under 600 words. Job descriptions over 800 words have meaningfully lower application rates. Cut the boilerplate, keep the substance.",
      ]},

      { type: "h2", text: "Where to Post Your Roles" },
      { type: "paragraph", text: "For Cyprus-specific tech hiring, the most effective channels in 2026 are:" },
      { type: "list", items: [
        "CyprusTech.Jobs: The only job board dedicated exclusively to tech roles in Cyprus. All listings include salaries. Candidates on the platform are actively looking for Cyprus-based roles — they are not job-board generalists browsing everything.",
        "LinkedIn: Essential for senior roles where you are actively sourcing rather than waiting for inbounds. Cyprus's tech community is well-networked on LinkedIn.",
        "Referrals: In a city as small as Limassol, personal networks matter enormously. Engineering teams at the major employers all know each other. A referral programme that pays meaningfully and quickly consistently outperforms any job board for senior hires.",
        "Tech community channels: The Cyprus Tech community, local meetup groups, and Limassol-based co-working spaces are all useful for reaching passive candidates who are not actively job-hunting.",
      ]},
      { type: "callout", variant: "tip", text: "Listings on CyprusTech.Jobs go live within minutes. In-app applications mean candidates apply directly through the platform with their full profile — you receive structured data, CV, and cover letter without any email threading." },

      { type: "h2", text: "Common Hiring Mistakes to Avoid" },
      { type: "list", items: [
        "A 6-stage interview process: Two technical rounds and one values conversation is the maximum that strong candidates will tolerate in 2026. Every additional stage loses people.",
        "Ghosting after final round: Candidates talk. Limassol's tech community is small. Not sending a rejection after a final interview has reputational consequences that compound over time.",
        "Offering below the candidate's current salary without a compelling reason: Remote-first employers have normalised the idea that location should not depress compensation. A candidate in Limassol earning €70K should not be expected to take €58K to stay local.",
        "Moving the goalposts on scope mid-process: Starting a search for a senior engineer and ending it with a mid-level offer is the fastest way to permanently lose candidate trust.",
        "Ignoring the onboarding experience: Hiring is not complete when the offer is signed. A poor onboarding — slow equipment, no structure, no clarity on first priorities — leads to early-tenure regret and attrition within the probation period.",
      ]},
    ],
  },

  // ── Post 3 ────────────────────────────────────────────────────────────────
  {
    slug:        "eu-pay-transparency-directive-cyprus-employers",
    title:       "The EU Pay Transparency Directive: What Cyprus Tech Employers Need to Prepare For",
    excerpt:     "Directive 2023/970/EU must be transposed into national law by June 7, 2026. Most Cyprus employers aren't ready. Here's exactly what the directive requires, what the penalties are, and what you need to do before the deadline.",
    author:      "CyprusTech.Jobs Editorial",
    authorRole:  "Policy & Regulation",
    publishedAt: "2026-05-12",
    readTime:    10,
    category:    "Regulation",
    tags:        ["EU Directive", "Pay Transparency", "Compliance", "HR", "Employment Law"],
    content: [
      { type: "paragraph", text: "The EU Pay Transparency Directive (2023/970/EU) is one of the most significant pieces of employment legislation to affect the tech industry in years. Adopted in June 2023, it must be transposed into national law by EU member states — including Cyprus — by June 7, 2026. That deadline is approaching fast, and most Cyprus tech employers are significantly underprepared." },
      { type: "paragraph", text: "This article sets out exactly what the directive requires, what the penalties for non-compliance are, and what practical steps tech companies in Cyprus should be taking now." },
      { type: "callout", variant: "warning", text: "The transposition deadline is June 7, 2026. Cyprus's Labour Ministry has not yet published its full transposing legislation. However, the directive's requirements are directly applicable in key areas, and courts in other member states are already applying its provisions. Waiting for the local law to be published before acting is a high-risk strategy." },

      { type: "h2", text: "What Is the EU Pay Transparency Directive?" },
      { type: "paragraph", text: "Directive 2023/970/EU on Pay Transparency was passed to address the gender pay gap, which sits at around 13% across the EU — and higher in sectors including financial services and technology. The mechanism chosen was radical: rather than relying on pay audits after the fact, the directive requires transparency at every stage of the employment relationship: before hiring, during employment, and across the organisation as a whole." },
      { type: "paragraph", text: "For employers, this means a fundamental shift in how compensation is discussed, disclosed, and documented. The era of 'competitive salary' in job postings, secretive pay bands, and HR teams routinely refusing to discuss relative compensation is ending — by law." },

      { type: "h2", text: "The Five Key Requirements" },

      { type: "h3", text: "1. Salary Information in Job Postings" },
      { type: "paragraph", text: "Employers must provide information about the starting salary or salary range in every job posting, or before the job interview begins. The range must be based on objective, gender-neutral criteria. Employers cannot ask candidates what they currently earn or what their previous salary was — this prohibition is absolute." },
      { type: "paragraph", text: "This requirement alone will transform the job advertising landscape in Cyprus, where salary ranges are currently disclosed in fewer than 40% of tech job postings. CyprusTech.Jobs has required salary disclosure on all listings since launch — a policy that predates the directive but is now legally mandated." },

      { type: "h3", text: "2. Right to Pay Information for Employees" },
      { type: "paragraph", text: "Current employees have the right to request information about their individual pay level and the average pay levels for workers doing the same work or work of equal value, broken down by gender. Employers must respond within two months and must inform employees annually of this right." },
      { type: "paragraph", text: "This is a significant change for most tech companies, where pay structures are typically opaque and managers are often instructed not to discuss salaries. The directive does not require full pay disclosure to all employees — it requires the right to request comparator data for specific roles. But that right will be exercised." },

      { type: "h3", text: "3. Pay Reporting Obligations" },
      { type: "paragraph", text: "Companies with 250 or more employees must publish annual reports on the gender pay gap within their organisation, broken down by category of worker. Companies with 150–249 employees must publish every three years. Companies with 100–149 employees face the same three-year obligation from 2031. Companies under 100 employees are not subject to mandatory pay gap reporting, though they remain subject to all individual transparency requirements." },
      { type: "paragraph", text: "The reports must be submitted to a designated national authority and made publicly available. Non-compliant employers face investigation by the national equality body." },

      { type: "h3", text: "4. Joint Pay Assessments" },
      { type: "paragraph", text: "Where a pay gap report reveals a gender pay gap of 5% or more in any category of worker, and the gap cannot be justified by objective, gender-neutral factors, employers must carry out a joint pay assessment in cooperation with employee representatives. The assessment must result in an action plan with concrete measures and a timeline." },
      { type: "paragraph", text: "For the tech sector specifically, where female representation in engineering roles is typically below 30%, this provision is likely to be triggered frequently. Employers that have not done pay equity analysis will find themselves in a difficult position when the reporting obligation materialises." },

      { type: "h3", text: "5. Effective Remedies and Burden of Proof" },
      { type: "paragraph", text: "The directive reverses the burden of proof in pay discrimination cases: if an employee brings a claim, the employer must demonstrate that there was no pay discrimination. Employees are entitled to full compensation for damages, including back pay and compensation for lost opportunities. There is no cap on damages. Member states must ensure effective, proportionate, and dissuasive penalties — meaning significant fines for non-compliant employers." },

      { type: "h2", text: "The Practical Impact for Cyprus Tech Companies" },
      { type: "paragraph", text: "The directive's requirements interact with the Cyprus tech market in specific and consequential ways." },

      { type: "h3", text: "International hiring practices must change" },
      { type: "paragraph", text: "The prohibition on asking candidates about previous salary is significant for companies that have historically calibrated offers based on a candidate's stated current earnings. The practice of adjusting an offer downward because a candidate is relocating from a lower-cost country will no longer be permissible if it produces a gender pay gap. Salary bands need to be set by role and level — not by individual negotiation history." },

      { type: "h3", text: "Pay structures need to be formalised" },
      { type: "paragraph", text: "Many fast-growing tech companies in Cyprus have informal or inconsistent pay structures — salaries were set opportunistically, based on candidate negotiation, at various points in the company's growth. Under the directive, an employee request for comparator pay information could expose these inconsistencies publicly. The time to audit and formalise your pay structure is before that request arrives." },

      { type: "h3", text: "HR and legal functions need updating" },
      { type: "paragraph", text: "Job description templates need to include salary ranges. Recruitment policies need to remove any guidance on asking about current salary. HR systems need to be capable of generating the category-level gender pay gap reports the directive requires. Employment contracts and offer letters may need revision to reflect employees' new rights." },

      { type: "h2", text: "What You Should Be Doing Now" },
      { type: "list", items: [
        "Audit your current pay structure: Map every role to a level, establish salary bands for each level, and check whether bands are applied consistently. Flag outliers — particularly those that correlate with gender — for immediate attention.",
        "Update your job posting templates: Every posting, from today, should include a salary range. This is both a legal requirement from June 2026 and, as a practical matter, it significantly improves application quality and volume.",
        "Remove 'current salary' from your application forms and recruiter briefings: The prohibition on asking for this information is one of the directive's clearest provisions. Remove this question from all stages of the recruitment process now.",
        "Establish an internal right-to-pay-information process: Draft a clear policy covering how employees request pay comparator data, who responds, and what the response includes. This process will be tested from day one.",
        "Check whether you hit the reporting threshold: If your Cyprus headcount is at or near 100 employees, begin preparing for reporting obligations. The first reporting period for 250+ employee companies covers 2026 data.",
        "Engage legal and HR counsel now: The transposing legislation will contain Cyprus-specific details on enforcement, penalties, and procedural requirements. Engaging employment law counsel before the law is passed is better than scrambling afterwards.",
      ]},

      { type: "h2", text: "The Business Case Beyond Compliance" },
      { type: "paragraph", text: "It is worth noting that pay transparency, independently of the legal requirement, is consistently associated with better hiring outcomes. CyprusTech.Jobs has required salary disclosure since launch, and the data is clear: job postings with salary ranges receive significantly more applications than those without, and the applications that arrive are better qualified — because candidates who apply know the package works for them." },
      { type: "paragraph", text: "Pay transparency also reduces the gender pay gap — the very problem the directive is designed to address. When salary bands are published and applied consistently, the individual negotiation dynamics that systematically disadvantage women are removed. Companies that have done this voluntarily report both a narrower pay gap and a better candidate experience." },
      { type: "paragraph", text: "The directive is an opportunity, not just a compliance burden. Companies that treat it as such — using it as a forcing function to build fairer, more structured, more transparent compensation systems — will find that they are better at recruiting and retaining the talent they need in 2026 and beyond." },

      { type: "h2", text: "Key Dates to Put in Your Calendar" },
      { type: "list", items: [
        "June 7, 2026 — Transposition deadline: EU member states, including Cyprus, must enact national legislation implementing the directive.",
        "2027 (first reporting cycle) — Large employers (250+ employees) must submit their first gender pay gap report covering 2026 data.",
        "2031 — The smallest mandatory reporting threshold (100–149 employees) comes into force.",
      ]},

      { type: "callout", variant: "tip", text: "CyprusTech.Jobs already requires salary ranges on all job postings — putting you ahead of the directive's most visible requirement today. Post your next role with a salary range and reach candidates who actively filter for transparent employers." },
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find(p => p.slug === slug);
}

// ── DB-backed blog helpers (for admin-created posts) ─────────────────────────

import { prisma } from "./prisma";
import type { BlogPost as PrismaBlogPost } from "@prisma/client";

function dbToPost(p: PrismaBlogPost): BlogPost {
  return {
    slug:        p.slug,
    title:       p.title,
    excerpt:     p.excerpt,
    author:      p.author,
    authorRole:  p.authorRole,
    publishedAt: p.publishedAt.toISOString(),
    readTime:    p.readTime,
    category:    p.category,
    tags:        p.tags,
    content:     (p.content as unknown as BlogSection[]) ?? [],
  };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const dbPosts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });
  const dbConverted = dbPosts.map(dbToPost);
  // Merge: static posts first (they have older publish dates), then DB posts
  // Deduplicate by slug in case a static post was re-created in DB
  const dbSlugs = new Set(dbConverted.map(p => p.slug));
  const staticFiltered = POSTS.filter(p => !dbSlugs.has(p.slug));
  return [...dbConverted, ...staticFiltered].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getAnyPost(slug: string): Promise<BlogPost | undefined> {
  // Check DB first (admin posts take precedence)
  const dbPost = await prisma.blogPost.findUnique({ where: { slug } });
  if (dbPost?.published) return dbToPost(dbPost);
  // Fall back to static
  return getPost(slug);
}

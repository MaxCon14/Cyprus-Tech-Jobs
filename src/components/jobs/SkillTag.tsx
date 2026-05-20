"use client";

import { useState } from "react";

export const SKILL_ICONS: Record<string, string> = {
  /* Languages */
  "JavaScript":         "javascript",
  "TypeScript":         "typescript",
  "Python":             "python",
  "Go":                 "go",
  "Rust":               "rust",
  "Java":               "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  "Kotlin":             "kotlin",
  "Swift":              "swift",
  "C++":                "cplusplus",
  "C#":                 "csharp",
  "PHP":                "php",
  "Ruby":               "ruby",
  "Scala":              "scala",
  "Elixir":             "elixir",
  "Dart":               "dart",
  "Groovy":             "apachegroovy",
  "Solidity":           "solidity",
  "R":                  "r",
  "MATLAB":             "mathworks",

  /* Frontend */
  "React":              "react",
  "React Native":       "react",
  "Next.js":            "nextdotjs",
  "Vue.js":             "vuedotjs",
  "Vue":                "vuedotjs",
  "Nuxt.js":            "nuxtdotjs",
  "Angular":            "angular",
  "Svelte":             "svelte",
  "SvelteKit":          "svelte",
  "Remix":              "remix",
  "Astro":              "astro",
  "Redux":              "redux",
  "Three.js":           "threedotjs",
  "Tailwind CSS":       "tailwindcss",
  "Sass":               "sass",
  "SCSS/Sass":          "sass",
  "Storybook":          "storybook",
  "Webpack":            "webpack",
  "Vite":               "vite",
  "HTML":               "html5",
  "CSS":                "css3",

  /* Backend / Frameworks */
  "Node.js":            "nodedotjs",
  "Express":            "express",
  "NestJS":             "nestjs",
  "Django":             "django",
  "FastAPI":            "fastapi",
  "Flask":              "flask",
  "Laravel":            "laravel",
  "Rails":              "rubyonrails",
  "Spring Boot":        "springboot",
  "Spring":             "spring",
  ".NET":               "dotnet",
  "GraphQL":            "graphql",
  "Bun":                "bun",
  "Deno":               "deno",

  /* Mobile */
  "Flutter":            "flutter",
  "Android":            "android",
  "iOS":                "apple",
  "Expo":               "expo",

  /* Databases */
  "PostgreSQL":         "postgresql",
  "MySQL":              "mysql",
  "MongoDB":            "mongodb",
  "Redis":              "redis",
  "Elasticsearch":      "elasticsearch",
  "Cassandra":          "apachecassandra",
  "DynamoDB":           "amazondynamodb",
  "Firebase":           "firebase",
  "Supabase":           "supabase",
  "Snowflake":          "snowflake",
  "BigQuery":           "googlebigquery",
  "Prisma":             "prisma",
  "Hibernate":          "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/hibernate/hibernate-original.svg",
  "ClickHouse":         "clickhouse",
  "CockroachDB":        "cockroachlabs",
  "Pandas":             "pandas",
  "pandas":             "pandas",
  "NumPy":              "numpy",
  "Jupyter":            "jupyter",

  /* Cloud / DevOps */
  "Docker":             "docker",
  "Kubernetes":         "kubernetes",
  "AWS":                "amazonaws",
  "Azure":              "microsoftazure",
  "GCP":                "googlecloud",
  "Terraform":          "terraform",
  "Ansible":            "ansible",
  "Nginx":              "nginx",
  "Linux":              "linux",
  "GitHub Actions":     "githubactions",
  "GitLab CI":          "gitlab",
  "CircleCI":           "circleci",
  "Jenkins":            "jenkins",
  "Prometheus":         "prometheus",
  "Grafana":            "grafana",
  "Datadog":            "datadog",
  "New Relic":          "newrelic",
  "Vercel":             "vercel",
  "Netlify":            "netlify",
  "Cloudflare":         "cloudflare",
  "Helm":               "helm",
  "Sentry":             "sentry",

  /* Data */
  "Kafka":              "apachekafka",
  "Spark":              "apachespark",
  "Apache Spark":       "apachespark",
  "Airflow":            "apacheairflow",
  "RabbitMQ":           "rabbitmq",
  "dbt":                "dbt",

  /* Build / Test */
  "Gradle":             "gradle",
  "Maven":              "apachemaven",
  "Selenium":           "selenium",
  "Cypress":            "cypress",
  "Jest":               "jest",
  "Playwright":         "playwright",
  "Swagger":            "swagger",
  "Vitest":             "vitest",
  "k6":                 "k6",
  "OpenTelemetry":      "opentelemetry",

  /* Tools */
  "Figma":              "figma",
  "Git":                "git",
  "GitHub":             "github",
  "GitLab":             "gitlab",
  "Jira":               "jira",
  "Confluence":         "confluence",
  "Bitbucket":          "bitbucket",
  "Postman":            "postman",
  "Insomnia":           "insomnia",
  "OWASP":              "owasp",
  "VS Code":            "visualstudiocode",
  "Vim":                "vim",
  "IntelliJ":           "intellijidea",
  "Xcode":              "xcode",
  "Android Studio":     "androidstudio",

  /* Auth / Payments / Comms */
  "Auth0":              "auth0",
  "Stripe":             "stripe",
  "Twilio":             "twilio",
  "SendGrid":           "sendgrid",

  /* Design & Creative — Adobe suite */
  "Adobe Photoshop":    "adobephotoshop",
  "Adobe Illustrator":  "adobeillustrator",
  "Adobe InDesign":     "adobeindesign",
  "Adobe After Effects":"adobeaftereffects",
  "Adobe Premiere Pro": "adobepremierepro",
  "Adobe Lightroom":    "adobelightroom",
  "Adobe XD":           "adobexd",
  "Adobe Audition":     "adobeaudition",
  "Adobe Animate":      "adobeanimate",
  "Adobe Dimension":    "adobedimension",
  "Adobe Acrobat":      "adobeacrobat",
  "Adobe Dreamweaver":  "adobedreamweaver",

  /* Design & Creative — Affinity suite */
  "Affinity Designer":  "affinitydesigner",
  "Affinity Photo":     "affinityphoto",
  "Affinity Publisher": "affinitypublisher",

  /* Design & Creative — Other tools */
  "Canva":              "canva",
  "Sketch":             "sketch",
  "Framer":             "framer",
  "Webflow":            "webflow",
  "InVision":           "invision",
  "Zeplin":             "zeplin",
  "Marvel":             "marvelapp",

  /* 3D, Motion & Game */
  "Blender":            "blender",
  "Cinema 4D":          "cinema4d",
  "Unity":              "unity",
  "Unreal Engine":      "unrealengine",
  "DaVinci Resolve":    "davinciresolve",

  /* Marketing & Analytics */
  "Google Analytics":   "googleanalytics",
  "Google Ads":         "googleads",
  "HubSpot":            "hubspot",
  "Mailchimp":          "mailchimp",
  "Mixpanel":           "mixpanel",
  "Amplitude":          "amplitude",
  "Hotjar":             "hotjar",
  "WordPress":          "wordpress",
  "Shopify":            "shopify",
  "WooCommerce":        "woocommerce",

  /* AI & ML */
  "TensorFlow":         "tensorflow",
  "PyTorch":            "pytorch",
  "Hugging Face":       "huggingface",
  "OpenAI API":         "openai",
  "LangChain":          "langchain",
  "scikit-learn":       "scikitlearn",

  /* Productivity & Collaboration */
  "Notion":             "notion",
  "Slack":              "slack",
  "Linear":             "linear",
  "Asana":              "asana",
  "Trello":             "trello",
  "Monday.com":         "mondaydotcom",
  "Microsoft Office":   "microsoftoffice",
  "Google Workspace":   "googleworkspace",
};

/** Returns a full icon URL for a skill name, or null if no icon is available. */
export function getIconSrc(name: string): string | null {
  const entry = SKILL_ICONS[name];
  if (!entry) return null;
  if (entry.startsWith("https://")) return entry;
  return `https://cdn.simpleicons.org/${entry}`;
}

export function SkillTag({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const [iconFailed, setIconFailed] = useState(false);
  const src = getIconSrc(name);

  const padding  = size === "md" ? "7px 12px" : undefined;
  const fontSize = size === "md" ? 13 : undefined;

  return (
    <span className="tag tag-skill" style={size === "md" ? { padding, fontSize, gap: 7 } : undefined}>
      {src && !iconFailed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={13}
          height={13}
          className="skill-tag-icon"
          onError={() => setIconFailed(true)}
        />
      )}
      {name}
    </span>
  );
}

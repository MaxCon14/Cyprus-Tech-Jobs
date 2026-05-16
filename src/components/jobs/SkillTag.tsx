"use client";

import { useState } from "react";

export const SKILL_ICONS: Record<string, string> = {
  /* Languages */
  "JavaScript":     "javascript",
  "TypeScript":     "typescript",
  "Python":         "python",
  "Go":             "go",
  "Rust":           "rust",
  "Java":           "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  "Kotlin":         "kotlin",
  "Swift":          "swift",
  "C++":            "cplusplus",
  "C#":             "csharp",
  "PHP":            "php",
  "Ruby":           "ruby",
  "Scala":          "scala",
  "Elixir":         "elixir",
  "Dart":           "dart",
  "Groovy":         "apachegroovy",
  "Solidity":       "solidity",
  "R":              "r",

  /* Frontend */
  "React":          "react",
  "React Native":   "react",
  "Next.js":        "nextdotjs",
  "Vue.js":         "vuedotjs",
  "Vue":            "vuedotjs",
  "Nuxt.js":        "nuxtdotjs",
  "Angular":        "angular",
  "Svelte":         "svelte",
  "Remix":          "remix",
  "Redux":          "redux",
  "Three.js":       "threedotjs",
  "Tailwind CSS":   "tailwindcss",
  "Sass":           "sass",
  "Storybook":      "storybook",
  "Webpack":        "webpack",
  "Vite":           "vite",
  "HTML":           "html5",
  "CSS":            "css3",

  /* Backend / Frameworks */
  "Node.js":        "nodedotjs",
  "Express":        "express",
  "NestJS":         "nestjs",
  "Django":         "django",
  "FastAPI":        "fastapi",
  "Flask":          "flask",
  "Laravel":        "laravel",
  "Rails":          "rubyonrails",
  "Spring Boot":    "springboot",
  "Spring":         "spring",
  ".NET":           "dotnet",
  "GraphQL":        "graphql",

  /* Mobile */
  "Flutter":        "flutter",
  "Android":        "android",
  "iOS":            "apple",

  /* Databases */
  "PostgreSQL":     "postgresql",
  "MySQL":          "mysql",
  "MongoDB":        "mongodb",
  "Redis":          "redis",
  "Elasticsearch":  "elasticsearch",
  "Cassandra":      "apachecassandra",
  "DynamoDB":       "amazondynamodb",
  "Firebase":       "firebase",
  "Supabase":       "supabase",
  "Snowflake":      "snowflake",
  "BigQuery":       "googlebigquery",
  "Prisma":         "prisma",
  "Hibernate":      "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/hibernate/hibernate-original.svg",

  /* Cloud / DevOps */
  "Docker":         "docker",
  "Kubernetes":     "kubernetes",
  "AWS":            "amazonaws",
  "Azure":          "microsoftazure",
  "GCP":            "googlecloud",
  "Terraform":      "terraform",
  "Ansible":        "ansible",
  "Nginx":          "nginx",
  "Linux":          "linux",
  "GitHub Actions": "githubactions",
  "GitLab CI":      "gitlab",
  "CircleCI":       "circleci",
  "Jenkins":        "jenkins",
  "Prometheus":     "prometheus",
  "Grafana":        "grafana",
  "Datadog":        "datadog",
  "New Relic":      "newrelic",
  "Vercel":         "vercel",
  "Helm":           "helm",

  /* Data */
  "Kafka":          "apachekafka",
  "Spark":          "apachespark",
  "Airflow":        "apacheairflow",
  "RabbitMQ":       "rabbitmq",
  "dbt":            "dbt",

  /* Build / Test */
  "Gradle":         "gradle",
  "Maven":          "apachemaven",
  "Selenium":       "selenium",
  "Cypress":        "cypress",
  "Jest":           "jest",
  "Playwright":     "playwright",
  "Swagger":        "swagger",

  /* Tools */
  "Figma":          "figma",
  "Git":            "git",
  "GitHub":         "github",
  "GitLab":         "gitlab",
  "Jira":           "jira",
  "Confluence":     "confluence",
  "Bitbucket":      "bitbucket",
  "Postman":        "postman",
  "OWASP":          "owasp",
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
          className="skill-tag-icon"
          onError={() => setIconFailed(true)}
        />
      )}
      {name}
    </span>
  );
}

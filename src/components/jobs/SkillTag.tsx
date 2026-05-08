"use client";

import { useState } from "react";

export const SKILL_ICONS: Record<string, string> = {
  /* Languages */
  "JavaScript":     "javascript",
  "TypeScript":     "typescript",
  "Python":         "python",
  "Go":             "go",
  "Rust":           "rust",
  "Java":           "java",
  "Kotlin":         "kotlin",
  "Swift":          "swift",
  "C++":            "cplusplus",
  "C#":             "csharp",
  "PHP":            "php",
  "Ruby":           "ruby",
  "Scala":          "scala",
  "Elixir":         "elixir",
  "Dart":           "dart",
  "Solidity":       "solidity",
  "R":              "r",

  /* Frontend */
  "React":          "react",
  "React Native":   "react",
  "Next.js":        "nextdotjs",
  "Vue.js":         "vuedotjs",
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

  /* Data */
  "Kafka":          "apachekafka",
  "Spark":          "apachespark",
  "Airflow":        "apacheairflow",
  "RabbitMQ":       "rabbitmq",
  "dbt":            "dbt",

  /* Tools */
  "Figma":          "figma",
  "Git":            "git",
  "GitHub":         "github",
  "GitLab":         "gitlab",
  "Jira":           "jira",
  "OWASP":          "owasp",
};

export function SkillTag({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const [iconFailed, setIconFailed] = useState(false);
  const slug = SKILL_ICONS[name];

  const padding  = size === "md" ? "7px 12px" : undefined;
  const fontSize = size === "md" ? 13 : undefined;

  return (
    <span className="tag tag-skill" style={size === "md" ? { padding, fontSize, gap: 7 } : undefined}>
      {slug && !iconFailed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://cdn.simpleicons.org/${slug}`}
          alt=""
          className="skill-tag-icon"
          onError={() => setIconFailed(true)}
        />
      )}
      {name}
    </span>
  );
}

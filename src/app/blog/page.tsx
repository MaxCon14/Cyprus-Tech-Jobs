import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cyprus Tech Jobs Blog — Market Insights & Hiring Guides",
  description: "Hiring guides, salary insights, and market trends for Cyprus's tech industry. Advice for employers and job seekers alike.",
  alternates: { canonical: "https://cyprustech.careers/blog" },
  openGraph: {
    title: "Cyprus Tech Jobs Blog — Market Insights & Hiring Guides",
    description: "Hiring guides, salary insights, and market trends for Cyprus's tech industry.",
    url: "https://cyprustech.careers/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cyprus Tech Jobs Blog",
    description: "Market insights, hiring guides, and salary trends for Cyprus tech.",
  },
};

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  "Market Insights": { bg: "var(--accent-soft)",  color: "var(--accent)" },
  "Employer Guides": { bg: "var(--success-bg)",   color: "var(--success)" },
  "Regulation":      { bg: "var(--warning-bg)",   color: "var(--warning)" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPage() {
  const posts = await getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="page-container" style={{ paddingBlock: "clamp(24px, 4vw, 40px)" }}>

      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 20, height: 1, background: "var(--accent)", display: "inline-block" }} />
          CYPRUSTECH.JOBS BLOG
        </div>
        <h1 className="display-m" style={{ marginBottom: 10 }}>Insights for Cyprus tech</h1>
        <p className="body-l" style={{ color: "var(--text-muted)", maxWidth: 540 }}>
          Hiring guides, market analysis, and regulatory updates for the people building Cyprus's tech industry.
        </p>
      </div>

      {/* Featured post */}
      <Link
        href={`/blog/${featured.slug}`}
        style={{ textDecoration: "none", display: "block", marginBottom: 48 }}
      >
        <div style={{
          border: "1px solid var(--border)", borderRadius: 16,
          padding: "clamp(28px, 4vw, 48px)",
          background: "var(--surface)",
          transition: "border-color 180ms, box-shadow 180ms",
          position: "relative", overflow: "hidden",
        }}>
          {/* Background accent */}
          <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "var(--accent)", opacity: 0.04, pointerEvents: "none" }} />

          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <CategoryBadge category={featured.category} />
              <span className="tag tag-accent" style={{ fontSize: 10 }}>FEATURED</span>
            </div>

            <h2 className="display-m" style={{ marginBottom: 16, maxWidth: 680, lineHeight: 1.2 }}>
              {featured.title}
            </h2>

            <p className="body-l" style={{ color: "var(--text-muted)", maxWidth: 640, lineHeight: 1.65, marginBottom: 28 }}>
              {featured.excerpt}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <AuthorChip author={featured.author} role={featured.authorRole} />
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--border-strong)" }} />
              <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{formatDate(featured.publishedAt)}</span>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--border-strong)" }} />
              <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{featured.readTime} MIN READ</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Remaining posts */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 40 }}>
        <h2 className="h2" style={{ marginBottom: 28 }}>More articles</h2>
        <div className="grid-2" style={{ gap: 20 }}>
          {rest.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} style={{ textDecoration: "none", display: "block" }}>
              <article style={{
                border: "1px solid var(--border)", borderRadius: 12,
                padding: "clamp(20px, 3vw, 28px)",
                background: "var(--surface)", height: "100%",
                display: "flex", flexDirection: "column",
                transition: "border-color 180ms",
              }}>
                <CategoryBadge category={post.category} />

                <h3 className="h2" style={{ margin: "14px 0 12px", lineHeight: 1.25, flex: 1 }}>
                  {post.title}
                </h3>

                <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 20 }}>
                  {post.excerpt}
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: "auto" }}>
                  <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{formatDate(post.publishedAt)}</span>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--border-strong)" }} />
                  <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{post.readTime} min read</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const colors = CATEGORY_COLORS[category] ?? { bg: "var(--bg-muted)", color: "var(--text-muted)" };
  return (
    <span className="mono-s" style={{
      display: "inline-block",
      padding: "4px 10px", borderRadius: 6, fontSize: 10,
      background: colors.bg, color: colors.color, fontWeight: 700,
    }}>
      {category.toUpperCase()}
    </span>
  );
}

function AuthorChip({ author, role }: { author: string; role: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: "var(--accent-soft)", display: "grid", placeItems: "center",
        fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 11, color: "var(--accent)",
        flexShrink: 0,
      }}>
        {author.charAt(0)}
      </div>
      <div>
        <div className="body-s" style={{ fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>{author}</div>
        <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{role}</div>
      </div>
    </div>
  );
}

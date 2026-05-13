import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, POSTS, type BlogSection } from "@/lib/blog";
import { ChevronLeft, Clock, Info, Lightbulb, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export function generateStaticParams() {
  return POSTS.map(p => ({ slug: p.slug }));
}

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  "Market Insights": { bg: "var(--accent-soft)",  color: "var(--accent)" },
  "Employer Guides": { bg: "var(--success-bg)",   color: "var(--success)" },
  "Regulation":      { bg: "var(--warning-bg)",   color: "var(--warning)" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const catColors = CATEGORY_COLORS[post.category] ?? { bg: "var(--bg-muted)", color: "var(--text-muted)" };

  // Related posts (other posts, up to 2)
  const related = POSTS.filter(p => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="page-container" style={{ paddingBlock: "clamp(24px, 4vw, 40px)" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
        <Link href="/blog" style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-muted)", textDecoration: "none", fontSize: 13 }}>
          <ChevronLeft size={14} /> Blog
        </Link>
        <span style={{ color: "var(--border-strong)" }}>/</span>
        <span className="body-s" style={{ color: "var(--text-subtle)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>{post.title}</span>
      </div>

      <div className="layout-sidebar-right" style={{ alignItems: "flex-start" }}>

        {/* Article */}
        <article>
          {/* Category */}
          <span className="mono-s" style={{
            display: "inline-block", padding: "4px 10px", borderRadius: 6, fontSize: 10,
            background: catColors.bg, color: catColors.color, fontWeight: 700, marginBottom: 20,
          }}>
            {post.category.toUpperCase()}
          </span>

          {/* Title */}
          <h1 className="display-m" style={{ marginBottom: 24, lineHeight: 1.2 }}>{post.title}</h1>

          {/* Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", paddingBottom: 28, borderBottom: "1px solid var(--border)", marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "var(--accent-soft)", display: "grid", placeItems: "center",
                fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 12, color: "var(--accent)", flexShrink: 0,
              }}>
                {post.author.charAt(0)}
              </div>
              <div>
                <div className="body-s" style={{ fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>{post.author}</div>
                <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{post.authorRole}</div>
              </div>
            </div>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--border-strong)" }} />
            <span className="mono-s" style={{ color: "var(--text-subtle)" }}>{formatDate(post.publishedAt)}</span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--border-strong)" }} />
            <span style={{ display: "flex", alignItems: "center", gap: 4 }} className="mono-s">
              <Clock size={11} style={{ color: "var(--text-subtle)" }} />
              <span style={{ color: "var(--text-subtle)" }}>{post.readTime} min read</span>
            </span>
          </div>

          {/* Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {post.content.map((section, i) => (
              <ContentSection key={i} section={section} />
            ))}
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 40, paddingTop: 28, borderTop: "1px solid var(--border)" }}>
            {post.tags.map(tag => (
              <span key={tag} className="tag tag-outline" style={{ fontSize: 11 }}>{tag}</span>
            ))}
          </div>
        </article>

        {/* Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 80 }}>
          {/* CTA */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, background: "var(--surface)" }}>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>HIRE IN CYPRUS</div>
            <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
              Post your role on CyprusTech.Jobs and reach thousands of tech professionals. Listings go live in minutes, with verified salary ranges.
            </p>
            <Link href="/post-a-job" className="btn btn-accent" style={{ width: "100%", justifyContent: "center" }}>
              Post a job →
            </Link>
          </div>

          {/* Job seeker CTA */}
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, background: "var(--surface)" }}>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 12 }}>LOOKING FOR A ROLE?</div>
            <p className="body-s" style={{ color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>
              Browse all active tech roles in Cyprus with verified salaries.
            </p>
            <Link href="/jobs" className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>
              Browse open roles
            </Link>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 24, background: "var(--surface)" }}>
              <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 16 }}>MORE FROM THE BLOG</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {related.map(rel => {
                  const rc = CATEGORY_COLORS[rel.category] ?? { bg: "var(--bg-muted)", color: "var(--text-muted)" };
                  return (
                    <Link key={rel.slug} href={`/blog/${rel.slug}`} style={{ textDecoration: "none" }}>
                      <span className="mono-s" style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 10, background: rc.bg, color: rc.color, fontWeight: 700, marginBottom: 6 }}>
                        {rel.category.toUpperCase()}
                      </span>
                      <p className="body-s" style={{ fontWeight: 600, color: "var(--text)", lineHeight: 1.4 }}>{rel.title}</p>
                      <p className="mono-s" style={{ color: "var(--text-subtle)", marginTop: 4 }}>{rel.readTime} min read</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Bottom CTA strip */}
      <div style={{
        marginTop: 64, padding: "clamp(28px, 4vw, 44px)",
        border: "1px solid var(--border)", borderRadius: 12,
        background: "var(--surface-alt)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20,
      }}>
        <div>
          <h2 className="h2" style={{ marginBottom: 6 }}>Ready to hire in Cyprus?</h2>
          <p className="body" style={{ color: "var(--text-muted)" }}>Post your role with a verified salary range and get in front of Cyprus's best tech talent.</p>
        </div>
        <Link href="/post-a-job" className="btn btn-accent btn-lg" style={{ flexShrink: 0 }}>
          Post a job →
        </Link>
      </div>
    </div>
  );
}

// ── Content renderer ──────────────────────────────────────────────────────────

const CALLOUT_CONFIG = {
  info:    { bg: "var(--info-bg,#eff6ff)",    border: "#bfdbfe", color: "#1e40af", icon: <Info size={15} /> },
  tip:     { bg: "var(--success-bg)",          border: "#86efac", color: "#15803d", icon: <Lightbulb size={15} /> },
  warning: { bg: "var(--warning-bg)",          border: "#fcd34d", color: "#b45309", icon: <AlertTriangle size={15} /> },
};

function ContentSection({ section }: { section: BlogSection }) {
  switch (section.type) {
    case "h2":
      return (
        <h2 className="h1" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          {section.text}
        </h2>
      );

    case "h3":
      return (
        <h3 className="h2" style={{ marginTop: 8, color: "var(--text)" }}>
          {section.text}
        </h3>
      );

    case "paragraph":
      return (
        <p className="body-l" style={{ color: "var(--text-muted)", lineHeight: 1.75, margin: 0 }}>
          {section.text}
        </p>
      );

    case "list":
      return (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {(section.items ?? []).map((item, i) => (
            <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--accent)", flexShrink: 0, marginTop: 9,
              }} />
              <span className="body-l" style={{ color: "var(--text-muted)", lineHeight: 1.65 }}>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "callout": {
      const cfg = CALLOUT_CONFIG[section.variant ?? "info"];
      return (
        <div style={{
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          borderRadius: 10, padding: "16px 18px",
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <span style={{ color: cfg.color, flexShrink: 0, marginTop: 2 }}>{cfg.icon}</span>
          <p className="body-s" style={{ color: cfg.color, lineHeight: 1.7, margin: 0 }}>{section.text}</p>
        </div>
      );
    }

    case "quote":
      return (
        <blockquote style={{
          borderLeft: "3px solid var(--accent)", paddingLeft: 20, margin: 0,
        }}>
          <p className="body-l" style={{ color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>
            {section.text}
          </p>
        </blockquote>
      );

    default:
      return null;
  }
}

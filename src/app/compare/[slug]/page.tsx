import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { comparisons, getComparison } from "@/data/comparisons";
import { CheckCircle2, XCircle, MinusCircle, ArrowRight, ExternalLink } from "lucide-react";

export const dynamic = "force-static";

export function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) return {};
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: `/compare/${slug}` },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      type: "article",
    },
  };
}

function FeatureIcon({ value }: { value: string | boolean }) {
  if (value === true)
    return <CheckCircle2 size={16} style={{ color: "#16a34a", flexShrink: 0 }} />;
  if (value === false)
    return <XCircle size={16} style={{ color: "#dc2626", flexShrink: 0 }} />;
  return <MinusCircle size={16} style={{ color: "#ca8a04", flexShrink: 0 }} />;
}

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) return <span style={{ color: "#16a34a", fontWeight: 600 }}>Yes</span>;
  if (value === false) return <span style={{ color: "#dc2626" }}>No</span>;
  return <span style={{ color: "#ca8a04", fontWeight: 500 }}>{value}</span>;
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getComparison(slug);
  if (!c) notFound();

  const others = comparisons.filter((x) => x.slug !== slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const lastReviewedFormatted = new Date(c.lastReviewed).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main style={{ maxWidth: 780, margin: "0 auto", padding: "60px 24px 80px" }}>
        {/* Breadcrumb */}
        <nav style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 32 }}>
          <Link href="/compare" className="body-s" style={{ color: "var(--text-secondary)" }}>
            Compare
          </Link>
          <span className="body-s" style={{ color: "var(--text-secondary)" }}>
            /
          </span>
          <span className="body-s" style={{ color: "var(--text-primary)" }}>
            vs {c.competitor.name}
          </span>
        </nav>

        {/* Hero */}
        <div style={{ marginBottom: 48 }}>
          <p className="body-s" style={{ color: "var(--accent)", fontWeight: 600, marginBottom: 8 }}>
            Platform comparison
          </p>
          <h1 className="heading-xl" style={{ marginBottom: 16 }}>
            CyprusTech.Careers vs {c.competitor.name}
          </h1>
          <p className="body-m" style={{ color: "var(--text-secondary)" }}>
            {c.competitor.tagline}
          </p>
        </div>

        {/* Quick Verdict */}
        <section
          style={{
            padding: "24px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderLeft: "4px solid var(--accent)",
            borderRadius: 12,
            marginBottom: 48,
          }}
        >
          <p
            className="body-s"
            style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            Quick verdict
          </p>
          <p className="body-m" style={{ color: "var(--text-primary)", lineHeight: 1.7 }}>
            {c.verdict}
          </p>
        </section>

        {/* Feature table */}
        <section style={{ marginBottom: 56 }}>
          <h2 className="heading-m" style={{ marginBottom: 20 }}>
            Feature comparison
          </h2>
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 140px 140px",
                gap: 0,
                background: "var(--surface-raised, var(--surface))",
                borderBottom: "1px solid var(--border)",
                padding: "12px 20px",
              }}
            >
              <span className="body-s" style={{ fontWeight: 700, color: "var(--text-secondary)" }}>
                Feature
              </span>
              <span
                className="body-s"
                style={{ fontWeight: 700, color: "var(--accent)", textAlign: "center" }}
              >
                CyprusTech.Careers
              </span>
              <span
                className="body-s"
                style={{ fontWeight: 700, color: "var(--text-primary)", textAlign: "center" }}
              >
                {c.competitor.name}
              </span>
            </div>
            {/* Rows */}
            {c.features.map((row, i) => (
              <div
                key={row.feature}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px 140px",
                  padding: "12px 20px",
                  borderBottom: i < c.features.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems: "center",
                }}
              >
                <span className="body-s" style={{ color: "var(--text-primary)" }}>
                  {row.feature}
                </span>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
                  <FeatureIcon value={row.cyprusTech} />
                  <span className="body-s">
                    <FeatureValue value={row.cyprusTech} />
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
                  <FeatureIcon value={row.competitor} />
                  <span className="body-s">
                    <FeatureValue value={row.competitor} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About sections */}
        <section style={{ marginBottom: 56 }}>
          <h2 className="heading-m" style={{ marginBottom: 24 }}>
            About the platforms
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div
              style={{
                padding: 24,
                border: "1px solid var(--accent)",
                borderRadius: 12,
                background: "var(--surface)",
              }}
            >
              <p
                className="body-s"
                style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 10 }}
              >
                CyprusTech.Careers
              </p>
              <p className="body-s" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                {c.aboutCyprusTech}
              </p>
            </div>
            <div
              style={{
                padding: 24,
                border: "1px solid var(--border)",
                borderRadius: 12,
                background: "var(--surface)",
              }}
            >
              <p
                className="body-s"
                style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}
              >
                {c.competitor.name}
              </p>
              <p className="body-s" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                {c.aboutCompetitor}
              </p>
              <a
                href={c.competitor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="body-s"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  color: "var(--accent)",
                  textDecoration: "none",
                  marginTop: 10,
                }}
              >
                Visit {c.competitor.name}
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </section>

        {/* Who should use */}
        <section style={{ marginBottom: 56 }}>
          <h2 className="heading-m" style={{ marginBottom: 24 }}>
            Who should use each platform?
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <p
                className="body-s"
                style={{ fontWeight: 700, color: "var(--accent)", marginBottom: 12 }}
              >
                Use CyprusTech.Careers if you…
              </p>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {c.whoShouldUseCyprusTech.map((point) => (
                  <li key={point} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <CheckCircle2
                      size={14}
                      style={{ color: "var(--accent)", flexShrink: 0, marginTop: 3 }}
                    />
                    <span className="body-s" style={{ color: "var(--text-secondary)" }}>
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p
                className="body-s"
                style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}
              >
                Use {c.competitor.name} if you…
              </p>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {c.whoShouldUseCompetitor.map((point) => (
                  <li key={point} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <ArrowRight
                      size={14}
                      style={{ color: "var(--text-secondary)", flexShrink: 0, marginTop: 3 }}
                    />
                    <span className="body-s" style={{ color: "var(--text-secondary)" }}>
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 56 }}>
          <h2 className="heading-m" style={{ marginBottom: 24 }}>
            Frequently asked questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {c.faq.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "20px 0",
                  borderBottom: i < c.faq.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                <p
                  className="body-m"
                  style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}
                >
                  {item.question}
                </p>
                <p className="body-s" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            padding: "32px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            textAlign: "center",
            marginBottom: 56,
          }}
        >
          <h2 className="heading-s" style={{ marginBottom: 8 }}>
            Ready to try CyprusTech.Careers?
          </h2>
          <p className="body-s" style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
            Browse every tech role in Cyprus with salary shown upfront.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/jobs" className="btn btn-primary">
              Browse tech jobs
            </Link>
            <Link href="/candidates/onboarding" className="btn btn-secondary">
              Create a free profile
            </Link>
          </div>
        </section>

        {/* Cross-links */}
        {others.length > 0 && (
          <section>
            <h2 className="heading-s" style={{ marginBottom: 16 }}>
              More comparisons
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/compare/${o.slug}`}
                  className="body-s"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "var(--accent)",
                    textDecoration: "none",
                  }}
                >
                  <ArrowRight size={14} />
                  CyprusTech.Careers vs {o.competitor.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Last reviewed */}
        <p
          className="body-s"
          style={{ color: "var(--text-tertiary, var(--text-secondary))", marginTop: 48, opacity: 0.6 }}
        >
          Last reviewed: {lastReviewedFormatted}
        </p>
      </main>
    </>
  );
}

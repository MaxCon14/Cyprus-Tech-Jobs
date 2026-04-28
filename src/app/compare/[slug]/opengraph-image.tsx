import { ImageResponse } from "next/og";
import { getComparison } from "@/data/comparisons";

export const alt = "CyprusTech.Jobs vs competitor comparison";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getComparison(slug);
  const competitorName = c?.competitor.name ?? slug;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f0f",
          padding: "60px 80px",
        }}
      >
        <p
          style={{
            color: "#6366f1",
            fontSize: 22,
            fontWeight: 600,
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Platform comparison
        </p>

        <h1
          style={{
            color: "#ffffff",
            fontSize: 58,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.15,
            margin: "0 0 24px",
          }}
        >
          CyprusTech.Jobs
          <br />
          <span style={{ color: "#a1a1aa", fontSize: 46 }}>vs {competitorName}</span>
        </h1>

        <p
          style={{
            color: "#71717a",
            fontSize: 24,
            textAlign: "center",
            margin: "0 0 40px",
          }}
        >
          Tech jobs in Cyprus — side by side
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          {["Salary transparency", "Tech-only", "AI CV review"].map((label) => (
            <div
              key={label}
              style={{
                padding: "8px 20px",
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: 100,
                color: "#a1a1aa",
                fontSize: 18,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}

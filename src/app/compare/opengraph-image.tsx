import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CyprusTech.Jobs — Compare Tech Job Boards in Cyprus";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
          <span style={{ color: "#ffffff", fontSize: 28, fontWeight: 700 }}>
            CyprusTech.Jobs
          </span>
        </div>

        <h1
          style={{
            color: "#ffffff",
            fontSize: 54,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.15,
            margin: "0 0 20px",
          }}
        >
          Best tech job board in Cyprus
        </h1>

        <p
          style={{
            color: "#a1a1aa",
            fontSize: 26,
            textAlign: "center",
            margin: 0,
            maxWidth: 800,
          }}
        >
          See how we compare to Ergodotisi, Carierista, CyprusWork &amp; more
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 40,
          }}
        >
          {["Tech-only listings", "Salary transparency", "AI CV review"].map((label) => (
            <div
              key={label}
              style={{
                padding: "8px 18px",
                background: "#1a1a2e",
                border: "1px solid #6366f1",
                borderRadius: 100,
                color: "#a5b4fc",
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

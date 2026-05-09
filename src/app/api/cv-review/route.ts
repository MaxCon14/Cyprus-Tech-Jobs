import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getJobBySlug } from "@/lib/queries";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

async function buildPrompt(jobSlug: string) {
  const job = await getJobBySlug(jobSlug);
  if (!job) return null;

  const skills = job.tags.map((t) => t.tag.name).join(", ") || "not specified";

  const prompt = `You are a warm, expert career coach reviewing a candidate's CV against a specific job posting.

JOB DETAILS:
- Title: ${job.title}
- Company: ${job.company.name}
- Experience level: ${job.experienceLevel}
- Required skills/tech: ${skills}
- Job description:
${job.description}

THE CANDIDATE'S CV IS ATTACHED AS A PDF DOCUMENT.

Carefully read the CV and assess how well this candidate matches the job above.

Respond ONLY with a valid JSON object in this exact shape — no markdown, no code fences, just raw JSON:
{
  "score": <integer 0-100>,
  "headline": "<one upbeat sentence summarising the match, e.g. 'Strong match — a couple of quick additions will seal the deal'>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "improvements": ["<specific, actionable improvement 1>", "<specific, actionable improvement 2>", "<specific, actionable improvement 3>"],
  "encouragement": "<one warm closing sentence that genuinely encourages the candidate to apply>"
}

Guidelines:
- Score honestly but generously where the evidence supports it
- Strengths: celebrate real matches specifically — mention actual details from both the CV and the job ad
- Improvements: frame every gap as a quick win ("Adding X to your CV would show..." not "You lack X")
- Encouragement: always end on a genuine, human note`;

  return { job, prompt };
}

async function runAnalysis(base64: string, prompt: string) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf" as const, data: base64 } },
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text.trim() : "";

  try {
    return JSON.parse(raw);
  } catch {
    const stripped = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    return JSON.parse(stripped);
  }
}

// ── File upload handler ────────────────────────────────────────────────────────

async function handleFileUpload(req: NextRequest) {
  const formData = await req.formData();
  const jobSlug  = formData.get("jobSlug");
  const file     = formData.get("file");

  if (typeof jobSlug !== "string" || !jobSlug) {
    return NextResponse.json({ error: "Job slug is required." }, { status: 422 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "PDF file is required." }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large. Maximum size is 5 MB." }, { status: 422 });
  }

  const built = await buildPrompt(jobSlug);
  if (!built) return NextResponse.json({ error: "Job not found." }, { status: 404 });

  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  return built.prompt ? runAnalysis(base64, built.prompt) : null;
}

// ── CV URL handler ─────────────────────────────────────────────────────────────

async function handleCvUrl(jobSlug: string, cvUrl: string) {
  const built = await buildPrompt(jobSlug);
  if (!built) return NextResponse.json({ error: "Job not found." }, { status: 404 });

  const url = cvUrl.startsWith("http") ? cvUrl : `https://${cvUrl}`;
  const res  = await fetch(url);
  if (!res.ok) {
    return NextResponse.json({ error: "Could not fetch your saved CV. Please upload it manually." }, { status: 422 });
  }

  const buffer = await res.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Saved CV is too large (max 5 MB)." }, { status: 422 });
  }

  const base64 = Buffer.from(buffer).toString("base64");
  return runAnalysis(base64, built.prompt);
}

// ── Route ──────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    let result: unknown;

    if (contentType.includes("application/json")) {
      const body    = await req.json();
      const jobSlug = typeof body.jobSlug === "string" ? body.jobSlug : "";
      const cvUrl   = typeof body.cvUrl   === "string" ? body.cvUrl   : "";

      if (!jobSlug || !cvUrl) {
        return NextResponse.json({ error: "jobSlug and cvUrl are required." }, { status: 422 });
      }

      result = await handleCvUrl(jobSlug, cvUrl);
    } else {
      result = await handleFileUpload(req);
    }

    if (result instanceof NextResponse) return result;
    return NextResponse.json(result);

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Analysis failed.";
    console.error("[cv-review]", err);

    if (msg.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json({ error: "AI service is not configured. Please contact support." }, { status: 503 });
    }
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}

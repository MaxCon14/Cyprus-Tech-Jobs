import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const MAX_BYTES        = 5 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 20_000;
const MAX_POSITIONS    = 15;

interface ParsedPosition {
  title:       string;
  company:     string;
  startDate:   string; // YYYY-MM
  endDate:     string; // YYYY-MM or ""
  current:     boolean;
  description: string;
}

// ── JSON extraction ────────────────────────────────────────────────────────────

function extractJson(raw: string): unknown {
  try { return JSON.parse(raw); } catch { /* continue */ }

  const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  try { return JSON.parse(stripped); } catch { /* continue */ }

  // Prefer object with a positions key
  const objMatch = raw.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch { /* continue */ }
  }
  const arrMatch = raw.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try { return JSON.parse(arrMatch[0]); } catch { /* continue */ }
  }
  throw new Error("Could not extract valid JSON from the AI response.");
}

// ── Normalisation ─────────────────────────────────────────────────────────────

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function normalizeDate(v: unknown): string {
  const s = str(v);
  return MONTH_RE.test(s) ? s : "";
}

function normalizePositions(raw: unknown): ParsedPosition[] {
  const list = Array.isArray(raw)
    ? raw
    : (typeof raw === "object" && raw !== null && Array.isArray((raw as { positions?: unknown }).positions))
      ? (raw as { positions: unknown[] }).positions
      : [];

  return list
    .map((p): ParsedPosition | null => {
      if (typeof p !== "object" || p === null) return null;
      const obj = p as Record<string, unknown>;

      const title   = str(obj.title);
      const company = str(obj.company);
      if (!title || !company) return null;

      const current   = obj.current === true;
      const startDate = normalizeDate(obj.startDate);
      const endDate   = current ? "" : normalizeDate(obj.endDate);

      const description = str(obj.description).slice(0, 400);

      return { title, company, startDate, endDate, current, description };
    })
    .filter((p): p is ParsedPosition => p !== null)
    .slice(0, MAX_POSITIONS);
}

// ── Prompt ────────────────────────────────────────────────────────────────────

const PROMPT = `Extract the candidate's work experience from the attached CV.

Respond ONLY with raw JSON — no markdown, no code fences, no commentary — in this exact shape:
{
  "positions": [
    {
      "title": "<job title as written on the CV>",
      "company": "<company name as written on the CV>",
      "startDate": "<YYYY-MM format, e.g. 2022-03. Empty string if unclear.>",
      "endDate": "<YYYY-MM format. Empty string if this is the current role or the date is unclear.>",
      "current": <true if this is the candidate's current role (e.g. \"Present\", \"Current\", no end date), else false>,
      "description": "<brief 1-2 sentence summary of responsibilities and achievements, taken from the CV. Empty string if not stated.>"
    }
  ]
}

Rules:
- Include every distinct role, ordered from most recent to oldest.
- Do NOT include education, certifications, awards, or volunteer work — only paid or professional work experience.
- Description is optional; leave "" if the CV lists no responsibilities for that role.
- Dates: convert any format the CV uses (e.g. "March 2022", "03/2022", "Q1 2022") to YYYY-MM. If only a year is given, use YYYY-01. If truly unknown, leave "".
- If the CV has no work experience section, return { "positions": [] }.
- Output ONLY the raw JSON object. No text before or after.`;

// ── Anthropic call ────────────────────────────────────────────────────────────

async function extractPositions(base64: string): Promise<ParsedPosition[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf" as const, data: base64 } },
          { type: "text", text: PROMPT },
        ],
      },
    ],
  });

  const raw    = message.content[0].type === "text" ? message.content[0].text.trim() : "";
  const parsed = extractJson(raw);
  return normalizePositions(parsed);
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body  = await req.json();
    const cvUrl = typeof body.cvUrl === "string" ? body.cvUrl.trim() : "";

    if (!cvUrl) {
      return NextResponse.json({ error: "cvUrl is required." }, { status: 422 });
    }

    const url = cvUrl.startsWith("http") ? cvUrl : `https://${cvUrl}`;

    let cvRes: Response;
    try {
      cvRes = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    } catch {
      return NextResponse.json(
        { error: "Could not download your CV. Please try re-uploading it." },
        { status: 422 }
      );
    }

    if (!cvRes.ok) {
      return NextResponse.json(
        { error: "Could not download your CV. Please try re-uploading it." },
        { status: 422 }
      );
    }

    const buffer = await cvRes.arrayBuffer();
    if (buffer.byteLength === 0) {
      return NextResponse.json({ error: "Your CV appears to be empty." }, { status: 422 });
    }
    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "Your CV is too large (max 5 MB)." }, { status: 422 });
    }

    const base64    = Buffer.from(buffer).toString("base64");
    const positions = await extractPositions(base64);

    return NextResponse.json({ positions });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to parse CV.";
    console.error("[parse-cv]", err);

    if (msg.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "AI service is not configured. Please contact support." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Couldn't read your CV. Please add positions manually." }, { status: 500 });
  }
}

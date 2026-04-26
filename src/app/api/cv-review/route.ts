import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getJobBySlug } from "@/lib/queries";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const jobSlug = formData.get("jobSlug");
  const file    = formData.get("file");

  if (typeof jobSlug !== "string" || !jobSlug) {
    return NextResponse.json({ error: "Job slug is required." }, { status: 422 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "PDF file is required." }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large. Maximum size is 5 MB." }, { status: 422 });
  }

  const job = await getJobBySlug(jobSlug);
  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  // Base64-encode the PDF for Claude's document block
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

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
  "encouragement": "<one warm closing sentence that genuinely encourages the candidate to apply — even if the score is low, find something real to celebrate>"
}

Guidelines:
- Score honestly but generously where the evidence supports it
- Strengths: celebrate real matches specifically — mention actual details from both the CV and the job ad
- Improvements: frame every gap as a quick win ("Adding X to your CV would show..." not "You lack X")
- Encouragement: always end on a genuine, human note — even a 40% match has real potential worth highlighting
- Keep each item concise (one sentence each)`;

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
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

    let result: unknown;
    try {
      result = JSON.parse(raw);
    } catch {
      // Claude occasionally wraps in fences despite instructions — strip them
      const stripped = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      result = JSON.parse(stripped);
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[cv-review]", err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}

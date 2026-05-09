import { NextRequest, NextResponse } from "next/server";
import { getResend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name    = typeof body.name    === "string" ? body.name.trim()    : "";
  const email   = typeof body.email   === "string" ? body.email.trim()   : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email and message are required." }, { status: 422 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 422 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "Message is too long." }, { status: 422 });
  }

  const emailSubject = subject
    ? `[Contact] ${subject}`
    : `[Contact] Message from ${name}`;

  try {
    await getResend().emails.send({
      from:     "CyprusTech.Jobs <noreply@cyprustech.careers>",
      to:       "help@cyprustech.careers",
      replyTo: email,
      subject:  emailSubject,
      html: `
        <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
        ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        <hr>
        <p style="color:#6b7280;font-size:12px;">Sent via the CyprusTech.Jobs contact form.</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact POST]", err);
    return NextResponse.json({ error: "Failed to send. Please try again." }, { status: 500 });
  }
}

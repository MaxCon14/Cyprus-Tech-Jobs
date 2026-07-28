import { NextRequest, NextResponse } from "next/server";
import { getResend, FROM_EMAIL, FROM_NAME } from "@/lib/resend";
import { verifySvixSignature } from "@/lib/svix-verify";
import { allowRequest } from "@/lib/rate-limit";

/**
 * Forwards mail received at the domain's inbox on to a real mailbox.
 *
 * `hello@cyprustech.careers` is a Resend inbound address: the MX record points
 * at Resend, so mail lands there and stops. Admin sign-in codes go to that
 * address, which meant reading them in the Resend dashboard. This re-sends each
 * one to INBOUND_FORWARD_TO so they arrive like ordinary mail.
 *
 * The endpoint sends email on request, so it is only ever driven by a
 * signature-verified Resend webhook — without that check it is an open relay
 * that anyone could point at any address.
 */

/** A mail flood should not become a Resend bill. Counted globally, not per
 *  sender: the point is to cap total forwards, whoever they came from. */
const FORWARD_RULE = { name: "inbound-forward", limit: 60, windowSeconds: 3600 };

function asText(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/** Resend gives `to` as either a string or a list depending on the message. */
function asList(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return typeof v === "string" ? [v] : [];
}

export async function POST(req: NextRequest) {
  // Read the raw body: the signature covers these exact bytes.
  const raw = await req.text();

  const verdict = verifySvixSignature({
    secret:    process.env.RESEND_WEBHOOK_SECRET ?? "",
    body:      raw,
    id:        req.headers.get("svix-id"),
    timestamp: req.headers.get("svix-timestamp"),
    signature: req.headers.get("svix-signature"),
  });

  if (!verdict.ok) {
    console.error("[resend/inbound] rejected:", verdict.reason);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: { type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  // Anything else Resend sends here is acknowledged and ignored, so it is not
  // retried forever.
  if (event.type !== "email.received") return NextResponse.json({ ok: true });

  const forwardTo = (process.env.INBOUND_FORWARD_TO ?? "").trim();
  if (!forwardTo) {
    console.error("[resend/inbound] INBOUND_FORWARD_TO is not set — nothing to forward to.");
    return NextResponse.json({ ok: true });
  }

  /* Forwarding back into the domain we receive for would post the message
     straight back to this webhook, forever. */
  if (forwardTo.toLowerCase().endsWith("@cyprustech.careers")) {
    console.error("[resend/inbound] INBOUND_FORWARD_TO is on the receiving domain — refusing to loop.");
    return NextResponse.json({ ok: true });
  }

  if (!await allowRequest("global", FORWARD_RULE)) {
    console.warn("[resend/inbound] forward rate limit reached — dropping message.");
    return NextResponse.json({ ok: true });
  }

  const data     = event.data ?? {};
  const from     = asText(data.from) || "unknown sender";
  const to       = asList(data.to).join(", ") || "unknown recipient";
  const subject  = asText(data.subject) || "(no subject)";
  const html     = asText(data.html);
  const text     = asText(data.text);

  /* A banner rather than a rewritten From: the message is re-sent from our own
     verified domain (anything else fails DMARC), so without it every forward
     would look like it came from us. */
  const banner =
    `<div style="font-family:sans-serif;font-size:13px;color:#525049;background:#F5F4F2;` +
    `border-left:3px solid #FF3D7F;padding:10px 14px;margin-bottom:16px;">` +
    `<strong>Forwarded from ${escapeHtml(to)}</strong><br>` +
    `From: ${escapeHtml(from)}` +
    `</div>`;

  try {
    await getResend().emails.send({
      from:    `${FROM_NAME} <${FROM_EMAIL}>`,
      to:      forwardTo,
      subject,
      // Replies go to whoever actually wrote, not to our alerts address.
      replyTo: asText(data.from) || undefined,
      ...(html
        ? { html: banner + html }
        : { text: `Forwarded from ${to}\nFrom: ${from}\n\n${text}` }),
    });
  } catch (err) {
    console.error("[resend/inbound] forward failed:", err);
    // 500 so Resend retries a transient send failure.
    return NextResponse.json({ error: "Forward failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

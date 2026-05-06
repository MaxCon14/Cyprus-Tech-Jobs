import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.EMAIL_FROM ?? "alerts@cyprustech.careers";
const BASE   = process.env.NEXT_PUBLIC_APP_URL ?? "https://cyprustech.careers";

// ─── Label helpers ────────────────────────────────────────────────────────────

const REMOTE_LABELS: Record<string, string> = {
  REMOTE:  "Remote",
  HYBRID:  "Hybrid",
  ON_SITE: "On-site",
};
const LEVEL_LABELS: Record<string, string> = {
  JUNIOR: "Junior",
  MID:    "Mid-level",
  SENIOR: "Senior",
  LEAD:   "Lead",
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AlertPreferences {
  categoryName?:    string | null;
  remoteType?:      string | null;
  city?:            string | null;
  experienceLevel?: string | null;
  alertFrequency:   string;
  currentJobCount:  number;
}

// ─── HTML template ────────────────────────────────────────────────────────────

function buildConfirmationHtml(
  email: string,
  prefs: AlertPreferences,
  token: string,
): string {
  const manageUrl     = `${BASE}/manage-alerts?token=${token}`;
  const unsubUrl      = `${BASE}/manage-alerts?token=${token}&action=unsubscribe`;
  const jobsUrl       = buildJobsUrl(prefs);
  const prefRows      = buildPrefRows(prefs);
  const freqLabel     = prefs.alertFrequency === "DAILY" ? "Daily" : "Weekly";
  const countLine     = prefs.currentJobCount > 0
    ? `<p style="font-size:13px;color:#525049;text-align:center;margin:0 0 20px;">${prefs.currentJobCount} jobs currently match your filters.</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:40px 20px;background:#F5F4F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:0 auto;">

    <!-- Wordmark -->
    <div style="text-align:center;margin-bottom:28px;">
      <a href="${BASE}" style="font-size:13px;font-weight:700;color:#0A0A0A;text-decoration:none;letter-spacing:0.08em;font-family:monospace;">CYPRUSTECH.CAREERS</a>
    </div>

    <!-- Card -->
    <div style="background:#fff;border-radius:16px;border:1px solid #E8E6E1;padding:36px 32px;">

      <!-- Icon -->
      <div style="width:52px;height:52px;background:#FFE8F0;border-radius:50%;margin:0 auto 18px;display:flex;align-items:center;justify-content:center;text-align:center;line-height:52px;font-size:22px;">✓</div>

      <h1 style="font-size:22px;font-weight:700;color:#0A0A0A;text-align:center;margin:0 0 8px;">You're subscribed!</h1>
      <p style="font-size:14px;color:#525049;text-align:center;margin:0 0 28px;">
        ${freqLabel} Cyprus tech job alerts are on their way to<br>
        <strong style="color:#0A0A0A;">${email}</strong>
      </p>

      <!-- Preferences summary -->
      <div style="background:#FAFAF9;border-radius:10px;padding:20px;margin-bottom:24px;border:1px solid #E8E6E1;">
        <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#A3A09A;margin:0 0 14px;">YOUR ALERT SETTINGS</p>
        ${prefRows}
      </div>

      ${countLine}

      <!-- CTA -->
      <a href="${jobsUrl}" style="display:block;text-align:center;background:#FF3D7F;color:#fff;padding:14px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;margin-bottom:16px;">
        Browse matching jobs →
      </a>

      <a href="${manageUrl}" style="display:block;text-align:center;background:transparent;color:#525049;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;border:1px solid #E8E6E1;">
        Manage preferences
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;padding:0 16px;">
      <p style="font-size:12px;color:#A3A09A;margin:0 0 8px;">
        <a href="${manageUrl}" style="color:#A3A09A;text-decoration:underline;">Manage preferences</a>
        &nbsp;·&nbsp;
        <a href="${unsubUrl}" style="color:#A3A09A;text-decoration:underline;">Unsubscribe</a>
      </p>
      <p style="font-size:11px;color:#A3A09A;margin:0;">
        You're receiving this because you subscribed at CyprusTech.Careers.<br>
        No account needed to unsubscribe.
      </p>
    </div>

  </div>
</body>
</html>`;
}

function buildPrefRows(prefs: AlertPreferences): string {
  const rows: Array<[string, string]> = [
    ["Category",    prefs.categoryName ?? "All categories"],
    ["Work type",   prefs.remoteType ? (REMOTE_LABELS[prefs.remoteType] ?? prefs.remoteType) : "Any"],
    ["City",        prefs.city ?? "All cities"],
    ["Level",       prefs.experienceLevel ? (LEVEL_LABELS[prefs.experienceLevel] ?? prefs.experienceLevel) : "Any level"],
    ["Frequency",   prefs.alertFrequency === "DAILY" ? "Daily digest" : "Weekly roundup"],
  ];

  return rows.map(([label, value]) => `
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #E8E6E1;">
      <span style="font-size:13px;color:#737069;">${label}</span>
      <span style="font-size:13px;font-weight:500;color:#0A0A0A;">${value}</span>
    </div>`).join("");
}

function buildJobsUrl(prefs: AlertPreferences): string {
  const p = new URLSearchParams();
  if (prefs.remoteType)      p.set("type",  prefs.remoteType);
  if (prefs.city)            p.set("city",  prefs.city);
  if (prefs.experienceLevel) p.set("level", prefs.experienceLevel);
  return `${BASE}/jobs${p.toString() ? `?${p}` : ""}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function sendAlertConfirmation(
  email: string,
  prefs: AlertPreferences,
  token: string,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) return; // no-op in dev without key

  await resend.emails.send({
    from:    FROM,
    to:      email,
    subject: "You're subscribed to Cyprus tech job alerts ✓",
    html:    buildConfirmationHtml(email, prefs, token),
  });
}

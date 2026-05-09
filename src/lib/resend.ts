import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export const FROM_EMAIL = "alerts@cyprustech.careers";
export const FROM_NAME  = "CyprusTech.Jobs";

const BASE_URL = "https://cyprustech.careers";

interface AlertJob {
  title:          string;
  slug:           string;
  companyName:    string;
  city:           string | null;
  remoteType:     string;
  salaryMin:      number | null;
  salaryMax:      number | null;
  salaryCurrency: string;
}

function fmtSalary(min: number | null, max: number | null, currency: string): string {
  if (!min && !max) return "";
  const fmt = (n: number) =>
    n >= 1000 ? `${currency} ${Math.round(n / 1000)}k` : `${currency} ${n.toLocaleString()}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

function jobCard(j: AlertJob): string {
  const location = j.remoteType === "REMOTE" ? "Remote" : j.remoteType === "HYBRID" ? "Hybrid" : (j.city ?? "Cyprus");
  const salary   = fmtSalary(j.salaryMin, j.salaryMax, j.salaryCurrency ?? "€");
  const meta     = [j.companyName, location, salary].filter(Boolean).join("&nbsp;&nbsp;·&nbsp;&nbsp;");

  return `
    <tr>
      <td style="padding: 8px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; padding:18px 20px; box-shadow:0 1px 2px rgba(0,0,0,0.04);">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="vertical-align:top; padding-right:16px;">
                    <a href="${BASE_URL}/jobs/${j.slug}"
                       style="font-family:sans-serif; font-size:15px; font-weight:700; color:#111827; text-decoration:none; display:block; margin-bottom:5px; line-height:1.3;">
                      ${j.title}
                    </a>
                    <span style="font-family:sans-serif; font-size:13px; color:#6b7280;">${meta}</span>
                  </td>
                  <td style="vertical-align:middle; text-align:right; white-space:nowrap;">
                    <a href="${BASE_URL}/jobs/${j.slug}"
                       style="display:inline-block; background:#FF3D7F; color:#ffffff; font-family:sans-serif; font-size:13px; font-weight:600; text-decoration:none; padding:9px 18px; border-radius:7px; letter-spacing:0.01em;">
                      View role &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

interface BuildAlertEmailOptions {
  jobs:        AlertJob[];
  firstName:   string | null;
  token:       string;
  companyName?: string | null;
}

export function buildAlertEmail({ jobs, firstName, token, companyName }: BuildAlertEmailOptions): string {
  const greeting   = firstName ? `Hi ${firstName},` : "Hi there,";
  const isCompany  = !!companyName;
  const bodyIntro  = isCompany
    ? `Here ${jobs.length === 1 ? "is" : "are"} <strong>${jobs.length} new role${jobs.length !== 1 ? "s" : ""}</strong> just posted by <strong>${companyName}</strong>.`
    : `Here ${jobs.length === 1 ? "is" : "are"} <strong>${jobs.length} new tech role${jobs.length !== 1 ? "s" : ""}</strong> matching your alert — fresh from Cyprus's top employers.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${isCompany ? `New ${companyName} jobs` : "New Cyprus tech jobs for you"}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background:#f3f4f6;">

        <!-- Logo row -->
        <tr>
          <td style="padding-bottom:20px;" align="center">
            <a href="${BASE_URL}" style="text-decoration:none;">
              <span style="font-family:sans-serif;font-size:20px;font-weight:800;color:#111827;letter-spacing:-0.5px;">
                CyprusTech<span style="color:#FF3D7F;">.Jobs</span>
              </span>
            </a>
          </td>
        </tr>

        <!-- Card -->
        <tr>
          <td style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">

            <!-- Card header -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td style="background:#111827;padding:28px 32px 24px;">
                  <p style="font-family:sans-serif;font-size:22px;font-weight:700;color:#ffffff;margin:0 0 6px;line-height:1.25;">
                    ${isCompany ? `New roles at ${companyName}` : "New tech jobs for you"}
                  </p>
                  <p style="font-family:sans-serif;font-size:14px;color:#9ca3af;margin:0;">
                    ${greeting} ${bodyIntro}
                  </p>
                </td>
              </tr>
            </table>

            <!-- Job cards -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:20px 28px 8px;">
              ${jobs.map(j => jobCard(j)).join("")}
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:20px 28px 32px;">
              <tr>
                <td align="center">
                  <a href="${BASE_URL}/jobs${isCompany ? `?company=${encodeURIComponent(companyName ?? "")}` : ""}"
                     style="display:inline-block;background:#111827;color:#ffffff;font-family:sans-serif;font-size:14px;font-weight:600;text-decoration:none;padding:13px 32px;border-radius:9px;">
                    Browse all open roles &rarr;
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 16px 8px;" align="center">
            <p style="font-family:sans-serif;font-size:12px;color:#9ca3af;margin:0;line-height:1.6;text-align:center;">
              You're receiving this because you subscribed to job alerts on CyprusTech.Jobs.<br>
              <a href="${BASE_URL}/api/candidates/alert/unsubscribe?token=${token}"
                 style="color:#6b7280;text-decoration:underline;">Unsubscribe from this alert</a>
              &nbsp;&middot;&nbsp;
              <a href="${BASE_URL}/candidates/dashboard"
                 style="color:#6b7280;text-decoration:underline;">Manage all alerts</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

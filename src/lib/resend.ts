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

interface AlertJob {
  title: string;
  slug: string;
  companyName: string;
  city: string | null;
  remoteType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
}

export function buildAlertEmail(jobs: AlertJob[], firstName: string | null): string {
  const greeting = firstName ? `Hi ${firstName},` : "Hi there,";

  const jobRows = jobs
    .map(j => {
      const location = j.remoteType === "REMOTE" ? "Remote" : j.city ?? "Cyprus";
      const salary =
        j.salaryMin || j.salaryMax
          ? ` · ${j.salaryCurrency} ${j.salaryMin ? j.salaryMin.toLocaleString() : ""}${j.salaryMax ? `–${j.salaryMax.toLocaleString()}` : "+"}`
          : "";
      return `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid #e5e7eb;">
            <a href="https://cyprustech.careers/jobs/${j.slug}"
               style="font-family: sans-serif; font-size: 15px; font-weight: 600; color: #111827; text-decoration: none; display: block; margin-bottom: 4px;">
              ${j.title}
            </a>
            <span style="font-family: sans-serif; font-size: 13px; color: #6b7280;">
              ${j.companyName} · ${location}${salary}
            </span>
          </td>
          <td style="padding: 16px 0 16px 16px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; white-space: nowrap;">
            <a href="https://cyprustech.careers/jobs/${j.slug}"
               style="font-family: sans-serif; font-size: 13px; font-weight: 500; color: #FF3D7F; text-decoration: none;">
              View →
            </a>
          </td>
        </tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>New Cyprus tech jobs for you</title></head>
<body style="margin: 0; padding: 0; background: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; padding: 40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background: #111827; padding: 28px 32px;">
            <span style="font-family: sans-serif; font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">
              CyprusTech<span style="color: #FF3D7F;">.Jobs</span>
            </span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding: 32px;">
            <p style="font-family: sans-serif; font-size: 15px; color: #374151; margin: 0 0 8px 0;">${greeting}</p>
            <p style="font-family: sans-serif; font-size: 15px; color: #374151; margin: 0 0 28px 0;">
              Here are <strong>${jobs.length} new tech role${jobs.length !== 1 ? "s" : ""}</strong> that match your alert — fresh from Cyprus's top employers.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0">
              ${jobRows}
            </table>

            <div style="margin-top: 28px; text-align: center;">
              <a href="https://cyprustech.careers/jobs"
                 style="display: inline-block; background: #FF3D7F; color: #ffffff; font-family: sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px;">
                View all open roles →
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background: #f9fafb; padding: 20px 32px; border-top: 1px solid #e5e7eb;">
            <p style="font-family: sans-serif; font-size: 12px; color: #9ca3af; margin: 0; text-align: center;">
              You're receiving this because you subscribed to job alerts on CyprusTech.Jobs.<br>
              No longer interested? <a href="https://cyprustech.careers/api/candidates/alert/unsubscribe?token={{TOKEN}}" style="color: #9ca3af;">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

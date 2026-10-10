import type { Metadata } from "next";
export const metadata: Metadata = { title: "Confirm job alerts", robots: { index: false, follow: false } };
export default async function ConfirmAlerts({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <main className="page-container" style={{ paddingBlock: 64, maxWidth: 640 }}>
    <h1 className="h1">Confirm your job alerts</h1>
    <p className="body" style={{ marginBlock: 24 }}>Confirm that you want to receive the job alerts you requested. You can unsubscribe using the link in any alert email.</p>
    <form action="/api/candidates/alert/confirm" method="post">
      <input type="hidden" name="token" value={typeof token === "string" ? token : ""} />
      <button className="btn btn-accent" type="submit">Confirm subscription</button>
    </form>
  </main>;
}

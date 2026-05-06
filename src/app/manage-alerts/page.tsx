import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCategoriesWithCount } from "@/lib/queries";
import { ManageAlertsClient } from "./ManageAlertsClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Manage Job Alerts — CyprusTech.Careers",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ token?: string; action?: string }> };

export default async function ManageAlertsPage({ searchParams }: Props) {
  const { token, action } = await searchParams;

  if (!token) {
    return (
      <div className="page-container" style={{ paddingBlock: "clamp(40px, 6vw, 80px)", maxWidth: 560 }}>
        <div style={{ textAlign: "center" }}>
          <h1 className="h2" style={{ marginBottom: 8 }}>Invalid link</h1>
          <p className="body" style={{ color: "var(--text-muted)", marginBottom: 24 }}>
            This link is missing a token. Check the email we sent you and try clicking the link again.
          </p>
          <Link href="/jobs" className="btn btn-accent">Browse jobs</Link>
        </div>
      </div>
    );
  }

  const alert = await prisma.jobAlert.findUnique({ where: { token } });

  if (!alert) {
    return (
      <div className="page-container" style={{ paddingBlock: "clamp(40px, 6vw, 80px)", maxWidth: 560 }}>
        <div style={{ textAlign: "center" }}>
          <h1 className="h2" style={{ marginBottom: 8 }}>Subscription not found</h1>
          <p className="body" style={{ color: "var(--text-muted)", marginBottom: 24 }}>
            This link may have already been used to unsubscribe, or the subscription no longer exists.
          </p>
          <Link href="/jobs" className="btn btn-accent">Browse jobs</Link>
        </div>
      </div>
    );
  }

  let categoryName: string | null = null;
  if (alert.categoryId) {
    const cat = await prisma.category.findUnique({ where: { id: alert.categoryId }, select: { name: true } });
    categoryName = cat?.name ?? null;
  }

  const allCategories = await getCategoriesWithCount();
  const categories = allCategories.slice(1).map(c => ({ id: c.id, label: c.label }));

  return (
    <div className="page-container" style={{ paddingBlock: "clamp(40px, 6vw, 80px)" }}>
      <ManageAlertsClient
        initialAlert={{
          token:           alert.token,
          email:           alert.email,
          categoryId:      alert.categoryId,
          categoryName,
          remoteType:      alert.remoteType,
          city:            alert.city,
          experienceLevel: alert.experienceLevel,
          alertFrequency:  alert.alertFrequency,
        }}
        categories={categories}
        autoUnsubscribe={action === "unsubscribe"}
      />
    </div>
  );
}

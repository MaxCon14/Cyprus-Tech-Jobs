import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CreditSelector } from "./CreditSelector";

export const metadata: Metadata = {
  title: "Buy Listing Slots — CyprusTech.Jobs",
  description: "Purchase standard or featured job listing slots to post roles on CyprusTech.Jobs.",
};

export default async function BuyCreditsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const employer = await prisma.employer.findUnique({ where: { email: user.email } });
  if (!employer) {
    redirect("/employers/onboarding");
  }

  const { standardSlots, featuredSlots } = employer;

  return (
    <div>
      {/* Hero */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "clamp(40px,6vw,64px) var(--page-padding-x) clamp(32px,5vw,52px)", background: "var(--bg-alt)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ width: 20, height: 1, background: "var(--accent)", display: "inline-block" }} />
            BUY LISTING SLOTS
          </div>
          <h1 className="display-l" style={{ marginBottom: 12 }}>
            Pre-purchase listing slots
          </h1>
          <p className="body-l" style={{ color: "var(--text-muted)", maxWidth: 480, margin: "0 auto 28px" }}>
            Buy slots in advance and post jobs instantly — no payment friction at post time.
          </p>

          {/* Current balance */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 24, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 28px", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div className="mono-l" style={{ color: "var(--accent)" }}>{standardSlots}</div>
              <div className="body-s" style={{ color: "var(--text-muted)" }}>Standard slots</div>
            </div>
            <div style={{ width: 1, height: 32, background: "var(--border-strong)" }} />
            <div style={{ textAlign: "center" }}>
              <div className="mono-l" style={{ color: "var(--accent)" }}>{featuredSlots}</div>
              <div className="body-s" style={{ color: "var(--text-muted)" }}>Featured slots</div>
            </div>
            {(standardSlots > 0 || featuredSlots > 0) && (
              <>
                <div style={{ width: 1, height: 32, background: "var(--border-strong)" }} />
                <Link href="/post-a-job" className="btn btn-accent btn-sm">
                  Post a job →
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Selector */}
      <div className="page-container" style={{ paddingBlock: "clamp(40px,6vw,64px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <CreditSelector employerId={employer.id} />

        {/* FAQ */}
        <div style={{ maxWidth: 440, width: "100%" }}>
          <h2 className="h2" style={{ marginBottom: 16 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}><ShoppingBag size={16} /> How slots work</span>
          </h2>
          {[
            ["When do my slots expire?", "Slots don't expire — they sit in your account until you use them."],
            ["Standard vs featured?", "Standard slots post to all category feeds. Featured slots pin to the top of results with a FEATURED badge for maximum visibility."],
            ["How quickly do listings go live?", "Instantly. As soon as you click Post, your listing is live on the site."],
            ["Can I buy more later?", "Yes — your balance stacks up. Buy as many as you need."],
          ].map(([q, a]) => (
            <div key={q} style={{ borderBottom: "1px solid var(--border)", paddingBlock: 14 }}>
              <p className="body-s" style={{ fontWeight: 600, marginBottom: 4 }}>{q}</p>
              <p className="body-s" style={{ color: "var(--text-muted)" }}>{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

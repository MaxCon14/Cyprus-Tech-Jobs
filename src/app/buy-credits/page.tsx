import { redirect } from "next/navigation";
import Link from "next/link";
import { Check, Star, Zap, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { BuyCreditsButton } from "./BuyCreditsButton";

export const metadata: Metadata = {
  title: "Buy Listing Slots — CyprusTech.Jobs",
  description: "Purchase standard or featured job listing slots to post roles on CyprusTech.Jobs.",
};

const STANDARD_PACKS = [
  { key: "standard_1", qty: 1, price: "€99",  total: "€99",  saving: null },
  { key: "standard_3", qty: 3, price: "€90ea", total: "€270", saving: "Save €27" },
  { key: "standard_5", qty: 5, price: "€85ea", total: "€425", saving: "Save €70" },
];

const FEATURED_PACKS = [
  { key: "featured_1", qty: 1, price: "€199", total: "€199", saving: null },
  { key: "featured_3", qty: 3, price: "€180ea",total: "€540", saving: "Save €57" },
];

export default async function BuyCreditsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/employers/login?callbackUrl=/buy-credits");
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

      <div className="page-container" style={{ paddingBlock: "clamp(40px,6vw,64px)" }}>

        {/* Standard Slots */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-muted)", display: "grid", placeItems: "center" }}>
              <Zap size={16} style={{ color: "var(--accent)" }} />
            </span>
            <h2 className="h2">Standard listing slots</h2>
          </div>
          <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 28, maxWidth: 520 }}>
            Each slot lets you post one standard job listing — live for 30 days, shown in all relevant category feeds.
          </p>

          <div className="grid-3" style={{ maxWidth: 860 }}>
            {STANDARD_PACKS.map(pack => (
              <PackCard
                key={pack.key}
                pack={pack}
                employerId={employer.id}
                features={["1 job listing per slot", "Listed for 30 days", "Category feed placement", "Job alert emails to candidates"]}
              />
            ))}
          </div>
        </section>

        {/* Featured Slots */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-soft)", display: "grid", placeItems: "center" }}>
              <Star size={16} style={{ color: "var(--accent)" }} />
            </span>
            <h2 className="h2">Featured listing slots</h2>
          </div>
          <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 28, maxWidth: 520 }}>
            Each slot lets you post one featured job — pinned to the top of search results with a FEATURED badge for maximum visibility.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20, maxWidth: 580 }}>
            {FEATURED_PACKS.map(pack => (
              <PackCard
                key={pack.key}
                pack={pack}
                employerId={employer.id}
                accent
                features={["1 featured job listing per slot", "FEATURED badge on listing", "Pinned to top of category for 7 days", "Highlighted in homepage hero", "2× more applications on average"]}
              />
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ maxWidth: 640 }}>
          <h2 className="h2" style={{ marginBottom: 20 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}><ShoppingBag size={18} /> How slots work</span>
          </h2>
          {[
            ["When do my slots expire?", "Slots don't expire — they sit in your account until you use them."],
            ["Can I use standard slots for featured listings?", "No — standard and featured slots are separate. Buy the type you need."],
            ["How quickly do listings go live?", "Instantly. As soon as you click Post, your listing is live on the site."],
            ["What if I need more than 5 standard slots?", "Just buy multiple packs — your balance stacks up."],
          ].map(([q, a]) => (
            <div key={q} style={{ borderBottom: "1px solid var(--border)", paddingBlock: 16 }}>
              <p className="body-s" style={{ fontWeight: 600, marginBottom: 4 }}>{q}</p>
              <p className="body-s" style={{ color: "var(--text-muted)" }}>{a}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function PackCard({
  pack,
  employerId,
  accent = false,
  features,
}: {
  pack: { key: string; qty: number; price: string; total: string; saving: string | null };
  employerId: string;
  accent?: boolean;
  features: string[];
}) {
  return (
    <div style={{
      border:       `${accent ? "2px" : "1px"} solid ${accent ? "var(--accent)" : "var(--border)"}`,
      borderRadius: 12,
      padding:      24,
      background:   accent ? "var(--accent-soft)" : "var(--surface)",
      position:     "relative",
      display:      "flex",
      flexDirection:"column",
      gap:          16,
    }}>
      {pack.saving && (
        <div style={{ position: "absolute", top: -11, right: 16 }}>
          <span style={{ background: "var(--success)", color: "var(--white)", padding: "3px 10px", borderRadius: 99, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.06em" }}>
            {pack.saving}
          </span>
        </div>
      )}

      <div>
        <div className="mono-s" style={{ color: "var(--text-subtle)", marginBottom: 4 }}>
          {pack.qty} {pack.qty === 1 ? "slot" : "slots"}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 700, color: "var(--text)" }}>
          {pack.total}
        </div>
        <div className="mono-s" style={{ color: "var(--text-subtle)" }}>{pack.price} per slot</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
        {features.map(f => (
          <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <span style={{ width: 15, height: 15, borderRadius: "50%", flexShrink: 0, marginTop: 1, background: accent ? "var(--accent)" : "var(--success-bg)", display: "grid", placeItems: "center" }}>
              <Check size={8} style={{ color: accent ? "var(--white)" : "var(--success)" }} />
            </span>
            <span className="body-s">{f}</span>
          </div>
        ))}
      </div>

      <BuyCreditsButton
        slotPriceKey={pack.key}
        employerId={employerId}
        label={`Buy ${pack.qty} ${pack.qty === 1 ? "slot" : "slots"} — ${pack.total}`}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Check, Zap, Star, Building2, Loader2, ChevronRight,
  Minus, Plus, CreditCard, Sparkles, FlaskConical,
} from "lucide-react";
import { CATEGORIES } from "@/lib/placeholder-data";

const STANDARD_PRICE = 9.99;
const FEATURED_PRICE = 14.99;

interface Props {
  companyName?: string;
  companySlug?: string;
  standardCredits: number;
  featuredCredits: number;
  paymentSuccess: boolean;
}

export function PostJobForm({ companyName, companySlug, standardCredits, featuredCredits, paymentSuccess }: Props) {
  const router = useRouter();

  // Detect local dev (client-side only, safe for SSR)
  const [isLocalDev, setIsLocalDev] = useState(false);
  useEffect(() => {
    setIsLocalDev(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
  }, []);

  // Purchase panel state
  const [buyStd, setBuyStd] = useState(1);
  const [buyFeat, setBuyFeat] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Post form state
  const [listingType, setListingType] = useState<"standard" | "featured">(
    featuredCredits > 0 ? "featured" : "standard"
  );
  const [form, setForm] = useState({
    title:           "",
    categorySlug:    "",
    experienceLevel: "",
    remoteType:      "",
    employmentType:  "",
    city:            "",
    description:     "",
    salaryMin:       "",
    salaryMax:       "",
    tags:            "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  function field(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  // Price calculation
  const totalQty  = buyStd + buyFeat;
  const discount  = totalQty >= 5 ? 0.20 : totalQty >= 3 ? 0.10 : 0;
  const rawTotal  = buyStd * STANDARD_PRICE + buyFeat * FEATURED_PRICE;
  const total     = rawTotal * (1 - discount);
  const savings   = rawTotal - total;

  async function purchase() {
    if (totalQty === 0) return;
    setPurchaseError(null);
    setPurchasing(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ standardQty: buyStd, featuredQty: buyFeat }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPurchaseError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setPurchaseError("Network error. Please try again.");
    } finally {
      setPurchasing(false);
    }
  }

  async function simulatePurchase() {
    if (totalQty === 0) return;
    setPurchaseError(null);
    setSimulating(true);
    try {
      const res = await fetch("/api/stripe/test-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ standardQty: buyStd, featuredQty: buyFeat }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPurchaseError(data.error ?? "Test payment failed.");
        return;
      }
      // Reload to refresh credit balance from server
      window.location.href = "/post-a-job?payment=success";
    } catch {
      setPurchaseError("Network error. Please try again.");
    } finally {
      setSimulating(false);
    }
  }

  const hasCredits = listingType === "featured" ? featuredCredits > 0 : standardCredits > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasCredits || loading) return;
    setError(null);
    setLoading(true);

    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:           form.title.trim(),
          description:     form.description.trim(),
          categorySlug:    form.categorySlug,
          experienceLevel: form.experienceLevel,
          remoteType:      form.remoteType,
          employmentType:  form.employmentType,
          city:            form.city || null,
          salaryMin:       form.salaryMin ? parseInt(form.salaryMin, 10) : null,
          salaryMax:       form.salaryMax ? parseInt(form.salaryMax, 10) : null,
          tags,
          listingType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push(`/jobs/${data.slug}?posted=1`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Payment success banner */}
      {paymentSuccess && (
        <div style={{ background: "var(--success-bg)", border: "1px solid var(--success)", borderRadius: 10, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <Check size={16} style={{ color: "var(--success)", flexShrink: 0 }} />
          <p className="body-s" style={{ color: "var(--success)" }}>
            <strong>Listings purchased!</strong> Your credits are ready — fill in your job details below and hit "Post Job".
          </p>
        </div>
      )}

      {/* Credit balance */}
      {(standardCredits > 0 || featuredCredits > 0) && (
        <div style={{ background: "var(--accent-soft)", border: "1px solid var(--accent)", borderRadius: 10, padding: "12px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <CreditCard size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
          <span className="body-s" style={{ color: "var(--text)" }}>
            <strong>Your credits:</strong>{" "}
            {standardCredits > 0 && <span>{standardCredits} Standard</span>}
            {standardCredits > 0 && featuredCredits > 0 && <span style={{ margin: "0 6px", color: "var(--text-subtle)" }}>·</span>}
            {featuredCredits > 0 && <span>{featuredCredits} Featured</span>}
          </span>
        </div>
      )}

      {/* ── Buy listings panel ── */}
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--surface)", marginBottom: 32 }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, background: "var(--bg-alt)" }}>
          <CreditCard size={14} style={{ color: "var(--accent)" }} />
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14 }}>
            {standardCredits + featuredCredits > 0 ? "Buy more listings" : "Buy listing credits"}
          </span>
          {discount > 0 && (
            <span style={{ marginLeft: "auto", background: "var(--success-bg)", color: "var(--success)", padding: "2px 8px", borderRadius: 99, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.05em" }}>
              {(discount * 100).toFixed(0)}% OFF
            </span>
          )}
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Bulk discount nudge */}
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ background: totalQty >= 3 ? "var(--success-bg)" : "var(--bg-muted)", color: totalQty >= 3 ? "var(--success)" : "var(--text-subtle)", padding: "4px 10px", borderRadius: 99, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.05em", transition: "all 150ms" }}>
              3+ LISTINGS: 10% OFF
            </span>
            <span style={{ background: totalQty >= 5 ? "var(--success-bg)" : "var(--bg-muted)", color: totalQty >= 5 ? "var(--success)" : "var(--text-subtle)", padding: "4px 10px", borderRadius: 99, fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.05em", transition: "all 150ms" }}>
              5+ LISTINGS: 20% OFF
            </span>
          </div>

          {/* Standard row */}
          <ListingTypeRow
            icon={<Zap size={13} />}
            label="Standard"
            sublabel="Highlighted in feeds · job alerts · 30 days"
            price={STANDARD_PRICE}
            qty={buyStd}
            onChange={setBuyStd}
          />

          {/* Featured row */}
          <ListingTypeRow
            icon={<Sparkles size={13} />}
            label="Featured"
            sublabel="FEATURED badge · pinned to top · homepage placement"
            price={FEATURED_PRICE}
            qty={buyFeat}
            onChange={setBuyFeat}
            accent
          />

          {/* Total + buy button */}
          {totalQty > 0 && (
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "var(--text)" }}>
                  €{total.toFixed(2)}
                </div>
                {savings > 0.009 && (
                  <div className="mono-s" style={{ color: "var(--success)" }}>
                    Save €{savings.toFixed(2)} ({(discount * 100).toFixed(0)}% bulk discount)
                  </div>
                )}
              </div>

              {purchaseError && (
                <p className="body-s" style={{ color: "var(--error)", width: "100%" }}>{purchaseError}</p>
              )}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={purchase}
                  disabled={purchasing || simulating}
                  className="btn btn-accent"
                  style={{ gap: 8 }}
                >
                  {purchasing ? (
                    <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Redirecting…</>
                  ) : (
                    <>Buy {totalQty} listing{totalQty !== 1 ? "s" : ""} — €{total.toFixed(2)} <ChevronRight size={14} /></>
                  )}
                </button>

                {isLocalDev && (
                  <button
                    type="button"
                    onClick={simulatePurchase}
                    disabled={purchasing || simulating}
                    className="btn btn-outline"
                    style={{ gap: 6, borderColor: "var(--warning, #d97706)", color: "var(--warning, #d97706)" }}
                    title="Bypasses Stripe — dev only"
                  >
                    {simulating ? (
                      <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Adding…</>
                    ) : (
                      <><FlaskConical size={13} /> Simulate payment</>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Post a job form ── */}
      <form onSubmit={submit}>
        <div id="form">
          <h2 className="h2" style={{ marginBottom: 6 }}>Post a job</h2>
          {companyName ? (
            <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              Posting as <strong>{companyName}</strong>
              {companySlug && (
                <> · <a href={`/companies/${companySlug}`} style={{ color: "var(--accent)" }}>view profile</a></>
              )}
            </p>
          ) : (
            <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 24 }}>
              Purchase listing credits above, then fill in your job details.
            </p>
          )}

          {/* Listing type selector */}
          <div style={{ marginBottom: 24 }}>
            <div className="caption" style={{ color: "var(--text-subtle)", marginBottom: 10 }}>LISTING TYPE</div>
            <div style={{ display: "flex", gap: 10 }}>
              {(["standard", "featured"] as const).map((type) => {
                const credits = type === "featured" ? featuredCredits : standardCredits;
                const selected = listingType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setListingType(type)}
                    disabled={credits === 0}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      borderRadius: 10,
                      border: selected ? "2px solid var(--accent)" : "1px solid var(--border)",
                      background: selected ? "var(--accent-soft)" : "var(--surface)",
                      cursor: credits === 0 ? "not-allowed" : "pointer",
                      opacity: credits === 0 ? 0.45 : 1,
                      textAlign: "left",
                      transition: "all 150ms",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      {type === "featured" ? <Sparkles size={12} style={{ color: selected ? "var(--accent)" : "var(--text-subtle)" }} /> : <Zap size={12} style={{ color: selected ? "var(--accent)" : "var(--text-subtle)" }} />}
                      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, color: selected ? "var(--accent)" : "var(--text)" }}>
                        {type === "standard" ? "Standard" : "Featured"}
                      </span>
                    </div>
                    <div className="mono-s" style={{ color: "var(--text-subtle)" }}>
                      {credits} credit{credits !== 1 ? "s" : ""} available
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

            {/* Role */}
            <FormSection icon={<Zap size={14} />} title="Role information">
              <Field label="Job title" required>
                <input className="input" type="text" placeholder="e.g. Senior Frontend Engineer"
                  value={form.title} onChange={field("title")} required />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Category" required>
                  <select className="select" value={form.categorySlug} onChange={field("categorySlug")} required>
                    <option value="">Select category</option>
                    {CATEGORIES.slice(1).map((c) => (
                      <option key={c.slug} value={c.slug}>{c.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Experience level" required>
                  <select className="select" value={form.experienceLevel} onChange={field("experienceLevel")} required>
                    <option value="">Select level</option>
                    <option value="JUNIOR">Junior</option>
                    <option value="MID">Mid-level</option>
                    <option value="SENIOR">Senior</option>
                    <option value="LEAD">Lead</option>
                    <option value="EXECUTIVE">Executive</option>
                  </select>
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Work type" required>
                  <select className="select" value={form.remoteType} onChange={field("remoteType")} required>
                    <option value="">Select work type</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="ON_SITE">On-site</option>
                  </select>
                </Field>
                <Field label="Employment type" required>
                  <select className="select" value={form.employmentType} onChange={field("employmentType")} required>
                    <option value="">Select type</option>
                    <option value="FULL_TIME">Full-time</option>
                    <option value="PART_TIME">Part-time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="FREELANCE">Freelance</option>
                  </select>
                </Field>
              </div>
              <Field label="City">
                <select className="select" value={form.city} onChange={field("city")}>
                  <option value="">Any / not specified</option>
                  <option>Limassol</option>
                  <option>Nicosia</option>
                  <option>Larnaca</option>
                  <option>Paphos</option>
                </select>
              </Field>
              <Field label="Skills / tech stack">
                <input className="input" type="text"
                  placeholder="e.g. React, TypeScript, Node.js (comma-separated, max 10)"
                  value={form.tags} onChange={field("tags")} />
                <span className="mono-s" style={{ color: "var(--text-subtle)", marginTop: 4, display: "block" }}>COMMA-SEPARATED · MAX 10 TAGS</span>
              </Field>
            </FormSection>

            {/* Description */}
            <FormSection icon={<Building2 size={14} />} title="Job description">
              <Field label="Description" required>
                <textarea className="textarea"
                  placeholder="Describe the role, team, responsibilities, and what you're looking for…"
                  style={{ minHeight: 240 }}
                  value={form.description} onChange={field("description")}
                  required minLength={100} />
                <span className="mono-s" style={{ color: "var(--text-subtle)", marginTop: 4, display: "block" }}>
                  {form.description.length} characters · MIN 100
                </span>
              </Field>
            </FormSection>

            {/* Salary */}
            <FormSection icon={<Star size={14} />} title="Salary">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Min salary (€/year)">
                  <input className="input" type="number" placeholder="e.g. 40000"
                    value={form.salaryMin} onChange={field("salaryMin")} min={0} />
                </Field>
                <Field label="Max salary (€/year)">
                  <input className="input" type="number" placeholder="e.g. 60000"
                    value={form.salaryMax} onChange={field("salaryMax")} min={0} />
                </Field>
              </div>
              <p className="mono-s" style={{ color: "var(--text-subtle)", marginTop: -8 }}>
                LISTINGS WITH SALARY RANGES GET 2× MORE APPLICATIONS
              </p>
            </FormSection>

            {/* Error */}
            {error && (
              <div style={{ background: "var(--error-bg)", border: "1px solid var(--error)", borderRadius: 10, padding: "14px 18px", marginBottom: 8 }}>
                <p className="body-s" style={{ color: "var(--error)" }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <div style={{ marginTop: 8 }}>
              {!hasCredits ? (
                <div style={{ background: "var(--bg-muted)", borderRadius: 10, padding: "16px 20px", textAlign: "center" }}>
                  <p className="body-s" style={{ color: "var(--text-muted)", marginBottom: 8 }}>
                    You need {listingType === "featured" ? "featured" : "standard"} credits to post this listing.
                  </p>
                  <p className="mono-s" style={{ color: "var(--text-subtle)" }}>
                    ↑ PURCHASE CREDITS ABOVE TO CONTINUE
                  </p>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-accent btn-lg"
                  style={{ width: "100%", justifyContent: "center", gap: 8 }}
                >
                  {loading ? (
                    <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Posting your job…</>
                  ) : (
                    <>Post {listingType === "featured" ? "Featured" : ""} Job <ChevronRight size={15} /></>
                  )}
                </button>
              )}
              {hasCredits && (
                <p className="mono-s" style={{ color: "var(--text-subtle)", textAlign: "center", marginTop: 10 }}>
                  USES 1 {listingType.toUpperCase()} CREDIT · {listingType === "featured" ? featuredCredits : standardCredits} REMAINING
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Listing type row in purchase panel ──────────────────────────────────────

function ListingTypeRow({
  icon, label, sublabel, price, qty, onChange, accent,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  price: number;
  qty: number;
  onChange: (n: number) => void;
  accent?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <span style={{ color: accent ? "var(--accent)" : "var(--text-subtle)" }}>{icon}</span>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{label}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>€{price.toFixed(2)}/listing</span>
        </div>
        <p className="mono-s" style={{ color: "var(--text-subtle)" }}>{sublabel}</p>
      </div>

      {/* Quantity stepper */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          onClick={() => onChange(Math.max(0, qty - 1))}
          style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", display: "grid", placeItems: "center" }}
        >
          <Minus size={12} />
        </button>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 700, minWidth: 20, textAlign: "center", color: "var(--text)" }}>
          {qty}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(10, qty + 1))}
          style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", display: "grid", placeItems: "center" }}
        >
          <Plus size={12} />
        </button>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: qty > 0 ? "var(--text)" : "var(--text-subtle)", minWidth: 50, textAlign: "right" }}>
          €{(qty * price).toFixed(2)}
        </span>
      </div>
    </div>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function FormSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, marginBottom: 16, overflow: "hidden", background: "var(--surface)" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, background: "var(--bg-alt)" }}>
        <span style={{ color: "var(--accent)" }}>{icon}</span>
        <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 14 }}>{title}</span>
      </div>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontFamily: "var(--font-sans)", fontWeight: 500, fontSize: 12, marginBottom: 6 }}>
        {label}{required && <span style={{ color: "var(--accent)", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

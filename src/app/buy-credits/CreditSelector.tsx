"use client";

import { useState } from "react";
import { Minus, Plus, Star, Zap, Loader2, Check, ShoppingCart } from "lucide-react";

type SlotType = "standard" | "featured";

const PRICING: Record<SlotType, { base: number; extra: number }> = {
  standard: { base: 9.99,  extra: 5  },
  featured: { base: 14.99, extra: 10 },
};

function calcTotal(qty: number, type: SlotType): number {
  if (qty === 0) return 0;
  const { base, extra } = PRICING[type];
  return base + (qty - 1) * extra;
}

const PERKS: Record<SlotType, string[]> = {
  standard: [
    "Listed in all category feeds",
    "Appears in search results",
    "Instant activation",
    "Slots never expire",
  ],
  featured: [
    "Pinned to top of search results",
    "FEATURED badge for visibility",
    "Highlighted in category feeds",
    "Slots never expire",
  ],
};

function SlotCard({
  type,
  qty,
  onQtyChange,
}: {
  type: SlotType;
  qty: number;
  onQtyChange: (v: number) => void;
}) {
  const isFeatured = type === "featured";
  const { base, extra } = PRICING[type];
  const total    = calcTotal(qty, type);
  const isActive = qty > 0;

  function changeQty(v: number) {
    onQtyChange(Math.max(0, Math.min(50, isNaN(v) ? 0 : v)));
  }

  return (
    <div style={{
      flex:          "1 1 300px",
      border:        `2px solid ${isActive ? (isFeatured ? "var(--accent)" : "var(--border-strong)") : "var(--border)"}`,
      borderRadius:  18,
      padding:       32,
      background:    isActive ? (isFeatured ? "var(--accent-soft)" : "var(--surface)") : "var(--bg-alt)",
      display:       "flex",
      flexDirection: "column",
      gap:           24,
      position:      "relative",
      transition:    "border-color 150ms, background 150ms",
    }}>
      {isFeatured && (
        <div style={{
          position:      "absolute",
          top:           -14,
          left:          "50%",
          transform:     "translateX(-50%)",
          background:    "var(--accent)",
          color:         "var(--white)",
          fontFamily:    "var(--font-mono)",
          fontSize:      11,
          fontWeight:    700,
          letterSpacing: "0.08em",
          padding:       "4px 14px",
          borderRadius:  99,
          whiteSpace:    "nowrap",
        }}>
          MOST VISIBLE
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width:        44,
          height:       44,
          borderRadius: 12,
          background:   isActive ? (isFeatured ? "var(--accent)" : "var(--bg-muted)") : "var(--border)",
          display:      "grid",
          placeItems:   "center",
          flexShrink:   0,
          transition:   "background 150ms",
        }}>
          {isFeatured
            ? <Star size={20} style={{ color: "var(--white)" }} />
            : <Zap  size={20} style={{ color: isActive ? "var(--text-subtle)" : "var(--text-subtle)" }} />
          }
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 17, color: "var(--text)" }}>
            {isFeatured ? "Featured" : "Standard"}
          </div>
          <div className="body-s" style={{ color: "var(--text-muted)" }}>
            {isFeatured ? "Maximum visibility" : "Essential listing"}
          </div>
        </div>
      </div>

      {/* Perks */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {PERKS[type].map(perk => (
          <div key={perk} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Check size={13} style={{ color: isActive ? (isFeatured ? "var(--accent)" : "var(--text-subtle)") : "var(--border-strong)", flexShrink: 0 }} />
            <span className="body-s" style={{ color: "var(--text-muted)" }}>{perk}</span>
          </div>
        ))}
      </div>

      {/* Quantity */}
      <div>
        <div className="body-s" style={{ color: "var(--text-subtle)", marginBottom: 10, fontWeight: 500 }}>
          How many slots? <span style={{ color: "var(--text-subtle)", fontWeight: 400 }}>(0 to skip)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1.5px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--bg)", width: "fit-content" }}>
          <button
            onClick={() => changeQty(qty - 1)}
            disabled={qty <= 0}
            style={{
              width:          44,
              height:         48,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              border:         "none",
              background:     "transparent",
              cursor:         qty <= 0 ? "not-allowed" : "pointer",
              color:          qty <= 0 ? "var(--text-subtle)" : "var(--text)",
            }}
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            min={0}
            max={50}
            value={qty}
            onChange={e => changeQty(parseInt(e.target.value))}
            style={{
              width:       56,
              textAlign:   "center",
              border:      "none",
              borderLeft:  "1.5px solid var(--border)",
              borderRight: "1.5px solid var(--border)",
              background:  "transparent",
              fontFamily:  "var(--font-mono)",
              fontSize:    20,
              fontWeight:  700,
              color:       "var(--text)",
              outline:     "none",
              height:      48,
              padding:     "0 4px",
            }}
          />
          <button
            onClick={() => changeQty(qty + 1)}
            disabled={qty >= 50}
            style={{
              width:          44,
              height:         48,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              border:         "none",
              background:     "transparent",
              cursor:         qty >= 50 ? "not-allowed" : "pointer",
              color:          qty >= 50 ? "var(--text-subtle)" : "var(--text)",
            }}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Price */}
      <div>
        <div style={{
          fontFamily:   "var(--font-mono)",
          fontSize:     40,
          fontWeight:   700,
          color:        isActive ? (isFeatured ? "var(--accent)" : "var(--text)") : "var(--text-subtle)",
          lineHeight:   1,
          marginBottom: 6,
          transition:   "color 150ms",
        }}>
          {isActive ? `€${total.toFixed(2)}` : "—"}
        </div>
        <div className="body-s" style={{ color: "var(--text-muted)" }}>
          {qty === 0
            ? "Set quantity above to add to order"
            : qty === 1
              ? `€${base.toFixed(2)} for 1 slot`
              : `€${base.toFixed(2)} first · +€${extra} each additional`}
        </div>
      </div>
    </div>
  );
}

export function CreditSelector({ employerId }: { employerId: string }) {
  const [standardQty, setStandardQty] = useState(1);
  const [featuredQty, setFeaturedQty] = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const standardTotal = calcTotal(standardQty, "standard");
  const featuredTotal = calcTotal(featuredQty, "featured");
  const grandTotal    = standardTotal + featuredTotal;
  const hasAny        = standardQty > 0 || featuredQty > 0;

  async function handleCheckout() {
    if (!hasAny) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ standardQty, featuredQty, employerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "100%", maxWidth: 740 }}>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
        <SlotCard type="standard" qty={standardQty} onQtyChange={setStandardQty} />
        <SlotCard type="featured" qty={featuredQty} onQtyChange={setFeaturedQty} />
      </div>

      {/* Order summary + checkout */}
      <div style={{
        border:       "1.5px solid var(--border)",
        borderRadius: 14,
        padding:      "20px 24px",
        background:   "var(--surface)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {/* Line items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {!hasAny && (
              <span className="body-s" style={{ color: "var(--text-subtle)" }}>
                Set a quantity above to add slots to your order.
              </span>
            )}
            {standardQty > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Zap size={13} style={{ color: "var(--text-subtle)" }} />
                <span className="body-s" style={{ color: "var(--text-muted)" }}>
                  {standardQty} Standard slot{standardQty > 1 ? "s" : ""}
                </span>
                <span className="mono-s" style={{ color: "var(--text)", marginLeft: "auto", paddingLeft: 16 }}>
                  €{standardTotal.toFixed(2)}
                </span>
              </div>
            )}
            {featuredQty > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Star size={13} style={{ color: "var(--accent)" }} />
                <span className="body-s" style={{ color: "var(--text-muted)" }}>
                  {featuredQty} Featured slot{featuredQty > 1 ? "s" : ""}
                </span>
                <span className="mono-s" style={{ color: "var(--text)", marginLeft: "auto", paddingLeft: 16 }}>
                  €{featuredTotal.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Total + CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
            {hasAny && (
              <div style={{ textAlign: "right" }}>
                <div className="body-s" style={{ color: "var(--text-subtle)", marginBottom: 2 }}>Total</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>
                  €{grandTotal.toFixed(2)}
                </div>
              </div>
            )}
            <button
              onClick={handleCheckout}
              disabled={!hasAny || loading}
              className="btn btn-accent"
              style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, padding: "13px 20px", opacity: hasAny ? 1 : 0.5, cursor: hasAny ? "pointer" : "not-allowed" }}
            >
              {loading
                ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Redirecting…</>
                : <><ShoppingCart size={14} /> {hasAny ? `Checkout — €${grandTotal.toFixed(2)}` : "Select slots above"}</>
              }
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: "var(--error)", fontSize: 12, marginTop: 12, textAlign: "center" }}>{error}</p>
        )}
      </div>
    </div>
  );
}

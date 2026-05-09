"use client";

import { useState } from "react";
import { Minus, Plus, Star, Zap, Loader2, Check } from "lucide-react";

type SlotType = "standard" | "featured";

const PRICING: Record<SlotType, { base: number; extra: number }> = {
  standard: { base: 9.99,  extra: 5  },
  featured: { base: 14.99, extra: 10 },
};

function calcTotal(qty: number, type: SlotType) {
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

function SlotCard({ type, employerId }: { type: SlotType; employerId: string }) {
  const [qty,     setQty]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const isFeatured  = type === "featured";
  const { base, extra } = PRICING[type];
  const total       = calcTotal(qty, type);

  function changeQty(v: number) {
    setQty(Math.max(1, Math.min(50, isNaN(v) ? 1 : v)));
  }

  async function handleBuy() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ quantity: qty, slotType: type, employerId }),
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
    <div style={{
      flex:         "1 1 300px",
      border:       `2px solid ${isFeatured ? "var(--accent)" : "var(--border-strong)"}`,
      borderRadius: 18,
      padding:      32,
      background:   isFeatured ? "var(--accent-soft)" : "var(--surface)",
      display:      "flex",
      flexDirection:"column",
      gap:          24,
      position:     "relative",
    }}>
      {isFeatured && (
        <div style={{
          position:     "absolute",
          top:          -14,
          left:         "50%",
          transform:    "translateX(-50%)",
          background:   "var(--accent)",
          color:        "var(--white)",
          fontFamily:   "var(--font-mono)",
          fontSize:     11,
          fontWeight:   700,
          letterSpacing:"0.08em",
          padding:      "4px 14px",
          borderRadius: 99,
          whiteSpace:   "nowrap",
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
          background:   isFeatured ? "var(--accent)" : "var(--bg-muted)",
          display:      "grid",
          placeItems:   "center",
          flexShrink:   0,
        }}>
          {isFeatured
            ? <Star size={20} style={{ color: "var(--white)" }} />
            : <Zap  size={20} style={{ color: "var(--text-subtle)" }} />
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
            <Check size={13} style={{ color: isFeatured ? "var(--accent)" : "var(--text-subtle)", flexShrink: 0 }} />
            <span className="body-s" style={{ color: "var(--text-muted)" }}>{perk}</span>
          </div>
        ))}
      </div>

      {/* Quantity */}
      <div>
        <div className="body-s" style={{ color: "var(--text-subtle)", marginBottom: 10, fontWeight: 500 }}>
          How many slots?
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1.5px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--bg)", width: "fit-content" }}>
          <button
            onClick={() => changeQty(qty - 1)}
            disabled={qty <= 1}
            style={{
              width:      44,
              height:     48,
              display:    "flex",
              alignItems: "center",
              justifyContent: "center",
              border:     "none",
              background: "transparent",
              cursor:     qty <= 1 ? "not-allowed" : "pointer",
              color:      qty <= 1 ? "var(--text-subtle)" : "var(--text)",
            }}
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            min={1}
            max={50}
            value={qty}
            onChange={e => changeQty(parseInt(e.target.value))}
            style={{
              width:      56,
              textAlign:  "center",
              border:     "none",
              borderLeft: "1.5px solid var(--border)",
              borderRight:"1.5px solid var(--border)",
              background: "transparent",
              fontFamily: "var(--font-mono)",
              fontSize:   20,
              fontWeight: 700,
              color:      "var(--text)",
              outline:    "none",
              height:     48,
              padding:    "0 4px",
            }}
          />
          <button
            onClick={() => changeQty(qty + 1)}
            disabled={qty >= 50}
            style={{
              width:      44,
              height:     48,
              display:    "flex",
              alignItems: "center",
              justifyContent: "center",
              border:     "none",
              background: "transparent",
              cursor:     qty >= 50 ? "not-allowed" : "pointer",
              color:      qty >= 50 ? "var(--text-subtle)" : "var(--text)",
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
          color:        isFeatured ? "var(--accent)" : "var(--text)",
          lineHeight:   1,
          marginBottom: 6,
        }}>
          €{total.toFixed(2)}
        </div>
        <div className="body-s" style={{ color: "var(--text-muted)" }}>
          {qty === 1
            ? `€${base.toFixed(2)} for 1 slot`
            : `€${base.toFixed(2)} first · +€${extra} each additional`}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleBuy}
        disabled={loading}
        className={isFeatured ? "btn btn-accent" : "btn btn-primary"}
        style={{ width: "100%", justifyContent: "center", display: "flex", alignItems: "center", gap: 8, fontSize: 14, padding: "13px 20px", marginTop: "auto" }}
      >
        {loading
          ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Redirecting…</>
          : `Buy ${qty} slot${qty > 1 ? "s" : ""} — €${total.toFixed(2)}`
        }
      </button>

      {error && (
        <p style={{ color: "var(--error)", fontSize: 12, textAlign: "center", marginTop: -12 }}>{error}</p>
      )}
    </div>
  );
}

export function CreditSelector({ employerId }: { employerId: string }) {
  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", width: "100%", maxWidth: 740, justifyContent: "center" }}>
      <SlotCard type="standard" employerId={employerId} />
      <SlotCard type="featured" employerId={employerId} />
    </div>
  );
}

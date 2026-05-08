"use client";

import { useState } from "react";
import { Minus, Plus, Star, Zap, Loader2 } from "lucide-react";

type SlotType = "standard" | "featured";

const PRICING: Record<SlotType, { base: number; extra: number }> = {
  standard: { base: 9.99, extra: 5 },
  featured:  { base: 14.99, extra: 10 },
};

function calcTotal(qty: number, type: SlotType) {
  const { base, extra } = PRICING[type];
  return base + (qty - 1) * extra;
}

export function CreditSelector({ employerId }: { employerId: string }) {
  const [qty,     setQty]     = useState(1);
  const [type,    setType]    = useState<SlotType>("standard");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const total      = calcTotal(qty, type);
  const isFeatured = type === "featured";
  const { base, extra } = PRICING[type];

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
      border:     `2px solid ${isFeatured ? "var(--accent)" : "var(--border)"}`,
      borderRadius: 18,
      padding:    36,
      background: isFeatured ? "var(--accent-soft)" : "var(--surface)",
      maxWidth:   440,
      width:      "100%",
      transition: "border-color 0.2s, background 0.2s",
    }}>

      {/* ── Type toggle ── */}
      <div style={{
        display:    "flex",
        background: "var(--bg-muted)",
        borderRadius: 11,
        padding:    4,
        marginBottom: 32,
        gap:        4,
      }}>
        {(["standard", "featured"] as SlotType[]).map(t => {
          const active = type === t;
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                flex:            1,
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                gap:             7,
                padding:         "11px 16px",
                borderRadius:    8,
                border:          "none",
                cursor:          "pointer",
                fontFamily:      "var(--font-sans)",
                fontWeight:      active ? 700 : 500,
                fontSize:        14,
                background:      active ? (t === "featured" ? "var(--accent)" : "var(--surface)") : "transparent",
                color:           active ? (t === "featured" ? "var(--white)" : "var(--text)") : "var(--text-muted)",
                boxShadow:       active && t !== "featured" ? "0 1px 4px rgba(0,0,0,0.10)" : "none",
                transition:      "all 0.15s",
              }}
            >
              {t === "standard" ? <Zap size={14} /> : <Star size={14} />}
              {t === "standard" ? "Standard" : "Featured"}
            </button>
          );
        })}
      </div>

      {/* ── Qty counter ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
        <div style={{
          display:      "flex",
          alignItems:   "center",
          border:       "1.5px solid var(--border)",
          borderRadius: 12,
          overflow:     "hidden",
          background:   "var(--bg)",
        }}>
          <button
            onClick={() => changeQty(qty - 1)}
            disabled={qty <= 1}
            style={{
              width:           52,
              height:          60,
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
              border:          "none",
              background:      "transparent",
              cursor:          qty <= 1 ? "not-allowed" : "pointer",
              color:           qty <= 1 ? "var(--text-subtle)" : "var(--text)",
            }}
          >
            <Minus size={18} />
          </button>

          <input
            type="number"
            min={1}
            max={50}
            value={qty}
            onChange={e => changeQty(parseInt(e.target.value))}
            style={{
              width:        68,
              textAlign:    "center",
              border:       "none",
              borderLeft:   "1.5px solid var(--border)",
              borderRight:  "1.5px solid var(--border)",
              background:   "transparent",
              fontFamily:   "var(--font-mono)",
              fontSize:     24,
              fontWeight:   700,
              color:        "var(--text)",
              outline:      "none",
              height:       60,
              padding:      "0 4px",
            }}
          />

          <button
            onClick={() => changeQty(qty + 1)}
            disabled={qty >= 50}
            style={{
              width:           52,
              height:          60,
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
              border:          "none",
              background:      "transparent",
              cursor:          qty >= 50 ? "not-allowed" : "pointer",
              color:           qty >= 50 ? "var(--text-subtle)" : "var(--text)",
            }}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* ── Price ── */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize:   48,
          fontWeight: 700,
          color:      isFeatured ? "var(--accent)" : "var(--text)",
          lineHeight: 1,
          marginBottom: 8,
        }}>
          €{total.toFixed(2)}
        </div>
        <div className="body-s" style={{ color: "var(--text-muted)" }}>
          {qty === 1
            ? `€${base.toFixed(2)} for 1 ${type} slot`
            : `€${base.toFixed(2)} first slot · +€${extra} each additional`}
        </div>
      </div>

      {/* ── Buy button ── */}
      <button
        onClick={handleBuy}
        disabled={loading}
        className="btn btn-accent"
        style={{
          width:          "100%",
          justifyContent: "center",
          display:        "flex",
          alignItems:     "center",
          gap:            8,
          fontSize:       15,
          padding:        "14px 20px",
        }}
      >
        {loading
          ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Redirecting…</>
          : `Buy ${qty} ${type} slot${qty > 1 ? "s" : ""} — €${total.toFixed(2)}`
        }
      </button>

      {error && (
        <p style={{ color: "var(--error)", fontSize: 12, marginTop: 10, textAlign: "center" }}>{error}</p>
      )}
    </div>
  );
}

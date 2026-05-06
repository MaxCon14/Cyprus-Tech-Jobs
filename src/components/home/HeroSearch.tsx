"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { CITIES } from "@/lib/placeholder-data";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

  const handleSearch = () => {
    const p = new URLSearchParams();
    if (query.trim()) p.set("q", query.trim());
    if (city) p.set("city", city);
    router.push(`/jobs${p.toString() ? `?${p}` : ""}`);
  };

  return (
    <div className="hero-search">
      <div style={{ position: "relative", flex: "1 1 200px" }}>
        <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
        <input
          className="input"
          type="text"
          placeholder="Job title, company, or keyword…"
          style={{ paddingLeft: 38 }}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
        />
      </div>
      <div style={{ position: "relative", flex: "0 0 160px" }}>
        <MapPin size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", zIndex: 1 }} />
        <select
          className="select"
          style={{ paddingLeft: 38 }}
          value={city}
          onChange={e => setCity(e.target.value)}
        >
          <option value="">All locations</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <button className="btn btn-accent" onClick={handleSearch}>Search</button>
    </div>
  );
}

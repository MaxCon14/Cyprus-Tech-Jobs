"use client";
import { useState } from "react";
import { ChartNoAxesCombined } from "lucide-react";
import { PanelHeading } from "./AdminUI";
export function ActivityChart({ points }: { points: { date: string; count: number }[] }) {
  const [days, setDays] = useState(30);
  const [active, setActive] = useState<string | null>(null);
  const shown = points.slice(-days);
  const total = shown.reduce((sum, p) => sum + p.count, 0);
  const max = Math.max(...shown.map(p => p.count), 1);
  const selected = shown.find(p => p.date === active);
  const dateLabel = (date: string) => new Date(date + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  return <section className="adm-panel adm-chart-panel"><PanelHeading title="Application activity" description="Apply-button clicks · UTC calendar days" action={<div className="adm-segmented" aria-label="Chart period">{[7, 14, 30].map(n => <button key={n} type="button" aria-pressed={days === n} onClick={() => { setDays(n); setActive(null); }}>{n}D</button>)}</div>} /><div className="adm-chart-summary"><strong>{total.toLocaleString("en-GB")}</strong><span>clicks in the last {days} days</span><span className="adm-chart-readout" aria-live="polite">{selected ? `${dateLabel(selected.date)} · ${selected.count} clicks` : "Hover or focus a day to explore"}</span></div>
    <div className="adm-chart"><div className="adm-chart-axis"><span>{max}</span><span>{Math.round(max / 2)}</span><span>0</span></div><div className="adm-chart-plot"><div className="adm-chart-grid" aria-hidden="true" /><div className="adm-chart-bars">{shown.map(p => <button type="button" key={p.date} className={active === p.date ? "is-active" : ""} aria-label={`${dateLabel(p.date)}: ${p.count} apply clicks`} title={`${dateLabel(p.date)}: ${p.count} clicks`} onMouseEnter={() => setActive(p.date)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(p.date)} onBlur={() => setActive(null)}><span style={{ height: `${Math.max(p.count / max * 100, 1)}%`, opacity: p.count ? 1 : 0.25 }} /></button>)}</div>{total === 0 && <div className="adm-chart-zero"><ChartNoAxesCombined size={22} /><span>No apply clicks in this period</span></div>}</div></div>
    <div className="adm-chart-labels"><span>{shown[0] && dateLabel(shown[0].date)}</span><span>{shown[Math.floor(shown.length / 2)] && dateLabel(shown[Math.floor(shown.length / 2)].date)}</span><span>{shown.at(-1) && dateLabel(shown.at(-1)!.date)}</span></div><p className="adm-chart-note">Clicks measure interest, not completed applications.</p></section>;
}

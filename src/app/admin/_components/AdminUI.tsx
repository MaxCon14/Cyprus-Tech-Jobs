import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Inbox } from "lucide-react";

export function PageHeading({ eyebrow = "Workspace", title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="adm-page-heading"><div><p className="adm-eyebrow">{eyebrow}</p><h1>{title}</h1><p className="adm-description">{description}</p></div>{actions && <div className="adm-heading-actions">{actions}</div>}</div>;
}
export function StatCard({ label, value, detail, icon, href }: { label: string; value: string | number; detail: string; icon: ReactNode; href?: string }) {
  const content = <><div className="adm-stat-top"><span>{label}</span><span className="adm-stat-icon">{icon}</span></div><div className="adm-stat-value">{typeof value === "number" ? value.toLocaleString("en-GB") : value}</div><div className="adm-stat-detail">{detail}{href && <ArrowUpRight size={14} />}</div></>;
  return href ? <Link href={href} className="adm-stat">{content}</Link> : <div className="adm-stat">{content}</div>;
}
export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="adm-empty"><span className="adm-empty-icon"><Inbox size={24} /></span><h3>{title}</h3><p>{description}</p>{action}</div>;
}
export function PanelHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <div className="adm-panel-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
}

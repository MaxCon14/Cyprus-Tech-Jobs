import type { ReactNode } from "react";
export function AdminTable({ columns, children }: { columns: string[]; children: ReactNode }) {
  return <div className="adm-table-wrap"><div className="admin-table-scroll" role="region" aria-label="Management table" tabIndex={0}><table className="adm-table"><thead><tr>{columns.map(col => <th scope="col" key={col}>{col}</th>)}</tr></thead><tbody>{children}</tbody></table></div></div>;
}
export function AdminTr({ children }: { children: ReactNode }) { return <tr>{children}</tr>; }
export function AdminTd({ children, subtle, mono, right }: { children: ReactNode; subtle?: boolean; mono?: boolean; right?: boolean }) {
  return <td className={`${subtle ? "adm-muted" : ""} ${mono ? "adm-tabular" : ""}`} style={{ textAlign: right ? "right" : undefined }}>{children}</td>;
}
export function StatusBadge({ status }: { status: string }) {
  const tone = ["ACTIVE", "LIVE", "VERIFIED"].includes(status) ? "success" : ["EXPIRED", "UNVERIFIED"].includes(status) ? "warning" : ["BLOCKED", "CLOSED"].includes(status) ? "danger" : status === "PAUSED" ? "info" : status === "FEATURED" ? "accent" : "neutral";
  return <span className={`adm-badge adm-badge-${tone}`}><span />{status === "—" ? "Standard" : status.charAt(0) + status.slice(1).toLowerCase().replaceAll("_", " ")}</span>;
}

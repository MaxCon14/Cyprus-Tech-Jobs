"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
export const PAGE_SIZE = 15;
export function Pagination({ total, page, onChange }: { total: number; page: number; onChange: (page: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return <div className="adm-pagination"><span>{total ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}` : "0 results"}</span><div><button type="button" className="adm-icon-button" aria-label="Previous page" disabled={page <= 1} onClick={() => onChange(page - 1)}><ChevronLeft size={16} /></button><span>Page {page} of {pages}</span><button type="button" className="adm-icon-button" aria-label="Next page" disabled={page >= pages} onClick={() => onChange(page + 1)}><ChevronRight size={16} /></button></div></div>;
}

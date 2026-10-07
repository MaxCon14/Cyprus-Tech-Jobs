"use client";
import { Search, X } from "lucide-react";
export function AdminSearchInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (value: string) => void }) {
  return <div className="adm-search"><Search size={16} /><input type="search" aria-label={placeholder} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />{value && <button type="button" aria-label="Clear search" onClick={() => onChange("")}><X size={14} /></button>}</div>;
}

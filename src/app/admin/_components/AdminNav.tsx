"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BriefcaseBusiness, Users, Building2, Tags, ChartNoAxesCombined, FileText, ArrowUpRight, LogOut, Menu, X, Plus } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const groups = [
  { label: "Workspace", items: [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/jobs", label: "Job listings", icon: BriefcaseBusiness },
    { href: "/admin/users", label: "People", icon: Users },
    { href: "/admin/companies", label: "Companies", icon: Building2 },
  ] },
  { label: "Insights & content", items: [
    { href: "/admin/analytics", label: "Analytics", icon: ChartNoAxesCombined },
    { href: "/admin/blog", label: "Blog posts", icon: FileText },
    { href: "/admin/taxonomy", label: "Categories & tags", icon: Tags },
  ] },
];
export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const nav = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    nav.current?.querySelector<HTMLElement>("a")?.focus();
    const media = window.matchMedia("(min-width: 769px)");
    const onResize = () => { if (media.matches) setOpen(false); };
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
      if (event.key !== "Tab") return;
      const elements = [toggle.current, ...Array.from(nav.current?.querySelectorAll<HTMLElement>("a, button:not(:disabled)") ?? [])].filter(Boolean) as HTMLElement[];
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener("keydown", onKey);
    media.addEventListener("change", onResize);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener("keydown", onKey); media.removeEventListener("change", onResize); };
  }, [open]);
  async function signOut() {
    setBusy(true); setError("");
    try {
      const { error } = await createSupabaseBrowserClient().auth.signOut();
      if (error) throw error;
      router.push("/admin/login"); router.refresh();
    } catch { setError("Could not sign out. Please try again."); setBusy(false); }
  }
  return <>
    <button ref={toggle} className="adm-menu-toggle" type="button" aria-controls="admin-navigation" aria-expanded={open} aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
    {open && <div className="adm-backdrop" onClick={() => { setOpen(false); toggle.current?.focus(); }} />}
    <nav ref={nav} id="admin-navigation" aria-label="Admin navigation" className={`adm-sidebar ${open ? "is-open" : ""}`}>
      <Link href="/admin/dashboard" className="adm-brand" onClick={() => setOpen(false)}><span className="adm-brand-mark">c<span>t</span></span><span>CyprusTech<span className="adm-brand-sub">CAREERS / ADMIN</span></span></Link>
      <div className="adm-workspace"><span className="adm-workspace-dot" /><div>Platform workspace<small>Administrator access</small></div></div>
      <div className="adm-nav-groups">{groups.map(group => <div key={group.label} className="adm-nav-group"><p>{group.label}</p>{group.items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`adm-nav-link ${active ? "is-active" : ""}`} onClick={() => setOpen(false)}><Icon size={18} strokeWidth={1.7} /><span>{label}</span>{active && <span className="adm-active-dot" />}</Link>;
      })}</div>)}</div>
      <div className="adm-sidebar-bottom"><div className="adm-sidebar-callout"><span>Build the next opportunity.</span><p>Connect great people with their next role in Cyprus.</p><Link href="/admin/jobs/new" onClick={() => setOpen(false)}><Plus size={15} /> Add a job</Link></div>
      <Link className="adm-site-link" href="/" target="_blank" rel="noreferrer">View public website <ArrowUpRight size={15} /></Link>
      <div className="adm-account"><span className="adm-avatar">{email.slice(0, 1).toUpperCase()}</span><div><strong>Administrator</strong><small title={email}>{email}</small></div><button type="button" title="Sign out" aria-label="Sign out" disabled={busy} onClick={signOut}><LogOut size={17} /></button></div>
      {error && <p role="alert" className="adm-sidebar-error">{error}</p>}</div>
    </nav>
  </>;
}

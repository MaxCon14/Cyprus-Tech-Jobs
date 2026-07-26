import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { TECH_STACK_OPTIONS } from "@/lib/onboarding-types";
import { PostJobForm } from "./PostJobForm";

export const metadata: Metadata = {
  title: "Post a Tech Job in Cyprus — Reach 10,000+ Candidates",
  description: "Post a tech job in Cyprus and reach thousands of active candidates. Listings go live instantly. No recruiter fees — direct applications only.",
  alternates: { canonical: "https://cyprustech.careers/post-a-job" },
  openGraph: {
    title: "Post a Tech Job in Cyprus — Reach 10,000+ Candidates",
    description: "Post a tech job in Cyprus and reach thousands of active candidates. Listings go live instantly.",
    url: "https://cyprustech.careers/post-a-job",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Post a Tech Job in Cyprus",
    description: "Reach thousands of active tech candidates in Cyprus. Listings go live instantly.",
  },
};

export default async function PostAJobPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  /* Categories come from the database, not from placeholder-data. The
     placeholder list carries a different taxonomy — its Frontend children are
     frontend-react / frontend-web, the real ones are react-developer /
     web-developer — and api/jobs/post upserts whatever slug it receives. So a
     job posted against a placeholder slug created a brand-new top-level
     category with no parent, invisible to /jobs?category=frontend. */
  const [employer, allTagRows, categoryRows] = await Promise.all([
    prisma.employer.findUnique({ where: { email: user.email }, include: { company: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({
      where:   { parentId: null },
      orderBy: { name: "asc" },
      include: { children: { orderBy: { name: "asc" }, select: { name: true, slug: true } } },
    }),
  ]);
  if (!employer) {
    const { data: candidate } = await supabaseAdmin
      .from("candidates").select("id").eq("email", user.email).single();
    redirect(candidate ? "/candidates/dashboard" : "/employers/onboarding");
  }

  const dbTagNames = allTagRows.map(t => t.name);
  const allTags = [...new Set([...TECH_STACK_OPTIONS, ...dbTagNames])];

  return (
    <div>
      {/* Hero */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "clamp(36px,5vw,56px) var(--page-padding-x)", background: "var(--bg-alt)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 20, height: 1, background: "var(--accent)", display: "inline-block" }} />
            POST A JOB · CYPRUSTECHCAREERS
          </div>
          <h1 className="display-l" style={{ marginBottom: 8 }}>
            Post a job listing
          </h1>
          <p className="body-l" style={{ color: "var(--text-muted)", maxWidth: 500 }}>
            Fill in the details below and your listing goes live instantly.
          </p>
        </div>
      </div>

      <div className="page-container" style={{ paddingBlock: "clamp(36px,5vw,56px)" }}>
        <PostJobForm
          standardSlots={employer.standardSlots}
          featuredSlots={employer.featuredSlots}
          companyName={employer.company?.name ?? ""}
          companyWebsite={employer.company?.website ?? ""}
          companyDescription={employer.company?.description ?? ""}
          allTags={allTags}
          categories={categoryRows.map(c => ({
            label: c.name, slug: c.slug,
            children: c.children.map(ch => ({ label: ch.name, slug: ch.slug })),
          }))}
        />
      </div>
    </div>
  );
}

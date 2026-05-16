import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
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

  const [employer, allTagRows] = await Promise.all([
    prisma.employer.findUnique({ where: { email: user.email }, include: { company: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!employer) {
    const { data: candidate } = await supabaseAdmin
      .from("candidates").select("id").eq("email", user.email).single();
    redirect(candidate ? "/candidates/dashboard" : "/employers/onboarding");
  }

  const allTags = allTagRows.map(t => t.name);

  return (
    <div>
      {/* Hero */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "clamp(36px,5vw,56px) var(--page-padding-x)", background: "var(--bg-alt)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div className="mono-s" style={{ color: "var(--text-subtle)", letterSpacing: "0.1em", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 20, height: 1, background: "var(--accent)", display: "inline-block" }} />
            POST A JOB · CYPRUSTECHJOBS
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
        />
      </div>
    </div>
  );
}

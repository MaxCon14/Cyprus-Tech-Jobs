import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

export default async function DashboardRedirectPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) redirect("/login");

  const [employer, { data: candidate }] = await Promise.all([
    prisma.employer.findUnique({ where: { email: user.email }, select: { id: true } }),
    supabaseAdmin.from("candidates").select("id").eq("email", user.email).single(),
  ]);

  if (candidate) redirect("/candidates/dashboard");
  if (employer)  redirect("/employers/dashboard");

  redirect("/login");
}

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Blocks logged-in candidates from every /employers/* route server-side.
export default async function EmployersLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user?.email) {
    const { data: candidate } = await supabaseAdmin
      .from("candidates")
      .select("id")
      .eq("email", user.email)
      .single();

    if (candidate) {
      redirect("/candidates/dashboard");
    }
  }

  return <>{children}</>;
}

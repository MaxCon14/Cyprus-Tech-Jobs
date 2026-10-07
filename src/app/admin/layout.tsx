import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdminNav from "./_components/AdminNav";
import { AdminHeader } from "./_components/AdminHeader";
import "./admin.css";
export const metadata = { title: "Admin — CyprusTech.Careers", robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // The proxy and every admin API enforce authentication; preserve the login route.
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || user.email !== process.env.ADMIN_EMAIL) return <>{children}</>;
  return <div className="adm-shell"><a className="adm-skip" href="#admin-content">Skip to content</a><AdminNav email={user.email} /><div className="adm-workarea"><AdminHeader /><div id="admin-content" tabIndex={-1} className="adm-main">{children}</div><footer className="adm-footer"><span>CyprusTech.Careers</span><span>Your platform, at a glance.</span></footer></div></div>;
}

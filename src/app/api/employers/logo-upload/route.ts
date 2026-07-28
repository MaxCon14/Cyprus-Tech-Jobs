import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { uploadLogo } from "@/lib/logo-upload";
import { allowRequest, clientIp, tooManyRequests } from "@/lib/rate-limit";

/* This route cannot require a session: the logo is chosen on step 2 of the
   employer wizard and the account is not verified until step 4, so there is no
   user to check yet. The only identity available is then the IP, so that is
   what carries the limit — without it this is anonymous, unmetered write access
   to a public bucket. A signed-in employer editing their company later is
   already identified, so they get a higher ceiling. */
const ANON_RULE = { name: "logo-upload-anon", limit: 10, windowSeconds: 3600 };
const USER_RULE = { name: "logo-upload-user", limit: 40, windowSeconds: 3600 };

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const rule = user?.email ? USER_RULE : ANON_RULE;
  const who  = user?.email ?? clientIp(req);
  if (!await allowRequest(who, rule)) {
    return tooManyRequests(rule, "Too many uploads. Please wait a little and try again.");
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const result = await uploadLogo(formData.get("file"));
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ url: result.url });
}

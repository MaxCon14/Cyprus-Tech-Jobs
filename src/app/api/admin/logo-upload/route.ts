import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, adminUnauthorized } from "@/lib/admin-auth";
import { uploadLogo } from "@/lib/logo-upload";

/** Logo upload for curated listings. Admin only, unlike the employer route,
 *  which is reached during onboarding before there is a session to check. */
export async function POST(req: NextRequest) {
  if (!await getAdminUser()) return adminUnauthorized();

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

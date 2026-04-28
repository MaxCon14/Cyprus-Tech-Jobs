import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 422 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are accepted." }, { status: 422 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large — maximum 5 MB." }, { status: 422 });
  }

  // Use the candidate's email as part of the path if authenticated
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const prefix = user?.email
    ? user.email.replace(/[^a-zA-Z0-9]/g, "_")
    : crypto.randomUUID();
  const path = `${prefix}/cv-${Date.now()}.pdf`;

  const bytes = await file.arrayBuffer();
  const { data, error } = await supabaseAdmin.storage
    .from("cvs")
    .upload(path, bytes, { contentType: "application/pdf", upsert: true });

  if (error) {
    console.error("[cv-upload]", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("cvs")
    .getPublicUrl(data.path);

  // If authenticated, save cvUrl on the candidate record immediately
  if (user?.email) {
    await supabaseAdmin
      .from("candidates")
      .update({ cvUrl: publicUrl })
      .eq("email", user.email);
  }

  return NextResponse.json({ url: publicUrl });
}

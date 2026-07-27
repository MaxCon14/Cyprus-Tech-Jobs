import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { allowRequest, clientIp, tooManyRequests } from "@/lib/rate-limit";

/* Guests apply without an account, so this endpoint has to accept anonymous
   uploads. Signed-in candidates get a far higher ceiling because they are
   already identified and re-uploading a CV is a normal thing to do. */
const ANON_RULE = { name: "cv-upload-anon", limit: 6,  windowSeconds: 3600 };
const USER_RULE = { name: "cv-upload-user", limit: 40, windowSeconds: 3600 };

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
  if (file.size === 0) {
    return NextResponse.json({ error: "That file is empty." }, { status: 422 });
  }

  const bytes = await file.arrayBuffer();

  /* The declared content type comes from the client and can say anything.
     Check the actual bytes so the public `cvs` bucket cannot be used to host
     HTML, scripts or anything else that merely claims to be a PDF. */
  const header = new TextDecoder("latin1").decode(bytes.slice(0, 5));
  if (header !== "%PDF-") {
    return NextResponse.json({ error: "That file is not a valid PDF." }, { status: 422 });
  }

  // Use the candidate's email as part of the path if authenticated
  const prefix = user?.email
    ? user.email.replace(/[^a-zA-Z0-9]/g, "_")
    : crypto.randomUUID();
  const path = `${prefix}/cv-${Date.now()}.pdf`;

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

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;
const BUCKET = "avatars";

async function ensureBucket() {
  const { data: bucket } = await supabaseAdmin.storage.getBucket(BUCKET);
  if (!bucket) {
    await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { data: candidate } = await supabaseAdmin
    .from("candidates")
    .select("id")
    .eq("email", user.email)
    .single();

  if (!candidate) {
    return NextResponse.json({ error: "Candidate profile not found." }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, and WebP images are accepted." }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 2 MB." }, { status: 422 });
  }

  await ensureBucket();

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const storagePath = `${candidate.id}/avatar.${ext}`;
  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: file.type, upsert: true });

  if (uploadError) {
    console.error("[upload-avatar]", uploadError);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath);

  await supabaseAdmin
    .from("candidates")
    .update({ avatarUrl: publicUrl })
    .eq("id", candidate.id);

  return NextResponse.json({ url: publicUrl });
}

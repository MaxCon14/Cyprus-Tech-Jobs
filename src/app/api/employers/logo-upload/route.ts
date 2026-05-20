import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED  = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File))
    return NextResponse.json({ error: "No file provided." }, { status: 422 });
  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: "Unsupported file type." }, { status: 422 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "File too large — maximum 2 MB." }, { status: 422 });

  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `logo-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { data, error } = await supabaseAdmin.storage
    .from("logos")
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) {
    console.error("[logo-upload]", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("logos")
    .getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl });
}

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

const BUCKET = "logos";
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function ensureBucket() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const bucket = buckets?.find((b) => b.name === BUCKET);
  if (!bucket) {
    await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
  } else if (!bucket.public) {
    await supabaseAdmin.storage.updateBucket(BUCKET, { public: true });
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const companyId = formData.get("companyId") as string | null;

  if (!file || !companyId) {
    return NextResponse.json({ error: "Missing file or companyId." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, or WebP images are allowed." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 2 MB." }, { status: 400 });
  }

  // Validate companyId exists
  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } });
  if (!company) {
    return NextResponse.json({ error: "Company not found." }, { status: 404 });
  }

  try {
    await ensureBucket();

    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `${companyId}/logo.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("[upload-logo]", uploadError);
      return NextResponse.json({ error: "Upload failed." }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

    await prisma.company.update({ where: { id: companyId }, data: { logoUrl: publicUrl } });

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    console.error("[upload-logo]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

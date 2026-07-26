import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Shared logo upload used by the employer onboarding route and the admin
 * curated-job form. Both put files in the same public `logos` bucket, so the
 * validation and naming live in one place rather than drifting apart.
 */

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED  = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];

export type LogoUploadResult =
  | { ok: true;  url: string }
  | { ok: false; error: string; status: number };

export async function uploadLogo(file: unknown): Promise<LogoUploadResult> {
  if (!(file instanceof File))
    return { ok: false, error: "No file provided.", status: 422 };
  if (!ALLOWED.includes(file.type))
    return { ok: false, error: "Unsupported file type.", status: 422 };
  if (file.size > MAX_SIZE)
    return { ok: false, error: "File too large — maximum 2 MB.", status: 422 };

  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `logo-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { data, error } = await supabaseAdmin.storage
    .from("logos")
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) {
    console.error("[logo-upload]", error);
    return { ok: false, error: "Upload failed. Please try again.", status: 500 };
  }

  const { data: { publicUrl } } = supabaseAdmin.storage.from("logos").getPublicUrl(data.path);
  return { ok: true, url: publicUrl };
}

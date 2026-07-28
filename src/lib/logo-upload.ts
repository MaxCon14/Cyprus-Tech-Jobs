import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Shared logo upload used by the employer onboarding route and the admin
 * curated-job form. Both put files in the same public `logos` bucket, so the
 * validation and naming live in one place rather than drifting apart.
 */

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

/**
 * The raster formats a company logo can legitimately be.
 *
 * SVG is deliberately absent. It is a document, not an image: it can carry
 * <script>, and the bucket is public, so anyone opening the file URL directly
 * would execute it. Nothing about a logo needs vector delivery here.
 */
const SIGNATURES: { mime: string; ext: string; match: (b: Uint8Array) => boolean }[] = [
  { mime: "image/jpeg", ext: "jpg",  match: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png",  ext: "png",  match: b => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
                                                 b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a },
  { mime: "image/gif",  ext: "gif",  match: b => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 },
  // RIFF....WEBP — the four size bytes at 4..7 are skipped.
  { mime: "image/webp", ext: "webp", match: b => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
                                                 b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50 },
];

/**
 * Identify a file by its leading bytes.
 *
 * The declared content type and the filename both come from the client and can
 * say anything, so neither is trusted for the stored type, the extension, or
 * the accept/reject decision — otherwise the public bucket becomes a host for
 * whatever a caller claims is a PNG.
 */
function sniffImage(bytes: ArrayBuffer): { mime: string; ext: string } | null {
  const head = new Uint8Array(bytes.slice(0, 12));
  if (head.length < 12) return null;
  return SIGNATURES.find(s => s.match(head)) ?? null;
}

export type LogoUploadResult =
  | { ok: true;  url: string }
  | { ok: false; error: string; status: number };

export async function uploadLogo(file: unknown): Promise<LogoUploadResult> {
  if (!(file instanceof File))
    return { ok: false, error: "No file provided.", status: 422 };
  if (file.size === 0)
    return { ok: false, error: "That file is empty.", status: 422 };
  if (file.size > MAX_SIZE)
    return { ok: false, error: "File too large — maximum 2 MB.", status: 422 };

  const bytes = await file.arrayBuffer();
  const kind  = sniffImage(bytes);
  if (!kind) {
    return {
      ok: false,
      error: "Unsupported file type. Use a JPG, PNG, WebP or GIF image.",
      status: 422,
    };
  }

  const path = `logo-${Date.now()}-${Math.random().toString(36).slice(2)}.${kind.ext}`;

  const { data, error } = await supabaseAdmin.storage
    .from("logos")
    .upload(path, bytes, { contentType: kind.mime, upsert: false });

  if (error) {
    console.error("[logo-upload]", error);
    return { ok: false, error: "Upload failed. Please try again.", status: 500 };
  }

  const { data: { publicUrl } } = supabaseAdmin.storage.from("logos").getPublicUrl(data.path);
  return { ok: true, url: publicUrl };
}

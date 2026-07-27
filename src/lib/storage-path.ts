/**
 * Recover the bucket-relative path from a Supabase public storage URL.
 *
 * Deleting a database row that points at an upload is not a deletion — the file
 * stays in a public bucket and its URL keeps working. Removing it needs the
 * path the storage API expects, and all we have stored is the public URL, so
 * this has to turn one back into the other. If it silently returned null the
 * files would be quietly orphaned, which is why it is tested rather than
 * assumed.
 */
export function storagePathFromPublicUrl(url: string | null | undefined, bucket: string): string | null {
  if (typeof url !== "string" || !url) return null;

  const marker = `/storage/v1/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;

  const raw = url.slice(i + marker.length).split("?")[0]!.split("#")[0]!;
  if (!raw) return null;

  try {
    return decodeURIComponent(raw);
  } catch {
    // Malformed escape sequence — the literal path is still better than nothing.
    return raw;
  }
}

/**
 * Checks the two pieces of the 30-day guest purge that fail silently if wrong:
 * turning a stored public URL back into a deletable storage path, and deciding
 * which guests are past retention.
 *
 *   npx tsx scripts/verify-retention.ts
 */
import { storagePathFromPublicUrl } from "../src/lib/storage-path";

let failures = 0;
function check(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { failures++; console.log(`FAIL  ${name}\n        got:  ${JSON.stringify(got)}\n        want: ${JSON.stringify(want)}`); }
  else console.log(`  ok  ${name}`);
}

const BASE = "https://mhyohrxnwgngwjnkllpd.supabase.co/storage/v1/object/public/cvs/";

console.log("— storage paths must be recoverable, or files are orphaned —");
check("guest CV (uuid prefix)",
  storagePathFromPublicUrl(`${BASE}0f8b2c1a-1111/cv-1730000000000.pdf`, "cvs"),
  "0f8b2c1a-1111/cv-1730000000000.pdf");
check("signed-in CV (email prefix)",
  storagePathFromPublicUrl(`${BASE}maria_example_com/cv-1730000000000.pdf`, "cvs"),
  "maria_example_com/cv-1730000000000.pdf");
check("cover letter (nested)",
  storagePathFromPublicUrl(`${BASE}cover-letters/abc-123/cl-1730000000000.pdf`, "cvs"),
  "cover-letters/abc-123/cl-1730000000000.pdf");
check("percent-encoded segment",
  storagePathFromPublicUrl(`${BASE}a%20b/cv%2D1.pdf`, "cvs"), "a b/cv-1.pdf");
check("query string stripped",
  storagePathFromPublicUrl(`${BASE}abc/cv.pdf?token=xyz`, "cvs"), "abc/cv.pdf");
check("fragment stripped",
  storagePathFromPublicUrl(`${BASE}abc/cv.pdf#page=2`, "cvs"), "abc/cv.pdf");
check("wrong bucket -> null",
  storagePathFromPublicUrl(`${BASE}abc/cv.pdf`, "avatars"), null);
check("external URL -> null",
  storagePathFromPublicUrl("https://example.com/cv.pdf", "cvs"), null);
check("null / empty -> null", storagePathFromPublicUrl(null, "cvs"), null);
check("bucket root, no file -> null", storagePathFromPublicUrl(BASE, "cvs"), null);

/* Mirrors the route: a guest is past retention when their last application —
   or their signup, if they never applied — is older than the cutoff. */
function expiredIds(
  guests: { id: string; createdAt: string }[],
  apps: { candidateId: string; appliedAt: string }[],
  cutoff: string,
): string[] {
  const last = new Map<string, string>();
  for (const a of apps) {
    const prev = last.get(a.candidateId);
    if (!prev || a.appliedAt > prev) last.set(a.candidateId, a.appliedAt);
  }
  return guests.filter(g => (last.get(g.id) ?? g.createdAt) < cutoff).map(g => g.id);
}

const day = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const CUTOFF = day(30);

console.log("\n— retention window —");
check("applied 31 days ago -> purged",
  expiredIds([{ id: "a", createdAt: day(60) }], [{ candidateId: "a", appliedAt: day(31) }], CUTOFF), ["a"]);
check("applied 29 days ago -> kept",
  expiredIds([{ id: "b", createdAt: day(60) }], [{ candidateId: "b", appliedAt: day(29) }], CUTOFF), []);
check("old application, newer one resets the clock",
  expiredIds([{ id: "c", createdAt: day(90) }],
             [{ candidateId: "c", appliedAt: day(80) }, { candidateId: "c", appliedAt: day(2) }], CUTOFF), []);
check("signed up 31 days ago, never applied -> purged",
  expiredIds([{ id: "d", createdAt: day(31) }], [], CUTOFF), ["d"]);
check("signed up today, never applied -> kept",
  expiredIds([{ id: "e", createdAt: day(0) }], [], CUTOFF), []);
check("mixed batch picks only the expired",
  expiredIds(
    [{ id: "x", createdAt: day(90) }, { id: "y", createdAt: day(90) }, { id: "z", createdAt: day(1) }],
    [{ candidateId: "x", appliedAt: day(40) }, { candidateId: "y", appliedAt: day(5) }],
    CUTOFF,
  ), ["x"]);

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);

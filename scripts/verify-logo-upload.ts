/**
 * Checks the logo upload validator against real byte payloads.
 *
 * The point of the change it covers is that the client's declared content type
 * and filename are no longer trusted, so every case here lies in one of those
 * two fields and is judged only on its bytes.
 *
 * Run: npx tsx scripts/verify-logo-upload.ts
 */
import { uploadLogo } from "../src/lib/logo-upload";

let pass = 0, fail = 0;

function check(name: string, cond: boolean, extra = "") {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else      { fail++; console.log(`  FAIL ${name} ${extra}`); }
}

const png  = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0, 1, 2, 3]);
const jpeg = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(20)]);
const gif  = Buffer.concat([Buffer.from("GIF89a", "latin1"), Buffer.alloc(20)]);
const webp = Buffer.concat([
  Buffer.from("RIFF", "latin1"), Buffer.from([0, 0, 0, 0]),
  Buffer.from("WEBP", "latin1"), Buffer.alloc(20),
]);
const svg  = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>`, "utf8");
const html = Buffer.from(`<html><script>alert(1)</script></html>`, "utf8");

function file(bytes: Buffer, name: string, type: string): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

/** Only the rejection path is exercised — accepting would write to storage. */
async function reject(name: string, f: File, expectStatus = 422) {
  const res = await uploadLogo(f);
  check(name, res.ok === false && res.status === expectStatus,
    JSON.stringify(res).slice(0, 90));
}

(async () => {
  console.log("\nRejected regardless of what the client claims");
  await reject("SVG declared as image/svg+xml", file(svg, "logo.svg", "image/svg+xml"));
  await reject("SVG relabelled as image/png",   file(svg, "logo.png", "image/png"));
  await reject("HTML relabelled as image/png",  file(html, "logo.png", "image/png"));
  await reject("empty file",                    file(Buffer.alloc(0), "logo.png", "image/png"));
  await reject("not a file at all",             "nope" as unknown as File);

  console.log("\nSize limit still enforced");
  const big = Buffer.concat([png, Buffer.alloc(3 * 1024 * 1024)]);
  await reject("3 MB PNG", file(big, "logo.png", "image/png"));

  console.log("\nReal images pass validation (they reach the storage call)");
  // No Supabase credentials here, so a genuine image gets past every check and
  // fails at upload with 500 — which is itself the proof it was accepted.
  for (const [label, bytes] of [["PNG", png], ["JPEG", jpeg], ["GIF", gif], ["WebP", webp]] as const) {
    const res = await uploadLogo(file(bytes, "logo.bin", "application/octet-stream"));
    check(`${label} accepted on bytes alone (declared octet-stream)`,
      res.ok === true || (res.ok === false && res.status === 500),
      JSON.stringify(res).slice(0, 90));
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})();

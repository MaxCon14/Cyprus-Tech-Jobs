/**
 * Checks the CV URL allowlist that closes the SSRF on parse-cv and cv-review.
 *
 * The interesting cases are the refusals, not the happy path — each one below
 * is a way people actually get past a naive host check.
 *
 *   npx tsx scripts/verify-cv-url.ts
 */
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mhyohrxnwgngwjnkllpd.supabase.co";

import { checkCvUrl } from "../src/lib/cv-url";

const HOST = "mhyohrxnwgngwjnkllpd.supabase.co";
const OK   = `https://${HOST}/storage/v1/object/public/cvs/abc/cv.pdf`;

let failures = 0;

function expect(name: string, input: string, shouldPass: boolean) {
  const res  = checkCvUrl(input);
  const pass = res.ok === shouldPass;
  if (!pass) failures++;
  const verdict = res.ok ? "ALLOWED" : `refused (${res.reason})`;
  console.log(`${pass ? "✓" : "✗"} ${name.padEnd(44)} ${verdict}`);
}

console.log("— must be allowed —");
expect("a real uploaded CV", OK, true);
expect("nested path under the cvs bucket",
  `https://${HOST}/storage/v1/object/public/cvs/u/1/my cv.pdf`.replace(/ /g, "%20"), true);
expect("scheme-less input is normalised",
  `${HOST}/storage/v1/object/public/cvs/abc/cv.pdf`, true);

console.log("\n— must be refused —");
expect("plain internal address",        "http://169.254.169.254/latest/meta-data/", false);
expect("localhost",                     "http://127.0.0.1:3000/admin", false);
expect("arbitrary external host",       "https://evil.example.com/x.pdf", false);
expect("http on the right host",        `http://${HOST}/storage/v1/object/public/cvs/a.pdf`, false);
expect("credentials disguising the host", `https://${HOST}@evil.example.com/x.pdf`, false);
expect("lookalike subdomain",           `https://${HOST}.evil.example.com/x.pdf`, false);
expect("host as a path segment",        `https://evil.example.com/${HOST}/storage/v1/object/public/cvs/a.pdf`, false);
expect("right host, private bucket",    `https://${HOST}/storage/v1/object/public/logos/a.png`, false);
expect("right host, admin API path",    `https://${HOST}/rest/v1/candidates?select=*`, false);
expect("path traversal out of the bucket",
  `https://${HOST}/storage/v1/object/public/cvs/../../../rest/v1/candidates`, false);
expect("empty string",                  "", false);
expect("not a URL at all",              "!!!", false);

console.log("\n— fails closed without config —");
delete process.env.NEXT_PUBLIC_SUPABASE_URL;
const unconfigured = checkCvUrl(OK);
const closed = !unconfigured.ok;
if (!closed) failures++;
console.log(`${closed ? "✓" : "✗"} ${"no storage host configured".padEnd(44)} ${closed ? "refused" : "ALLOWED"}`);

console.log(failures === 0 ? "\nAll CV URL checks passed." : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);

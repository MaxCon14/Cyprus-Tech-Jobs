/**
 * Checks the webhook signature guard on /api/resend/inbound.
 *
 * That route sends mail when called, so the signature check is the only thing
 * keeping it from being an open relay. Every rejection path is exercised here,
 * including a valid signature replayed outside the timestamp window.
 *
 * Run: npx tsx scripts/verify-svix.ts
 */
import { createHmac } from "crypto";
import { verifySvixSignature } from "../src/lib/svix-verify";

let pass = 0, fail = 0;
function check(name: string, cond: boolean, extra = "") {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else      { fail++; console.log(`  FAIL ${name} ${extra}`); }
}

const SECRET = "whsec_" + Buffer.from("a-test-signing-key-of-some-length").toString("base64");
const BODY   = JSON.stringify({ type: "email.received", data: { subject: "hi" } });
const ID     = "msg_2abc";
const NOW    = 1_700_000_000_000;
const TS     = String(Math.floor(NOW / 1000));

function sign(secret: string, id: string, ts: string, body: string): string {
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  return createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest("base64");
}

const good = sign(SECRET, ID, TS, BODY);

const base = { secret: SECRET, body: BODY, id: ID, timestamp: TS, now: NOW };

console.log("\nAccepts a correctly signed request");
check("valid signature", verifySvixSignature({ ...base, signature: `v1,${good}` }).ok);
check("valid among rotated signatures",
  verifySvixSignature({ ...base, signature: `v1,${sign(SECRET, ID, TS, "other")} v1,${good}` }).ok);

console.log("\nRejects everything else");
const cases: [string, ReturnType<typeof verifySvixSignature>][] = [
  ["no signature header",   verifySvixSignature({ ...base, signature: null })],
  ["no svix id",            verifySvixSignature({ ...base, id: null, signature: `v1,${good}` })],
  ["no timestamp",          verifySvixSignature({ ...base, timestamp: null, signature: `v1,${good}` })],
  ["garbage signature",     verifySvixSignature({ ...base, signature: "v1,not-a-signature" })],
  ["unsigned secret unset", verifySvixSignature({ ...base, secret: "", signature: `v1,${good}` })],
  ["signature for a different body",
    verifySvixSignature({ ...base, signature: `v1,${sign(SECRET, ID, TS, "tampered")}` })],
  ["signature from a different secret",
    verifySvixSignature({ ...base, signature: `v1,${sign("whsec_" + Buffer.from("wrong-key").toString("base64"), ID, TS, BODY)}` })],
  ["unknown signature version", verifySvixSignature({ ...base, signature: `v2,${good}` })],
  ["non-numeric timestamp",
    verifySvixSignature({ ...base, timestamp: "nope", signature: `v1,${good}` })],
];
for (const [name, res] of cases) check(name, res.ok === false, JSON.stringify(res));

console.log("\nReplay protection");
const oldTs  = String(Math.floor(NOW / 1000) - 10 * 60);
const oldSig = sign(SECRET, ID, oldTs, BODY);
check("valid signature replayed 10 minutes later",
  verifySvixSignature({ ...base, timestamp: oldTs, signature: `v1,${oldSig}` }).ok === false);
check("still accepted 1 minute later",
  verifySvixSignature({
    ...base,
    timestamp: String(Math.floor(NOW / 1000) - 60),
    signature: `v1,${sign(SECRET, ID, String(Math.floor(NOW / 1000) - 60), BODY)}`,
  }).ok);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);

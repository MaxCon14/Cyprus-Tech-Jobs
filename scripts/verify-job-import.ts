/**
 * Checks the normalisation guards behind the admin "import from URL" flow.
 *
 * The model's output is untrusted input, and two guarantees matter more than
 * the happy path: a salary is NEVER invented, and nothing arbitrary reaches
 * the database through a field the admin might not re-read.
 *
 *   npx tsx scripts/verify-job-import.ts
 */
import { htmlToText, extractJson, money, oneOf, normaliseDraft } from "../src/lib/job-import";
import { WORK_TYPE_LABELS } from "../src/lib/taxonomy";

const CATEGORIES = [
  { id: "cat_data", slug: "data-analyst" },
  { id: "cat_be",   slug: "backend-engineer" },
];

let failures = 0;
function check(name: string, got: unknown, want: unknown) {
  const pass = JSON.stringify(got) === JSON.stringify(want);
  if (!pass) failures++;
  console.log(`${pass ? "✓" : "✗"} ${name.padEnd(52)} ${JSON.stringify(got)}${pass ? "" : `  WANT ${JSON.stringify(want)}`}`);
}

console.log("— salary is never invented —");
check("null stays null",            money(null), null);
check("absent stays null",          money(undefined), null);
check("empty string stays null",    money(""), null);
check("zero rejected",              money(0), null);
check("negative rejected",          money(-50000), null);
check("monthly figure rejected",    money(3500), null);
check("low monthly figure rejected",  money(1800), null);
check("low but real annual kept",     money(24000), 24000);
check("absurd figure rejected",     money(50_000_000), null);
check("'competitive' rejected",     money("competitive"), null);
check("'Negotiable' rejected",      money("Negotiable"), null);
check("real figure kept",           money(65000), 65000);
check("formatted figure kept",      money("€72,500"), 72500);

console.log("\n— enums cannot be arbitrary —");
check("known value passes",         oneOf("REMOTE", WORK_TYPE_LABELS, "ON_SITE"), "REMOTE");
check("lowercase normalised",       oneOf("remote", WORK_TYPE_LABELS, "ON_SITE"), "REMOTE");
check("hyphen normalised",          oneOf("on-site", WORK_TYPE_LABELS, "ON_SITE"), "ON_SITE");
check("invented value falls back",  oneOf("FLEXIBLE", WORK_TYPE_LABELS, "ON_SITE"), "ON_SITE");
check("junk falls back",            oneOf({}, WORK_TYPE_LABELS, "ON_SITE"), "ON_SITE");

console.log("\n— category must already exist —");
check("known slug resolves to id",
  normaliseDraft({ categorySlug: "data-analyst" }, CATEGORIES).categoryId, "cat_data");
check("unknown slug is dropped",
  normaliseDraft({ categorySlug: "invented-role" }, CATEGORIES).categoryId, null);
check("unknown slug leaves no slug either",
  normaliseDraft({ categorySlug: "invented-role" }, CATEGORIES).categorySlug, null);

console.log("\n— description is sanitised —");
const xss = normaliseDraft(
  { descriptionHtml: `<p>Real role.</p><script>alert(1)</script><img src=x onerror="alert(1)">` },
  CATEGORIES,
).descriptionHtml;
const inert = !/<script|onerror|javascript:/i.test(xss);
if (!inert) failures++;
console.log(`${inert ? "✓" : "✗"} ${"script and handlers stripped".padEnd(52)} ${JSON.stringify(xss)}`);

console.log("\n— misc normalisation —");
const swapped = normaliseDraft({ salaryMin: 90000, salaryMax: 60000 }, CATEGORIES);
check("reversed range is corrected", [swapped.salaryMin, swapped.salaryMax], [60000, 90000]);
check("tags capped at 10",
  normaliseDraft({ tags: Array.from({ length: 25 }, (_, i) => `tag${i}`) }, CATEGORIES).tags.length, 10);
check("non-array tags ignored",
  normaliseDraft({ tags: "React, Node" }, CATEGORIES).tags, []);

console.log("\n— page text extraction —");
const text = htmlToText(`
  <html><head><style>.a{color:red}</style><script>var x="Senior Fake Role";</script></head>
  <body><!-- hidden --><h1>Senior Backend Engineer</h1><p>Build&nbsp;systems.</p>
  <ul><li>Go</li><li>Kubernetes</li></ul></body></html>`);
const textOk = text.includes("Senior Backend Engineer") && text.includes("Build systems")
  && !text.includes("Senior Fake Role") && !text.includes("color:red") && !text.includes("hidden");
if (!textOk) failures++;
console.log(`${textOk ? "✓" : "✗"} ${"script/style/comments excluded from prompt".padEnd(52)} ${JSON.stringify(text.slice(0, 60))}`);

console.log("\n— model output parsing —");
check("fenced JSON parsed", (extractJson('```json\n{"title":"X"}\n```') as { title: string }).title, "X");
check("JSON with prose around it parsed",
  (extractJson('Here you go:\n{"title":"Y"}\nHope that helps') as { title: string }).title, "Y");
let threw = false;
try { extractJson("no json at all"); } catch { threw = true; }
if (!threw) failures++;
console.log(`${threw ? "✓" : "✗"} ${"unparseable output throws".padEnd(52)} ${threw}`);

console.log(failures === 0 ? "\nAll job-import checks passed." : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);

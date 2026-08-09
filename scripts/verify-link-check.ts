/**
 * Checks what the apply-link checker flags, and — just as importantly — that
 * it never claims a listing is dead.
 *
 * Written after two live Bolt listings were shown in the admin panel as
 * "Broken", first from the soft-404 heuristic and then from a genuine HTTP
 * 404 that Bolt's edge serves to automated clients while showing a browser the
 * real page. The second round is why there is no "broken" verdict left: a
 * status code from a datacenter cannot tell those two situations apart.
 * Serves fixture pages from a local HTTP server so the whole path runs —
 * status handling, redirects and HTML parsing — not just the regex.
 *
 *   npx tsx scripts/verify-link-check.ts
 */
import { createServer, type Server } from "node:http";
import { checkApplyUrl } from "../src/lib/link-check";

const OK_JOB_BODY = `
  <h1>Courier Operations Manager</h1>
  <h2>About the role</h2>
  <p>Own the courier operations funnel in Cyprus.</p>
  <button>Apply now</button>
`;

interface Fixture { status: number; body: string }

const FIXTURES: Record<string, Fixture> = {
  /* Status codes worth flagging — worth a look, not proof of anything. */
  "/gone-404": { status: 404, body: "<title>Not found</title><h1>Not found</h1>" },
  "/gone-410": { status: 410, body: "<title>Gone</title><h1>Gone</h1>" },

  /* A real soft 404 — the Exness case this feature exists for. */
  "/soft-404": {
    status: 200,
    body: `<title>404 | Careers</title><h1>Not found</h1>
           <p>Looks like the page does not exist or has been moved.</p>`,
  },

  /* A live job on a client-rendered careers site whose serialised state
     inlines its own error-page markup BEFORE the document's real title.
     Tag extraction takes the first match, so without stripping scripts the
     checker reads the bundle's <title> instead of the page's and calls a live
     listing dead on the strength of a string no visitor ever sees. */
  "/live-spa-bundling-its-error-copy": {
    status: 200,
    body: `<script id="__NEXT_DATA__" type="application/json">
        {"routes":{"/404":{"markup":"<title>404 Not Found</title><h1>Page not found</h1>"}}}
      </script>
      <title>Courier Operations Manager | Careers</title>
      ${OK_JOB_BODY}`,
  },

  /* A live job whose h2 is an innocent section heading containing the words.
     h2 used to be scanned, which made this a false positive. */
  "/live-with-innocent-h2": {
    status: 200,
    body: `<title>CS Operations Agent</title>
           <h1>CS Operations Agent</h1>
           <h2>Not found what you were looking for? See all roles</h2>
           <p>Support our riders across Cyprus.</p>`,
  },

  /* A live job with the phrase only inside a comment or styles. */
  "/live-with-comment": {
    status: 200,
    body: `<!-- 404 fallback template lives in layout.tsx -->
           <style>.error-404 { display: none; }</style>
           <title>Data Analyst</title>${OK_JOB_BODY}`,
  },

  /* Plain healthy page. */
  "/live-plain": { status: 200, body: `<title>Data Analyst | Careers</title>${OK_JOB_BODY}` },

  /* Inconclusive responses must never be flagged. */
  "/blocked-403":  { status: 403, body: "<title>Access denied</title>" },
  "/error-500":    { status: 500, body: "<title>Server error</title>" },
};

const CASES: Array<[path: string, flagged: boolean, reason: string, why: string]> = [
  ["/gone-404", true,  "http-404", "a 404 is worth a look"],
  ["/gone-410", true,  "http-410", "a 410 is worth a look"],
  ["/soft-404", true,  "soft-404", "wording that reads as not-found is worth a look"],
  ["/live-spa-bundling-its-error-copy", false, "none",
    "error copy inside <script> must not flag a live job"],
  ["/live-with-innocent-h2", false, "none",
    "an h2 section heading must not flag a live job"],
  ["/live-with-comment", false, "none",
    "comments and CSS must not flag a live job"],
  ["/live-plain",  false, "none", "healthy page is clean"],
  ["/blocked-403", false, "none", "403 is inconclusive, not dead"],
  ["/error-500",   false, "none", "5xx is inconclusive, not dead"],
];

async function main() {
  const server: Server = createServer((req, res) => {
    const fixture = FIXTURES[req.url ?? ""];
    if (!fixture) { res.writeHead(404).end("no fixture"); return; }
    res.writeHead(fixture.status, { "Content-Type": "text/html" });
    res.end(`<!doctype html><html><head></head><body>${fixture.body}</body></html>`);
  });

  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as { port: number };

  let failures = 0;
  for (const [path, flagged, reason, why] of CASES) {
    const got  = await checkApplyUrl(`http://127.0.0.1:${port}${path}`);
    const pass = got.flagged === flagged && (got.reason ?? "none") === reason;
    if (!pass) failures++;
    console.log(
      `${pass ? "✓" : "✗"} ${path.padEnd(36)} flagged=${got.flagged} reason=${got.reason ?? "none"}` +
      `${pass ? "" : `  EXPECTED flagged=${flagged} reason=${reason}  (${why})`}`
    );
  }

  /* The Bolt case: a live listing behind a stealth block that answers our
     server 404. Indistinguishable here from a retired posting — which is the
     whole reason no caller may treat this as proof the job is gone. */
  {
    const got = await checkApplyUrl(`http://127.0.0.1:${port}/gone-404`);
    const ok  = got.flagged && !("broken" in got);
    if (!ok) failures++;
    console.log(`${ok ? "✓" : "✗"} ${"(no 'broken' verdict exists)".padEnd(36)} result keys: ${Object.keys(got).join(",")}`);
  }

  /* An unreachable host is inconclusive, not dead — closing the server first
     is the cheapest way to exercise the catch branch. */
  await new Promise<void>(resolve => server.close(() => resolve()));
  const unreachable = await checkApplyUrl(`http://127.0.0.1:${port}/live-plain`);
  const unreachableOk = !unreachable.flagged;
  if (!unreachableOk) failures++;
  console.log(`${unreachableOk ? "✓" : "✗"} ${"(unreachable host)".padEnd(36)} flagged=${unreachable.flagged}`);

  console.log(failures === 0 ? "\nAll link-check cases passed." : `\n${failures} case(s) FAILED.`);
  process.exit(failures === 0 ? 0 : 1);
}

main();

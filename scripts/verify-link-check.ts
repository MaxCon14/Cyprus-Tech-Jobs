/**
 * Checks that the apply-link checker only calls a listing dead when the server
 * says so, and that its soft-404 heuristic does not fire on live pages.
 *
 * Written after two live Bolt listings were shown in the admin panel as
 * definitively "Broken" while both pages were open and fine in a browser.
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
  /* Authoritative dead links. */
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

type Expected = { broken: boolean; suspect: boolean };

const CASES: Array<[path: string, expected: Expected, why: string]> = [
  ["/gone-404", { broken: true,  suspect: false }, "a real 404 is authoritative"],
  ["/gone-410", { broken: true,  suspect: false }, "a real 410 is authoritative"],
  ["/soft-404", { broken: false, suspect: true  }, "soft 404 is a suspicion, never 'broken'"],
  ["/live-spa-bundling-its-error-copy", { broken: false, suspect: false },
    "error copy inside <script> must not flag a live job"],
  ["/live-with-innocent-h2", { broken: false, suspect: false },
    "an h2 section heading must not flag a live job"],
  ["/live-with-comment", { broken: false, suspect: false },
    "comments and CSS must not flag a live job"],
  ["/live-plain",  { broken: false, suspect: false }, "healthy page is clean"],
  ["/blocked-403", { broken: false, suspect: false }, "403 is inconclusive, not dead"],
  ["/error-500",   { broken: false, suspect: false }, "5xx is inconclusive, not dead"],
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
  for (const [path, expected, why] of CASES) {
    const got = await checkApplyUrl(`http://127.0.0.1:${port}${path}`);
    const pass = got.broken === expected.broken && got.suspect === expected.suspect;
    if (!pass) failures++;
    console.log(
      `${pass ? "✓" : "✗"} ${path.padEnd(36)} broken=${got.broken} suspect=${got.suspect} ` +
      `reason=${got.reason ?? "none"}${pass ? "" : `  EXPECTED broken=${expected.broken} suspect=${expected.suspect}  (${why})`}`
    );
  }

  /* An unreachable host is inconclusive, not dead — closing the server first
     is the cheapest way to exercise the catch branch. */
  await new Promise<void>(resolve => server.close(() => resolve()));
  const unreachable = await checkApplyUrl(`http://127.0.0.1:${port}/live-plain`);
  const unreachableOk = !unreachable.broken && !unreachable.suspect;
  if (!unreachableOk) failures++;
  console.log(`${unreachableOk ? "✓" : "✗"} ${"(unreachable host)".padEnd(36)} broken=${unreachable.broken} suspect=${unreachable.suspect}`);

  console.log(failures === 0 ? "\nAll link-check cases passed." : `\n${failures} case(s) FAILED.`);
  process.exit(failures === 0 ? 0 : 1);
}

main();

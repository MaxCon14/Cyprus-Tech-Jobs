# Project Context — CyprusTech.Careers

A running handoff of how the project is set up, what recent sessions changed, and
what's still open. Read this first if you're picking up the project in a new chat.

---

## Branches & production

- **`main` is the source of truth and the production branch.** Every push to
  `main` auto-deploys to production (`cyprustech.careers`) in about 90 seconds.
  No manual promote step.
- **`test` is the staging branch.** Same content as `main`, but it only ever
  builds preview deployments and can never reach production. Stable preview URL:
  `https://cyprus-tech-jobs-git-test-maximconstantinou14-2429s-projects.vercel.app`
- Vercel **Settings → Environments → Production → Branch Tracking** is set to
  `main` (this is *not* under Settings → Git any more). "Auto-assign Custom
  Production Domains" is enabled, which keeps the domains attached to each new
  production deploy.
- Full workflow — which branch to use when, how to keep `test` level with `main`,
  how to release — lives in **`AGENTS.md`**, which every Claude session loads
  automatically via `CLAUDE.md`.

**Golden rule for new work: commit to `test`. `main` moves only when Maxim
explicitly asks to release.** There are no working branches — `test` *is* the
working branch, and it stays ahead of `main` between releases. Release is a
fast-forward of `main` to `test`, never the other way round.

### History — why this section used to say the opposite

Production previously tracked a stale `claude/*` branch while all real work
happened on another, so every release had to be promoted by hand in the Vercel
dashboard. That caused an incident: a chat branched off stale `main`
(`claude/compact-card-layout-92qmqy`) and promoted it, rolling production back
~43 commits and restoring the broken magic-link login. Resolved by promoting the
correct build, fast-forwarding `main`, and pointing Branch Tracking at `main`.
All `claude/*` branches have been retired; the repo is now `main` + `test` only.
Before they went, each was checked against `main`:
`claude/connect-database-7OQd6`, `claude/connect-database-MZ1XL` and
`claude/cyprus-tech-jobs-context-elmi9o` were fully contained in `main`, and
`claude/analyze-design-system-Y5y44` held one obsolete commit (it removed
`onClick` handlers from a homepage server component; `main`'s `page.tsx` has
none left).

`claude/compact-card-layout-92qmqy` (`a4a37fa`) is **superseded, not lost**.
It is a class-based implementation of "collapse applicant cards to a compact
row", but `main` already ships that feature by a different route: `21df633`
*feat(applicants): collapse cards to a compact triage row by default*, refined
by `5d50e88` (remove the initial-letter avatar) and `b48845e` (remove the pink
left spine). `main`'s version is inline-styled and shares only the
`.applicant-quick` / `.applicant-time` class names with the branch, so grepping
`main` for `.applicant-card` gives a false negative — the feature is there.

Merging `a4a37fa` now would **regress** both refinements, since it reinstates
the `.applicant-avatar` initial-letter badge that `5d50e88` deliberately
removed. Don't cherry-pick it.

Note the `@media (max-width: 560px)` block in `globals.css` hiding
`.applicant-quick` / `.applicant-time` is **live CSS**, not a leftover —
`ApplicationsPanel.tsx` uses both class names.

Note the sandbox git proxy rejects **deletes and tag pushes** (403) while
allowing branch creates and updates, so branch cleanup and tagging have to be
done from a real machine or the GitHub UI.

A later session was configured (by its harness prompt, not by Maxim) to develop
on a branch `claude/cyprus-tech-jobs-repo-s9ar6h`. That contradicts the
`test`-only rule, so the work went to `test`/`main` per `AGENTS.md` instead — but
the branch got created on GitHub along the way and its commits are fully
contained in `main`. It is a **sixth stale `claude/*` branch to delete** (added
to the TODO list). If a future session gets the same branch instruction, follow
`AGENTS.md` (commit to `test`), not the branch name.

**This keeps happening — the count is now eight, not six.** `git ls-remote` shows
two more that no TODO entry ever mentioned: `claude/context-md-review-8yvpxp` and
`claude/cyprus-tech-jobs-context-nrt0cp`. Sessions opened from the web UI appear
to be handed a generated `claude/<topic>-<hash>` branch by their harness prompt
regardless of what `AGENTS.md` says, and the branch gets created on GitHub as a
side effect even when the work correctly goes to `test`. Treat the branch name in
a harness prompt as noise; the rule is `test`. When cleaning up, enumerate the
real remote rather than trusting this list — it goes stale by exactly this
mechanism.

---

## Stack & conventions

- **Next.js 16.2.4** (App Router, Turbopack). ⚠️ Unusual pinned version — read
  `node_modules/next/dist/docs/` before writing Next code (per AGENTS.md).
  Gotchas found the hard way: `next build --no-lint` does **not** exist; folders
  prefixed with `_` are private and won't route.
- **Prisma 7 + `@prisma/adapter-pg`**, Postgres on **Supabase** (`eu-west-1`,
  Ireland). Client in `src/lib/prisma.ts`.
- **Supabase Auth** — every sign-in is an **8-digit OTP code**
  (`src/components/ui/OtpCodeInput.tsx`). Entry points: `/login` (shared by
  candidates and employers — `/employers/login` just redirects to it),
  `/admin/login`, and both onboarding wizards. Magic links are fully retired.
- **Resend** for transactional email; also configured as Supabase Auth's custom
  SMTP.
- **Stripe** for listing-slot purchases.
- **The `categories` table is the only source of truth for the job taxonomy.**
  The nav, the homepage grid and the candidate category pickers all read it —
  none of them may carry a hardcoded list again. Enum labels (employment type,
  work type, experience) live once in `src/lib/taxonomy.ts`; the cached nav tree
  is `getNavCategories` in `src/lib/queries.ts`, invalidated by
  `revalidateTag(CATEGORY_CACHE_TAG, "max")` from the admin category routes.
  Routes that store a job **look a category slug up and 422 on an unknown one**
  — they must never upsert, or the job lands under a parentless category that no
  page links to.
- **Two data-access worlds.** Jobs, companies, employers, categories and tags are
  Prisma. Candidates, applications, saved/applied jobs and positions are *not in
  the Prisma schema at all* — they are reached through `supabaseAdmin` (service
  role, bypasses RLS). Expect to use both in one file.
- Design tokens in `src/app/globals.css` — pink `--accent` `#FF3D7F`, Figtree
  sans, Fragment Mono. **Dark mode is `[data-theme="dark"]` on the root element,
  not `prefers-color-scheme`.**
- **Job descriptions are HTML and must go through `sanitizeJobHtml`**
  (`src/lib/sanitize.ts`, allowlist, no attributes) on every write *and* at
  render. Anything embedded in a `<script type="application/ld+json">` goes
  through `jsonLd()` in `src/lib/schema.ts` — `JSON.stringify` alone does not
  escape `<`, so a job title containing `</script>` breaks out of the tag.
- **Public endpoints get a rate limit.** `src/lib/rate-limit.ts` +
  the `rate_limits` table and `consume_rate_limit()` RPC. Counters are in
  Postgres because serverless instances share no memory; it fails open.
- **Scheduled routes use `authoriseCron`** (`src/lib/cron-auth.ts`). Never inline
  the secret comparison: with `CRON_SECRET` unset the old inline check compared
  against the literal string `"Bearer undefined"` and let anyone in. There are
  **two** cron routes (`expire-jobs`, `send-alerts`), both `GET`, both wired in
  `vercel.json`; `CRON_SECRET` is confirmed set in Vercel (they now fail *closed*
  with 503 if it is missing).
- Styling is mostly inline styles reading CSS custom properties; responsive
  helpers are classes in `globals.css` (`.page-container`, `.grid-4`,
  `.section-head`, `.cta-strip`, …).
- **`/style-guide`** renders the whole design system live from those tokens —
  colour ramps, type scale, buttons, radii, elevation. It's `noindex` plus a
  robots.txt disallow. Check it before hand-picking a token.

---

## External services / env

`.env` keys: `DATABASE_URL` (Supabase pooler, port 6543),
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`,
`NEXT_PUBLIC_APP_URL`, `ADMIN_EMAIL`, `CRON_SECRET`, and Stripe keys
(`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_STANDARD_PRICE_ID`,
`STRIPE_FEATURED_PRICE_ID`).

- **MCP connectors DO work from the sandbox** (Supabase, Resend, Vercel, Stripe,
  Figma, GitHub). An earlier version of this file said they didn't — that was
  wrong. They were used this session to read Supabase auth logs, Resend delivery
  history, and Vercel deployments. What is *not* available: any Vercel **DNS
  write** tool, and `gh` CLI. Direct `curl` to `cyprustech.careers` is blocked by
  the egress proxy — use the Vercel MCP fetch tool instead. DNS lookups work via
  Python `dnspython` (no `dig`/`nslookup` installed).
- **Email — sending** goes through Resend (domain verified, region `eu-west-1`).
  Sign-in codes, job alerts and contact mail all send out via Resend and were
  confirmed against its delivery log. **Sending is unaffected by any of the MX
  changes below** — MX only controls incoming mail.
- **Email — receiving now goes to Google Workspace, and this is resolved.**
  History: the domain's MX record used to point at Resend inbound
  (`inbound-smtp.eu-west-1.amazonaws.com`), so mail to `hello@cyprustech.careers`
  landed in Resend's inbound store and nowhere else — which is why "admin sign-in
  has never worked" sat open for weeks (the code was arriving in Resend, not any
  inbox Maxim reads). Maxim already paid for Google Workspace on the domain; the
  setup had just never been finished. Fixed this session by pointing DNS at
  Google (DNS is hosted at **Vercel** → Domains → cyprustech.careers → DNS):
  - `MX @ 1 smtp.google.com` (replaced the Resend inbound MX)
  - `TXT google._domainkey` — Google DKIM, generated in Admin console → Apps →
    Gmail → Authenticate email. Verified from the sandbox as a complete 2048-bit
    RSA key (parsed with openssl; a truncated paste is the usual silent failure).
  - `TXT @  v=spf1 include:_spf.google.com include:amazonses.com ~all` — note it
    authorises **both** Google (mail Maxim sends from hello@) and Amazon SES (the
    site's Resend mail). Uses 2 of the 10 permitted SPF lookups.
  - `TXT _dmarc  v=DMARC1; p=none; rua=mailto:hello@cyprustech.careers` — DMARC
    was previously **absent entirely**, a real deliverability gap (Gmail/Yahoo
    have required it of senders since Feb 2024). `p=none` is monitor-only.
  **Confirmed working end to end:** an admin sign-in code was received in the
  `hello@cyprustech.careers` Gmail inbox — the first successful admin sign-in
  path on the project. `ADMIN_EMAIL` stays `hello@` (unchanged).
  - Consequence: the ~11 messages already in Resend's inbound store (old admin
    codes, Instagram codes, Medium newsletters) stay there; they do not migrate.
  - A **Resend inbound-forwarding webhook** route was built this session
    (`/api/resend/inbound` + `src/lib/svix-verify.ts`) and then **reverted** once
    the Google MX change made it unnecessary. It is recoverable from git history
    (`git show 5cebb94`) if inbound ever moves back to Resend; it verifies the
    Svix signature with node crypto rather than the `svix` package.
  - `CONTACT_EMAIL` in `src/lib/legal.ts` is `help@` — a different address the
    legal pages publish, so it also has to receive. Not separately verified.
  - Old note kept for the record: mail to `@avocadots.com` is accepted by its
    Microsoft 365 server but not reaching the inbox; Gmail works. Left as-is at
    Maxim's request.
- **Stripe is LIVE (real payments) — switched this session, confirmed working.**
  Checkout builds prices **inline** with `price_data` in
  `api/stripe/checkout/route.ts` (999¢/1499¢ base + per-extra-slot pricing) — there
  are **no Stripe Price IDs anywhere in the code**, so the old
  `STRIPE_STANDARD_PRICE_ID` / `STRIPE_FEATURED_PRICE_ID` env vars referenced
  elsewhere in this file are **dead, not used**. `getStripe()` (`src/lib/stripe.ts`)
  is mode-agnostic — it just reads `STRIPE_SECRET_KEY`, so going live was a Vercel
  env-var change, not a code change: `STRIPE_SECRET_KEY` → `sk_live_…`,
  `STRIPE_WEBHOOK_SECRET` → a **new live-mode** webhook endpoint's `whsec_…`
  (`https://cyprustech.careers/api/stripe/webhook`, event
  `checkout.session.completed`) — the old test-mode webhook secret does not carry
  over. **Verified end to end with a real card**: production log showed
  `POST /api/stripe/webhook 200` → `session cs_live_… : credited`. Employers buy
  "slots" (`standardSlots` / `featuredSlots` on `Employer`); the webhook credits
  them via `src/lib/stripe-fulfill.ts`, with `SlotPurchase` as the idempotency log
  (`sessionId` unique — safe against Stripe's at-least-once delivery).
  Account: `acct_1TUCKmRupFe5vg1G` ("Cyprus Tech Careers"). Test-mode keys should
  stay on Vercel's Preview/Development environments so preview deploys never take
  real money — only Production got the live keys.
- **Google Analytics 4 — `G-MGNJW82FYC`, live, gated behind cookie consent.**
  The measurement ID is hardcoded in `src/components/analytics/GoogleAnalytics.tsx`
  (not an env var). gtag.js loads for everyone, but **Consent Mode v2 defaults
  every signal to `denied`** in a `beforeInteractive` inline script that runs
  before gtag.js, so nothing is stored until the visitor accepts. See the session
  section below for the duplication hazard between that inline script and
  `src/lib/consent.ts`.

---

## Performance

- FCP/LCP were ~3.09s while INP/CLS/FID were excellent → a **TTFB** problem.
  Root cause: DB in Ireland but Vercel functions defaulting to `iad1` (US-East).
- **Fixed and confirmed live.** `vercel.json` pins `"regions": ["dub1"]`.
  Verification trick: the `x-vercel-id` response header's third segment is the
  compute region — it now reads `iad1:iad1::dub1::…` (was `…::iad1::…`).
- Also done previously: explicit `select` in `getJobs`, parallelized category
  counts, `JobCard`/`SkillTag` server-side so the ~300-entry skill-icon map stays
  off the client.

---

## SEO

A full audit against a job-board SEO checklist found most of it **already
implemented**: JobPosting JSON-LD, schema stripped from non-active listings,
`noindex` on closed jobs, canonicals, Breadcrumb/Organization/WebSite/FAQ/Article
schema, a DB-driven sitemap, `robots.ts`, a daily expiry cron, city pages,
company pages, and a **Google Indexing API** integration (`URL_UPDATED` on
publish/edit, `URL_DELETED` on expire/pause/delete).

**Fixed this session:**
- JobPosting JSON-LD was gated on `job.applyUrl`, which is only set for
  `applyType: "URL"` — so every `EMAIL` and `IN_APP` listing emitted no
  structured data and could never appear in Google for Jobs. Now gated on a
  named `hiringOrganization` instead, which is what Google actually requires.
- Hybrid roles were marked `jobLocationType: TELECOMMUTE`. That value is for
  fully remote work only, so hybrid jobs were surfacing in remote searches.
  Hybrid now keeps `jobLocation` and omits `jobLocationType`.

**Deliberately not changed** (each was checked and rejected for a reason):
- `directApply: false` is **correct** — Google requires `false` when the seeker
  must create an account, and in-app apply needs a signed-in candidate.
- `applicantLocationRequirements: Cyprus` on remote roles can't be improved
  without a new employer-supplied field; Google requires the property whenever
  `jobLocationType` is TELECOMMUTE.
- `unitText: "YEAR"` on `baseSalary` is hardcoded; there's no `salaryPeriod`
  column. Fixing it needs a schema migration plus a form field.

**Category landing pages added this session — was the biggest gap, now closed.**
Categories used to be reachable only as `?category=slug` query params, which
Google indexes poorly (often folded in as duplicates of `/jobs`) and which had no
unique title/H1/canonical/sitemap entry. New route `src/app/jobs/category/[slug]`
+ `src/app/jobs/_shared/CategoryPage.tsx`: per-category `generateMetadata`
(keyword title, description, canonical), H1 + unique intro copy, the filtered job
list, Breadcrumb + ItemList JSON-LD, related-role and category×city internal
links. All ~130 categories (parents + roles) are now in the sitemap. Homepage
grid/chips and the nav menu were repointed from `?category=` to these pretty
URLs so link equity flows to the landing pages instead of a dead end. Verified
live on production (`/jobs/category/customer-support`): correct title/canonical,
ItemList + BreadcrumbList schema present.

**City pages enriched.** Added ItemList JSON-LD and a dynamic, city-specific FAQ
(visible content + FAQPage schema, live job count + realistic salary range baked
into the copy) to `CityPage.tsx` for content depth.

**Found and fixed while verifying the above: every city page (and the new
category pages) had a doubled `<title>` suffix** —
`"… | CyprusTech.Careers | CyprusTech.Careers"`. The root layout
(`src/app/layout.tsx`) already applies a `title.template: "%s | CyprusTech.Careers"`,
but each city route's `metadata.title` *also* hard-coded the suffix. Caught by
actually fetching the rendered `<title>` from the live preview, not by reading
the code — the bug was invisible in the source, each half looked correct in
isolation. Stripped the manual suffix from all five city routes and the new
category route.

**`/jobs/famagusta` is a redirect, not a page** (`redirect("/jobs")`,
`src/app/jobs/famagusta/page.tsx`) — it was briefly added to the sitemap this
session and then reverted; a sitemap should not list redirect URLs.

**Job-type landing pages added since, and category-page filters restored — see
the "SEO landing pages + GEO" session below.** `/jobs/type/<slug>` now exists
for the five employment types (indexable, canonical, schema-carrying), and the
category pages — which had regressed to a row of "ROLES:" tag chips — got their
real `FilterBar` back.

**Still open:** `export const dynamic = "force-dynamic"` on job pages means no
ISR; no `hreflang` for `el-CY`/`en-CY`; robots doesn't disallow filter query
params (low risk — filtered views canonicalise to the base page).

**Closed since:** empty category/city/job-type landing pages are no longer
submitted or indexable — see the soft-404 session below, which is also the
answer to any future "Discovered – currently not indexed" mail.

**Closed since** (see the "title/robots/GfJ + role×city" session below): role×city
"money pages" now exist as dedicated indexable pages (`/jobs/category/<slug>/<city>`);
the two test company records are gone from the sitemap (`getCompanySlugs` now
requires an active job).

**Deliberately not done — a 410 for expired listings.** The current handling
(200 + `noindex` + JobPosting schema removed + "Closed" label) is a
Google-compliant way to retire a posting, it's better UX than a dead 410 (the
candidate lands on a "browse similar" page), the Indexing API already pings
`URL_DELETED` on expiry, and the App Router can't cleanly return a 410 *with*
rendered content. Left as-is on purpose, not an oversight.

---

## What recent sessions changed

**Deploy pipeline** — production restored after the rollback incident; `main`
fast-forwarded to carry all work; Branch Tracking repointed to `main`; `test`
branch created; workflow written into `AGENTS.md`.

**Homepage** — category icons were emoji (`⌨️ ⚙️ ☁️ …`), which render as each
OS's own colourful glyphs and clashed with the UI. Replaced with lucide line
icons in contained tiles. The "All jobs" button was crushed against the heading
below 640px; it now drops to its own full-width row via `.section-head`.

**Candidate CTA** — the block read as off-centre because the feature bullets
carried `textAlign: "left"`. Bullets became a 2×2 tile grid
(`repeat(auto-fit, minmax(210px, 1fr))`, collapses to one column), leading dot
icons removed — an icon column creates a second axis that fights centred text.
The "Browse jobs without an account" link was removed as it led away from the
one action the section exists to drive; its `.link-subtle-hover` CSS went too.

**Admin login** — was still the deprecated magic-link flow (`emailRedirectTo`,
then a "check your inbox" screen with nowhere to enter anything) while Supabase
now sends codes. Rebuilt on the same 8-digit flow as everything else, with a
resend cooldown. Authorisation is unchanged: `src/proxy.ts` gates `/admin` on the
session email matching `ADMIN_EMAIL`.

**Employer signup copy** — nothing ever restricted employers to company email
domains (validation is a plain format regex everywhere), but the field was
labelled "Work email" with an `alex@company.com` placeholder, which read as a
rule. Relabelled to "Email" with a neutral placeholder.

**Company description + mandatory salary** —
- The post-a-job form already pre-filled the company blurb from the company
  record, but onboarding treated the description as optional, so it was often
  empty. Step 3 now requires it (≥40 chars), enforced in the wizard *and* the
  onboarding API.
- Salary ranges are now mandatory (EU Pay Transparency Directive). The
  show/hide toggle is gone from both the post and edit forms — removing it from
  the edit form matters equally, or an employer could publish a range then
  quietly withdraw it. **Three routes can put a job in front of candidates**
  (`api/jobs/post`, `api/jobs/[id]/publish`, `api/jobs/[id]` PATCH); all three
  now validate through `validateSalaryRange` in `src/lib/utils.ts`. Drafts stay
  permissive (incomplete by definition; the publish gate enforces). The **admin**
  job form keeps its toggle, since curated listings don't always carry a salary.
  A warning under the inputs states a fake range can get the listing taken down
  with the credit refunded.

**Style guide** — `/style-guide` added (see Stack & conventions).

---

## Session: filters, security, guest applications

**Filtering was broken in three ways and is now DB-driven end to end.**
A published full-time job appeared under neither the Full-time menu nor its
category. Causes: one `type` param was doing double duty for work type *and*
employment type, so "full-time" was searched against the remote column; and
`/api/jobs/post` **upserted** categories, so a form posting a retired slug minted
a parentless category named after its own slug — invisible under every parent
page. One live listing was sitting in exactly that state (`design-ux`) and was
re-pointed to `uiux-designer`. All four job-writing routes now resolve the slug
and 422 on an unknown one, and the nav/homepage/candidate pickers read the
database (they had been missing Finance & Trading, Full Stack and Management
entirely, and disagreed with each other on names). Skill filtering (`?skill=`)
was added, along with a Job type control the filter panel never had.

**Skills were being silently dropped on save.** Every write path linked tags
with `findMany({ name: { in: names } })` and ignored what came back empty — the
picker offers 261 skills, the table held 119, so 160 of them (Blender, Unity,
Photoshop, PyTorch…) saved as nothing. `linkJobTags` (`src/lib/job-tags.ts`) now
creates what is missing; the picker is a closed list so nothing arbitrary gets
in. Slugs are lossy (`C#` and `C++` both reduce to `c`), so collisions take a
numeric suffix.

**Search never matched curated jobs** — they have no `Company` row, so
`curatedCompanyName` had to be added to the search predicate. That is every job
an admin adds by hand.

**Stored XSS, fixed.** Job descriptions are authored as HTML and rendered with
`dangerouslySetInnerHTML` with no sanitiser anywhere in the project — any
employer could run script on the site for every visitor of their listing.
Verifying the fix exposed a second live route to the same thing: schema blocks
embedded `JSON.stringify` output straight into a `<script>` tag, so a job title
of `Dev</script><img src=x onerror=…>` closed the block and executed. Confirmed
executing in a browser before the fix. Both closed; see Stack & conventions.

**A live data leak, fixed.** The `applied_jobs` RLS policy was named
`candidates_read_own_applied_jobs` but its condition was `USING (true)` — anyone
holding the anon key (which ships in the JS bundle) could read which candidate
applied to which job. Replaced with the ownership check the other candidate
tables use. Every other private table was already correct.

**Guest applications.** Job seekers can apply to in-app listings without an
account (link-out listings never required one). A guest gets a candidate row with
`emailVerified: false`; nothing else changed, because the employer dashboard
resolves applicants through `candidateId` and candidate rows are looked up by
email everywhere — so signing up later lands on the row you already have. An
address belonging to a **verified** account is refused with a prompt to sign in,
otherwise a stranger could attach an application to someone else's profile.
Applying never subscribes anyone: alert emails come only from `job_alerts` rows
and the guest route creates none.

**Retention: employers keep applications indefinitely.** A 30-day purge of guest
data was built and then deliberately reversed — employers revisit earlier
applicants when a similar role opens. `expire-jobs` only moves a job to
`EXPIRED`; no read path filters on status, so applicants survive expiry, pausing
and closing. `scripts/verify-employer-access.ts` pins that down. The privacy
policy was updated to match — the previous wording promised 30-day deletion,
which would have been untrue the moment this shipped. **Open question flagged to
Maxim:** indefinite retention of CVs from people who never registered is the
hard part to defend under GDPR storage limitation; ~24 months from last
application is the usual ATS compromise and costs employers nothing real.

**Mobile filters collapse.** The sidebar took a screenful above the first result
and could not be closed. A collapsible version existed in `FiltersPanel.tsx` but
nothing ever imported it — the collapse now lives in `FilterBar` itself. Also
unsticks it: `.layout-sidebar-left` is not covered by the 768px rule that
flattens the other sidebars, so it kept `position: sticky` and
`max-height: calc(100vh - 48px)` on phones. 686px → 50px collapsed.

**Legal pages can name an individual.** `LEGAL_ENTITY` could only describe a
company, so with none the pages named the *website* as data controller — and a
trading name is not a legal person. It now carries a `type`; as an individual the
pages read "<name>, trading as CyprusTech.Careers". **Still blank** — see TODO.

**Verification scripts** live in `scripts/` and run against a scratch Postgres
(see Working agreements): `verify-taxonomy.ts` (20 checks that a newly posted job
is findable by every filter), `verify-sanitize.ts` (25 XSS payload/passthrough
cases), `verify-employer-access.ts` (applicants survive every job status).
Added since: `verify-logo-upload.ts` (byte-sniff upload validation),
`verify-svix.ts` (webhook signature guard — kept even though the route it
covered was reverted, since the helper `src/lib/svix-verify.ts` also went).

---

## Session: employer dashboard, email delivery, onboarding trim

**Employer applicant filter was broken (live on `main`).** Picking a job updated
the count and the "Filtered:" chip but not the list — `ApplicationsPanel` took
the filtered rows via `useState(initialApplications)`, and a state initialiser
only runs on mount, so the rows never changed. Reproduced on the old code before
touching it (chip said "Filtered: X" while all applicants stayed on screen).
Fix: applications now live in `DashboardContent`, and the panel derives both
filters from props — nothing copied into state. Same bug had a second face: a
status set on a candidate was discarded whenever the filter remounted the list;
gone too. Added an explicit **Position picker** (`Select`) listing every job that
can receive applicants with counts — filtering was previously only reachable by
clicking a listings-table row, which nothing advertised; the two stay in sync.
Mobile rebuild of the panel: header wraps instead of colliding, job-row actions
became a labelled full-width row (were four unreadable crushed icons), status
tabs a 3-across grid, applicant count surfaced on job rows (the column is
desktop-only), 40px tap targets, and picking a job scrolls the panel into view
clear of the 61px sticky header. `DashboardContent.tsx` / `ApplicationsPanel.tsx`
/ `JobListingsPanel.tsx` / `JobVisibilityToggle.tsx` + `globals.css`.

**Admin login stopped naming the admin (live on `main`).** The email input's
`placeholder` was literally `hello@cyprustech.careers`, printing the admin
address to every visitor — the one thing `api/admin/auth/request-code` goes out
of its way NOT to disclose (it returns an identical 200 for any address). The
code step also echoed whatever was typed, claiming a delivery that never
happened (a code is only ever sent to `ADMIN_EMAIL`). Both removed. The gate is
unchanged and server-side (`ADMIN_EMAIL`, checked in `proxy.ts`,
`admin/layout.tsx`, `admin-auth.ts`) — deliberately not hardcoded client-side,
which would re-leak it into the bundle.

**Email delivery + admin sign-in — see External services.** The headline is that
`hello@` receiving moved from Resend to Google Workspace and admin sign-in now
works end to end.

**Minimum-salary step removed from candidate onboarding (on `test`, commit
`6072314`).** The field was write-only — its own helper text said "Shown to you
only — not shared with employers", and nothing read it back (employers never see
it; job alerts match on the separate value from the alert form). Removed from the
wizard step, the persisted draft, the wizard-state type (`onboarding-types.ts`)
and the onboarding API. The `candidates.salaryMin` column and the profile editor
were left alone — no migration implied, existing values kept. The **adjacent
"kind of work" step is deliberately kept**: unlike salary, `categories` and
`remoteType` are read by `getMatchingJobsForCandidate` to build the matching-jobs
list on the candidate dashboard (verified by tracing `candidates/dashboard/page.tsx`).

**CRON_SECRET confirmed set in Vercel.** Probed production
`/api/cron/expire-jobs` unauthenticated → `401` (would be `503` if the var were
missing). The `x-vercel-id` header also still shows `dub1`, so the region pin
holds.

**KNOWN BUG, not yet fixed — position-picker dropdown paints behind the applicant
card.** On the employer dashboard, opening the `Select` position filter renders
its dropdown panel (`z-index: 200` in `src/components/ui/Select.tsx`) *under* the
first `ApplicationCard` below it, clipping the last option. A stacking-context
issue. Was mid-diagnosis (reproduced via the preview harness) when work switched
to this file. The dropdown's `z-index` lives on an absolutely-positioned panel
whose `Select` root is `position: relative` with no `z-index` (so no stacking
context of its own); the fix will likely be to establish/raise the right context
or render the panel above the card. Reproduce before claiming fixed.

---

## Session: broad taxonomy + searchable category picker

**The category picker is now one searchable box, not two cascading dropdowns.**
Posting a job used to mean picking a broad parent category, then a subcategory —
so to file a role you first had to guess its parent ("Company Secretary" lives
under "Legal & Corporate", which is not obvious). New component
`src/components/ui/CategoryCombobox.tsx` flattens the whole tree (parents *and*
the roles beneath them) into one type-to-filter list; typing "company secretary",
"fincrime" or "head of product" surfaces the exact role regardless of parent.
Picking a role submits that role's value; picking a broad parent submits the
parent — both are values the job APIs already accept, so nothing downstream
changed. It replaced the cascading `Select` pair in all three job forms:
`post-a-job/PostJobForm.tsx` (employer), `employers/jobs/[id]/edit/EditJobForm.tsx`
(employer edit), and `admin/_components/AdminJobForm.tsx` (admin — value-agnostic,
so it feeds slugs for employers and ids for admin). Whatever the employer can do
here the admin can too.

**The taxonomy went broad.** The board was tech-only (12 parents / 56 roles). It
now covers the business functions a Cyprus fintech/forex/corporate-services
employer actually hires for: added parents **Customer Support**, **Compliance &
Financial Crime**, **Risk**, **Legal & Corporate**, **Finance & Accounting**,
**HR & People**, **Marketing**, **Sales & Business Development**, **Operations**,
plus **Head of Product** under the existing Product. Now **21 parents / 138
roles**. Homepage grid icons for the new parents added to `CATEGORY_ICONS` in
`page.tsx` (the grid is DB-driven and falls back to a generic briefcase, but the
named icons look intentional). `prisma/seed.ts` was rewritten to build the full
parent→child tree so a fresh DB reproduces production.

**Written straight to production.** The new rows were inserted into the live DB
via the Supabase MCP (`gen_random_uuid()` ids — functionally fine, `id` is just a
unique text PK; format doesn't matter). So they are live on the homepage grid and
the existing pickers **now**, ahead of any code deploy. Two caveats:
- The **nav dropdown is cached** (`getNavCategories`, `unstable_cache`,
  `revalidate: 3600`, tag `CATEGORY_CACHE_TAG`). A direct SQL insert does not bust
  that tag, so the new parents appear in the nav menu within ~1h or on the next
  deploy. The job pickers and homepage grid read uncached queries, so they show
  the new categories immediately.
- The **searchable combobox itself only ships when this branch is deployed.**
  Until then production still renders the old cascading dropdowns — which harmlessly
  just show the newly-added categories.
- Minor redundancy left in place: Finance & Trading still carries "Compliance
  Analyst" and "Risk Analyst" (both 0 jobs) which now overlap the dedicated
  Compliance and Risk parents. Harmless with a flattened search; move them later
  if it bothers you.

---

## Session: Google go-live (Search Console, favicon, Indexing API), Stripe live, SEO landing pages

**Favicon fixed.** The only icon was `/logo.svg` referenced from `metadata.icons`
in `layout.tsx` — but that SVG's canvas is **628×576, not square**, so Google (and
some browsers) rejected it as a favicon and fell back to a generic icon; the repo
also still shipped Next's default placeholder `favicon.ico`. Fix: a new square
`src/app/icon.svg` (cropped viewBox around the mark) plus generated
`src/app/favicon.ico` (16/32/48, via `sharp` + `png-to-ico`) and
`src/app/apple-icon.png` (180×180, white background — the mark is dark and needs
a light backing for iOS). These are Next's file-convention icons, picked up
automatically; the manual `metadata.icons` entry was removed. Verified: fetched
`/favicon.ico` and `/icon.svg` from production, both 200 and both the real logo.
**Caches (Chrome's "visit often" tiles, Google's own favicon cache) are slow to
update and are not evidence of a broken deploy** — confirming at the source
(`curl`/fetch the file directly) is the only reliable check; incognito does
**not** bypass Google's server-side favicon cache, only the local browser one.

**Google Search Console verified.** Domain property, TXT record. First attempt
failed — queried Vercel's authoritative nameserver directly (`ns1.vercel-dns.com`)
and confirmed the token genuinely wasn't published (only the SPF TXT record
existed), not a propagation delay. Root cause was almost certainly the TXT
record's Name/host field not being left blank/`@`. Second attempt succeeded.

**www → apex 301 consolidated.** Google was indexing both `cyprustech.careers`
and `www.cyprustech.careers` as separate hosts, splitting ranking signals (all
code canonicalizes to the apex). First redirect attempt in Vercel Domains was
backwards (apex → www); corrected to `www → apex` (301). Verify via Vercel
Domains screenshot, not `curl` (egress-proxy-blocked) — Vercel's `web_fetch`
tool *follows* redirects rather than showing the 301, so it can't verify this
either; the dashboard config is the source of truth here.

**Google for Jobs — Indexing API wired up, and a real bug found + fixed along
the way.** Structured data was already valid (Rich Results Test: "2 valid items
detected", Job Postings eligible; the "Missing addressRegion/postalCode/
streetAddress" warnings are explicitly optional and not worth chasing). Getting
credentials required routing around an org policy
(`iam.disableServiceAccountKeyCreation`) blocking key downloads on the Workspace
account — resolved by creating the Cloud project under a personal Gmail instead
(Search Console ownership, which is what actually authorizes the API, is
independent of which Google account owns the Cloud project). Set
`GOOGLE_INDEXING_CLIENT_EMAIL` / `GOOGLE_INDEXING_PRIVATE_KEY` in Vercel
Production.

**The real bug: every `notifyGoogle()` call site was fire-and-forget
(`void notifyGoogle(...)`), and Vercel freezes the function the instant the
response is returned — killing the in-flight request to Google mid-write.**
Symptom in production logs: `TypeError: fetch failed` /
`SocketError: other side closed` with `bytesWritten: 1518, bytesRead: 0` — the
JWT signed fine and the request left the function, it just never got to finish.
This looked exactly like a bad credential and was not one; the giveaway is
bytes *written* with zero bytes *read back*. Fixed by wrapping every call in
`after(() => notifyGoogle(...))` (`next/server`), which keeps the function alive
until the background request completes without adding latency to the response.
Applied to all five call sites: employer `visibility`/`publish`/`[id]` PATCH+DELETE
routes and both admin job routes. Confirmed fixed by re-running the same
unpublish/republish and seeing `200` + `[google-indexing] URL_UPDATED …` /
`URL_DELETED …` in the logs with no socket error.

**Second bug found in the same investigation: the admin job routes never called
`notifyGoogle` at all.** Only the employer-facing routes
(`visibility`/`publish`/`[id]`) pinged Google; `api/admin/jobs/route.ts` (POST)
and `api/admin/jobs/[id]/route.ts` (PATCH/DELETE) did not. Since curated jobs are
created and managed *only* through admin, this meant the entire curated-job
catalog was invisible to the Indexing API regardless of the credential/`after()`
fix. Added `notifyGoogle` to all three admin paths, mirroring the employer
routes' URL_UPDATED-while-ACTIVE / URL_DELETED-otherwise logic.

**Stripe switched to live payments — see External services / env.** Confirmed
end to end with a real card and a webhook log showing `credited`.

**SEO landing pages — see the SEO section above** (category pages, city-page
enrichment, the title-doubling fix).

**Diagnostic techniques used repeatedly this session, worth reusing:**
Vercel `get_runtime_logs` (scope to `deploymentId` when a wide time-range query
times out; `group_by: "requestPath"` is fast even over wide ranges and is how
the "admin routes never call notifyGoogle" gap was actually found — grouping
showed zero `/api/jobs/[id]/visibility` hits despite the user testing via admin).
`list_deployments` to correlate a log line's timestamp against which commit was
actually live. `web_fetch_vercel_url` for anything that needs to see rendered
output/response headers from the real production edge (bypasses the sandbox's
`curl`-to-the-live-domain block) — but note it can return oversized results for
full HTML pages; grep the saved file rather than re-fetching.

---

## Session: SEO landing pages + GEO, footer, dropped CV matcher

All the code below shipped straight to `main` (production) at Maxim's explicit
"push to main" requests — commits `f4db703` → `d15525f`. **These bypassed `test`,
so `main` and `test` diverged; this context.md update is on a merge that brought
that code back onto `test` and restored `main` as an ancestor (so `--ff-only`
releases work again).** If you're reading this on `test`, the code and the docs
now match; `main`'s own `context.md` stays stale until the next release
fast-forwards it.

**Category pages got their filters back (`f4db703`).** The earlier "category
landing pages" work (see the Google go-live SEO notes) had since regressed —
`/jobs/<category>` was rendering a row of "ROLES:" tag chips instead of a filter
panel, so category pages had lost filtering entirely. Restored real filtering:
`CategoryPage.tsx` now renders the shared `FilterBar` scoped to the category
(`basePath` = the category path, `hideCategoryFilter` so it doesn't offer to
filter away the page's own category), filtering in place across type / employment
/ level / city / skill / salary / search, with active-filter pills. `FilterBar.tsx`
grew two props for this — `hideCategoryFilter` and `hideEmploymentFilter`,
mirroring the existing `hideCityFilter` / `hideTypeFilter`; each hidden facet is
excluded from `activeCount`, the `apply()` URL builder, and the rendered section.
This was Maxim's "Option A": dedicated category pages **with** filters.

**Indexable job-type landing pages (`596c44a`).** New route `/jobs/type/[slug]`
for the five employment types (full-time, part-time, contract, internship,
freelance). `JobTypePage.tsx` (new, modelled on `CityPage.tsx`) carries a unique
intro + FAQ per type, Breadcrumb / ItemList / FAQ JSON-LD, and a `FilterBar` with
`hideEmploymentFilter`. `type/[slug]/page.tsx` holds a `CONFIGS` map (unique
metadata + canonical per type) and `generateStaticParams`. Category and city
pages were enriched the same pass (fuller copy, per-page canonical, by-city /
by-type internal links); the five `/jobs/type/*` URLs went into `sitemap.ts`.
**Metadata shallow-merges and children override parents — every one of these
pages sets its own `alternates.canonical`, or it inherits the parent's and
self-cannibalises.**

**FAQs are dropdowns everywhere (`13f183d`).** Every FAQ block that was static
`<h3>`/`<p>` text now renders through the `FaqAccordion` component (category,
city, job-type pages). The visible copy still matches the `FAQPage` JSON-LD, so
rich-result eligibility is unchanged — only the presentation collapsed.

**GEO — `/llms.txt` + AI crawlers explicitly welcomed (`3d91a8f`).** New route
`src/app/llms.txt/route.ts` (`revalidate = 3600`) emits llmstxt.org-style
markdown built from `getCategoriesWithCount`, with a safe hardcoded fallback if
the DB is unreachable at build/request time. `robots.ts` was refactored to a
shared `DISALLOW` list plus an `AI_CRAWLERS` array that **explicitly `allow`s**
the AI search/training bots we want indexing us — GPTBot, OAI-SearchBot,
ChatGPT-User, ClaudeBot, anthropic-ai, Claude-Web, PerplexityBot, Perplexity-User,
Google-Extended, Applebot-Extended, CCBot, cohere-ai. (Maxim also floated
"AI-logo footer links" — discussed, not built: `/llms.txt` + robots is the
substantive GEO lever; decorative logo links are not.)

**Footer — job-type links + social links live (`4fca87d`, `bc7231b`, `034aa31`,
`d15525f`).** Added a `JOB_TYPE_LINKS` group under the "browse jobs" column
pointing at the new `/jobs/type/*` pages. Activated the social row in `Footer.tsx`
(`SocialLinks`): Instagram (`instagram.com/cyprustech.careers`), Threads
(`threads.com/@cyprustech.careers`), Facebook (`facebook.com/share/1Beo4MTY9w/`)
and LinkedIn (`linkedin.com/company/cyprus-tech-careers/`) are now `active: true`
real links; Medium was already live. Any `socials` entry with `active: true` + an
`href` renders as a `target="_blank"` icon link; a `null` / `active:false` entry
stays a greyed "coming soon" placeholder.

**Bug fixed during a self-review (`cf05040`).** `CityPage.tsx`'s by-type internal
links pointed at `/jobs/type/${slug}?city=Remote`, but `JobTypePage` ignores a
`?city=` param, so the links were dead weight. Corrected to
`/jobs/${slug}?employment=${t.employment}`.

**CV matcher — built, then DROPPED at Maxim's request. Not on `main` or `test`.**
A "Match my CV" feature was built on a working branch: upload a CV → one Anthropic
call (`claude-haiku-4-5-20251001`, base64 PDF `document` block) extracts a
structured profile, then a free **deterministic** scorer ranks every active job
against it, best-match first, paginated. Files: `src/lib/cv-match.ts`,
`api/cv-match/route.ts`, `components/cv-match/CvMatchUploader.tsx`,
`jobs/match/page.tsx` + `jobs/match/[id]/page.tsx`, a `CvMatch` Prisma model and
its migration, plus a hero "Match my CV" button. Preview returned "Matching
failed" — root cause confirmed via Supabase MCP `list_tables`: **the `cv_matches`
migration was never applied to the shared prod/preview DB**, so the insert hit a
non-existent table. The blocker was purely operational (an unapplied migration),
not a code defect. Maxim said "drop this feature", so it was fully reverted —
schema, migration, routes, component and hero button all removed; **no schema
change ever reached the database.** If revisited, the whole feature is recoverable
from git history (branch commits around `c27f4b9`); the only thing needed to make
it run is `prisma migrate deploy` against the real DB before the route goes live.
Cost note for a redo: ~1,500–3,000 input tokens per CV page at Haiku 4.5's
$1 / $5 per-MTok — cents per upload, since only the extract step calls the model.

**Favicon "still not in Google results" — not a code bug.** Maxim asked why the
search result still shows no icon. The favicon code is only a couple of days old
(see the Google go-live session); Google simply hasn't recrawled `/favicon.ico`
+ the manifest yet. Recrawl latency, nothing to fix.

---

## Session: title/robots/Google-for-Jobs SEO + role×city money pages

An SEO-focused session. Everything below shipped to `main` (production) at
Maxim's explicit "ship it" requests; `main` and `test` are level again at the end.
Driven by a plain goal — "rank higher when people search Cyprus/tech jobs".

**Blog post — original Cyprus-fintech piece (`src/lib/blog.ts`, Post 4).** Maxim
saw an ergodotisi.com article on Cyprus fintech growth and wanted our own, SEO'd
and worded differently. Their page 403'd (Cloudflare), which was fine — wrote a
fully original ~12-min post angled on *economic impact + the jobs the sector
creates* (deliberately distinct from the existing Limassol-tech-hub post's
city angle). Slug `cyprus-fintech-economic-impact-jobs-2026`, category "Market
Insights". Uses the standard `BlogSection[]` shape so it renders through the
existing template with Article/Breadcrumb schema, canonical, OG/Twitter — no new
code. House rule kept: structural facts (12.5% tax, CySEC, MiCA, non-dom) are
real; market-share/salary figures are hedged as directional.

**Keyword-first titles — and a Next.js gotcha worth remembering.** The homepage
`<title>` and the root layout's `title.default` led with the brand; front-loaded
them with the keyword instead (homepage now "Tech Jobs in Cyprus with Salaries |
CyprusTech.Careers"), broadened the meta description ("IT", "software", "work in
Cyprus tech"), and changed the H1 "tech role" → "tech job". **The gotcha:** I
first claimed the homepage title was *doubling* via `title.template`. Wrong —
verified live that Next.js does **not** apply a layout's `title.template` to the
index page (the root `page.tsx` shares the root `layout.tsx`'s own segment; a
template only decorates *child* segments). Proof: `/jobs` renders with the
"| CyprusTech.Careers" suffix, the homepage does not. So there was never a
double; removing the baked-in brand simply dropped it, and the brand had to be
written back into the homepage title *explicitly*. Child-page titles (category,
city, job-type, role×city) correctly omit the brand and let the template add it.

**Search Console "Indexed, though blocked by robots.txt" — fixed with the right
pattern.** `/login`, `/get-started`, `/buy-credits` are linked site-wide from the
nav (logged-out state), so Google discovered them everywhere while `robots.ts`
*blocked* them — the exact recipe for that warning (Google indexes the bare URL
from the links but can't crawl it to see a noindex). Fix: give those pages
`robots: { index: false }` and **remove** them (plus `/style-guide`, which already
had noindex) from the robots.txt `DISALLOW`, so Google crawls them, reads the
noindex, and drops them cleanly. `robots.txt` now blocks only non-HTML (`/api/`,
`/_next/`) and auth-gated (`/admin`, dashboards) areas. Verified live. General
rule: to keep a *linked* page out of the index, use `noindex`, never a robots
block.

**Google for Jobs — was already ~80% set up; closed the last gap.** No signup
exists for the Jobs widget — eligibility is just valid `JobPosting` structured
data on crawlable pages, which the active job pages already emit (plus the
Indexing API pings). Added `addressRegion` (a city→Cyprus-district map in
`src/lib/schema.ts`) to `jobLocation` — the one Google-recommended address field
the Rich Results Test flagged that we can actually fill (no per-job
`postalCode`/`streetAddress` data). Everything else was already correct
(`directApply:false`, hybrid keeps `jobLocation`, TELECOMMUTE only for remote).

**Sitemap cleanup.** `getCompanySlugs` (sitemap-only) now requires `jobs: { some:
{ status: "ACTIVE" } }` instead of "any company with an employer", so empty
company profiles — and the leftover `test`/`test-company` records — stop being
submitted to Google.

**Role×city "money pages" — the biggest new lever.** The high-intent long-tail
("<role> jobs <city>") had no dedicated page; the intent was only reachable as a
query-param filter that canonicalised back to the base category page (so Google
never indexed it separately). Built dedicated pages:
- New route `src/app/jobs/category/[slug]/[city]/page.tsx` (`force-dynamic`) +
  new shared component `src/app/jobs/_shared/CategoryCityPage.tsx` (mirrors
  `CategoryPage`, scoped to a fixed location). Locations: Limassol, Nicosia,
  Larnaca, Paphos, **Remote** (remote swaps the city filter for
  `remoteType=REMOTE`). URL e.g. `/jobs/category/data-analyst/limassol`,
  `/jobs/category/backend/remote`.
- Each page: **self-canonical**, unique keyword title/H1/description ("<Role> Jobs
  in <City>"), role+city-specific intro & FAQ, Breadcrumb + ItemList + FAQPage
  JSON-LD, full filtering (category + location fixed by the path).
- **Quality gate:** only combos with ≥1 live job go in the sitemap; empty combos
  still render a helpful "browse all" state but are `noindex` (metadata checks the
  count) — so no thin/empty pages get indexed. URL scheme is
  `/jobs/category/[slug]/[city]` (nesting under the existing category route avoids
  colliding with the static `/jobs/<city>` folders).
- Interlinking: the category page's "jobs by city" chips were repointed from the
  old `/jobs/<city>?category=<slug>` query-param URLs to these dedicated pages,
  giving Google a crawl path to every combo.
- **Verified live** on production (`/jobs/category/data-analyst/limassol`): title
  "Data Analyst Jobs in Limassol | CyprusTech.Careers", matching H1,
  self-referencing canonical, BreadcrumbList + ItemList + FAQPage present; ~22
  combos in the sitemap; no test-company URLs.

**Expectation set with Maxim:** these are on-page wins — live, but ranking still
needs Google to recrawl (days–weeks) and depends on off-page authority
(backlinks) too. On-page is necessary, not sufficient. Next nudge: submit the
sitemap in Search Console and Request Indexing on the top few money pages.

**Process note (git hygiene).** Mid-session a commit landed on a *local* `main`
by mistake, and local `test` had drifted behind `origin/test` (so a cherry-pick
briefly skipped a shipped commit). Caught both before any bad push by checking
`git branch --show-current` and comparing against the **real remote** with
`git ls-remote` (local tracking refs had gone stale), then relocating the commit
onto the true `origin/test` tip. Lesson reinforced: verify the branch *and*
`git ls-remote origin` before committing/pushing; don't trust local refs after a
release dance.

---

## Session: apply-link checker, admin on mobile, GA4 behind consent

Everything here shipped to `main` (production) except the last item, which is on
`test` only and is the current gap between the two branches.

**Curated jobs get their apply links checked, soft 404s included (`d3844d8`,
`30f1573`).** Curated listings link out to an employer's own careers page, and
those pages go dead without telling anyone — a candidate clicks Apply and lands
on nothing. New `src/lib/link-check.ts` + `POST /api/admin/jobs/check-links`
(admin-gated, `maxDuration = 60`, a 6-worker pool since dozens of sequential
external fetches would blow any function time limit). Two schema columns back it:
`applyUrlBroken` / `applyUrlCheckedAt` on `Job`, migration
`20260807000000_add_apply_url_link_check`, **and that migration IS applied to the
live database — verified this session against `information_schema` via the
Supabase MCP.** Worth stating plainly because the CV matcher died on exactly the
opposite situation (see that session); with a shared prod/preview DB, "the
migration is in the repo" is not evidence it ran.

The checker is **deliberately conservative**, and that's the part to preserve if
anyone touches it:
- Only a real **404/410** counts as broken by status. A 403, a 5xx, a timeout, a
  DNS or TLS failure all return `broken: false` — career sites 403 non-browser
  requests and blip 5xx routinely, and a checker that cries wolf is one the admin
  learns to ignore.
- **GET, not HEAD** — many ATS platforms 405 or misreport on HEAD, and the body
  is what the soft-404 check needs.
- A browser-like **User-Agent**, because a bare fetch's default UA is itself a
  common 403 trigger.
- **Soft-404 detection** was the actual bug that prompted `30f1573`: an Exness
  careers page returned **200** with a body reading "404 / Not found", so a
  status-code check saw a healthy page. Patterns are matched against
  `<title>`/`<h1>`/`<h2>` **only, never the whole body** — a live job description
  can legitimately say "no longer accepting applications after <date>", and
  whole-body matching would flag real listings.

Admin UI: `JobsTableClient` gained a "Check apply links" button, a per-row
badge (`Broken` / `OK · 2h ago` / `Not checked`), a broken count in the header
and a "show broken only" filter. On demand, not on a cron — nothing schedules it.

**The debug-probe episode, and the lesson (`cfd9365` → `c59ba30`).** Diagnosing
that Exness soft-404 took five commits of temporary probe routes on production,
including `cb25ab0` "fix the probe route itself" — the first probe was under a
`_debug` folder, and **`_`-prefixed folders are private and unroutable in this
Next.js version**, so it 404'd rather than running. The important commit is the
last one: `c59ba30` removed a probe route that `18b98d8` had been *supposed* to
remove and missed. An unauthenticated route that fetches an arbitrary URL and
reports what came back is the same SSRF shape as security-backlog item 1, and it
sat on production between deploys. If you ship a probe, grep for it before you
call the investigation finished — `git ls-tree -r origin/main | grep -iE
'debug|probe'` should come back empty, and it does now.

**Admin panel usable on mobile (`8e0acd2`).** `AdminNav` becomes an off-canvas
drawer below 768px, driven by React state, closing on route change. Note the
comment left in the file: the drawer's widths/transforms live in `globals.css`
media queries **on purpose** — an inline style would out-specificity the media
query and the drawer would never narrow or slide. `AdminTable`, `AdminJobForm`,
`AdminBlogForm` and the admin layout were adjusted in the same pass.

**GA4 added, behind real consent (`fd6beb2`).** Google Analytics 4
(`G-MGNJW82FYC`) under Consent Mode v2. The design point: a `beforeInteractive`
inline script sets `ad_storage` / `ad_user_data` / `ad_personalization` /
`analytics_storage` to `denied` **before gtag.js or the config call can run**,
unless a prior "granted" decision is already in localStorage. That is what keeps
the Cookie Policy's "nothing non-essential runs until you agree" true rather than
making it false the moment GA was installed. `CookieNotice` was rebuilt into a
real accept/decline choice, `CookiePreferences` on `/cookies` lets a visitor
change their mind later, and shared storage logic lives in `src/lib/consent.ts`.

Two things to know before editing any of this:
- **`CONSENT_VERSION` went 1 → 2 on purpose, and that re-prompts every visitor.**
  Version 1 was a bare acknowledgment of a site that set nothing non-essential;
  dismissing *that* cannot stand in for consenting to analytics nobody was shown.
  A stored record of the wrong version reads as "no decision yet". Bump it again
  on any future change in what is actually collected.
- **The Consent Mode bootstrap duplicates the storage key and version as string
  literals** (`"ctc-cookie-notice"`, `version === 2`) because it is plain inline
  JS with no bundler and cannot import `consent.ts`. Both files carry a comment
  saying so. **Change one, change the other**, or a returning visitor's stored
  consent silently stops being recognised and analytics goes quiet with no error
  anywhere.

**GA4 page views on client-side navigation — on `test` only (`234ba8c`).**
Reported as "GA4 says no data received", and it was two real gaps, not just an
unaccepted notice. gtag.js's automatic `page_view` fires once, at the initial
full page load; it has no idea Next.js's client-side routing exists, so clicking
through five listings via `next/link` produced exactly one page view for the
session. Fixed with `send_page_view: false` plus a `GoogleAnalyticsPageview`
route-change listener (`usePathname` + `useSearchParams`, **wrapped in
`Suspense`** in the root layout — `useSearchParams` requires it or the build opts
out of static rendering). Second gap: a visitor who lands, accepts, then leaves
without navigating generated nothing at all, because the automatic page view had
already been correctly suppressed while consent was denied and was **not** queued
for replay. `updateAnalyticsConsent` now fires one `page_view` explicitly the
moment consent flips to granted. **This is the one commit `main` does not have** —
release it before judging GA4 numbers from production.

**Blog post 5 (`35eec54`).** "The September Hiring Surge in Cyprus Tech", slug
`september-hiring-surge-cyprus-tech-2026`, Career Advice, 10 min. Standard
`BlogSection[]` shape, so it renders through the existing template with
Article/Breadcrumb schema and no new code — same house rule as post 4 on hedging
non-structural figures.

**Skill taxonomy widened (`73c13db`).** `TECH_STACK_OPTIONS` in
`onboarding-types.ts` gained SQL, Perl, PowerShell, Julia, Zig, .NET, the
enterprise databases (MSSQL, Oracle, Neo4j, Couchbase, InfluxDB), data/ML
libraries (Matplotlib, Seaborn, Plotly, OpenCV, spaCy, XGBoost, LlamaIndex,
Ollama, the Anthropic and Gemini APIs), and a much fuller Security & Compliance
group including certifications (CISSP, CISM, CISA, CEH, Security+, OSCP, CCSP)
and frameworks (ISO 27001/27701/9001, SOC 2, PCI DSS, GDPR, HIPAA, NIST CSF),
with matching icons in `skill-icons.ts`. **SQL being absent is the notable one** —
it is one of the most-requested skills on the board and could not be tagged at
all. Remember `linkJobTags` creates missing tags on write, so new options here
reach the DB the first time someone saves a job using them; the picker stays a
closed list.

---

## Session: the empty-landing-page / soft-404 fix

Prompted by three Search Console emails. Two of them had the same single cause;
the third was a false alarm. Worth reading before acting on any future GSC mail.

**"Discovered – currently not indexed" (174 URLs) and a failed Soft 404 fix
validation were the same bug.** The site published a landing page for every
category, city and employment type regardless of whether a job sat behind it.
An empty page that returns 200 saying "No jobs found" is what Google classifies
as a **soft 404**, and it stops crawling the rest once it has sampled a few.
Measured against the live DB at the time: **159 categories, 27 active jobs, 129
categories with nothing behind them**; four of the five job-type pages empty
(every active job was `FULL_TIME`); Larnaca and Paphos empty.

The galling part is that the rule already existed — `sitemap.ts` carried a
comment explaining why empty role×city combos are withheld — but it had never
been applied to the category, city and job-type pages those combos are built
from.

Fixed in `f6ce7f7`:
- **`src/app/jobs/_shared/seo.ts` → `noindexWhenEmpty(filter)`**, one
  implementation now shared by the category, city, job-type and role×city
  routes. Emits `noindex, follow` — crawlable, just not indexable, the same
  reasoning as the robots.txt fix (to keep a *linked* page out of the index use
  noindex, never a block).
- **It fails open.** The role×city version it replaced did `.catch(() => 0)`,
  so a transient DB error would have noindexed every one of those pages.
  Deindexing is slow to undo; a briefly-indexed empty page costs almost
  nothing. If you touch this helper, keep that direction.
- The five **city routes moved from `export const metadata` to
  `generateMetadata`** so they can read a count. Their metadata values are
  otherwise unchanged.
- **`sitemap.ts`**: categories filtered to those with a live job (the `OR`
  mirrors `getJobCount`, so a parent stays listed while any child has one);
  city and job-type URLs moved out of the hardcoded `STATIC` array and gated on
  the same counts.
- **`sitemap.ts` gained `revalidate = 3600`.** This is the non-obvious one:
  every query in that file runs **at build time** and the output was then frozen
  until the next deploy — visible as `○ /sitemap.xml` with no revalidate column
  in `next build` output, next to `○ /llms.txt  1h  1y`. Tolerable when the
  contents were a fixed list; not once entries appear and disappear with live
  job counts. **If you add anything data-driven to a sitemap or a route like it,
  check the build output for that column.**
- **`/jobs/famagusta` deleted.** An orphan `redirect("/jobs")` nothing linked
  to. Redirecting a URL to a generic page is itself a soft-404 signal; it now
  404s honestly. (The `Famagusta` entries in `schema.ts` are the district map
  for `addressRegion` — unrelated, leave them.)

**Verified against a scratch Postgres, on rendered HTML rather than by
reasoning** — one job seeded under a child category, then all 14 cases checked:
a category with its own job and a parent whose child holds the job both stay
indexable; two empty categories, four cities, empty job types and an empty
role×city combo all emit `noindex, follow` while still returning 200 with their
"browse all" content; the sitemap lists only non-empty URLs; famagusta 404s.

**The third email was a false alarm — don't chase it.** "Job Postings structured
data issues: Missing `streetAddress` / `postalCode` in `jobLocation.address`."
Google's own email labels these **non-critical**; rich-result eligibility is
unaffected. The `Job` model holds only `city`, so `addressLocality`,
`addressCountry` and `addressRegion` are already everything that can be filled
honestly. Collecting a street address would contradict `804b27d` ("stop implying
an employer needs a company address"), is meaningless for remote/hybrid roles,
and is unavailable for curated listings. **Do not fill `postalCode` with a
generic city code** — inventing location data in structured markup is worse than
omitting an optional field.

**Two notes for the next Search Console round:**
- **Don't click "Validate Fix" before the fix is deployed.** The failed
  validation happened because nothing had shipped; Google re-crawls a sample,
  sees no change, fails it, and gets slower to re-check.
- The soft-404 logic in `src/lib/link-check.ts` is **unrelated** to this. That
  detects soft 404s on *employers' external careers pages*. Same term, opposite
  direction — easy to assume one covered the other.

**Still the real constraint:** 27 live jobs does not support 159 landing pages.
The gate makes the indexable surface honest (~30 pages), but inventory is what
actually moves rankings.

---

## Session: the link checker's false positives

Two Bolt listings showed a red **"Broken"** badge in admin while both pages
were open and fine in a browser. The bug is worth understanding because the
shape of it recurs: **a heuristic was given the same authority as a fact.**

`checkApplyUrl` has always returned a `reason` separating a real HTTP 404/410
from a guess based on the page's wording — and `check-links/route.ts` **threw
that reason away**, storing only `applyUrlBroken: boolean`. Both collapsed into
one red badge, so neither the admin nor a later investigation could tell which
had happened.

Two ways the heuristic was too eager, both reproduced as failing cases against
the old code:
- **It searched `<h2>`.** That is routinely an ordinary section heading. A
  careers page whose h2 reads *"Not found what you were looking for? See all
  roles"* was enough to retire a live job. Now **`<title>` and `<h1>` only**.
- **It read raw HTML.** A client-rendered careers site that inlines its own
  error-page markup into serialised state — *before* the document's real
  `<title>`, which the first-match extraction reaches first — flagged a live
  listing on a string no visitor sees. Script, style, noscript and comment
  content is now stripped before any tag is read.

**The structural fix, and the bit to preserve:** a heuristic match can no
longer set `applyUrlBroken`. It sets `applyUrlCheckReason = "soft-404"` and
renders as an amber **"Check"** badge whose tooltip says it is a guess. Only a
server's own 404/410 gets red **"Broken"**, now showing the code. Don't
collapse these two states back into one badge — that *is* the bug.

New nullable column **`applyUrlCheckReason`** (`"http-404" | "http-410" |
"soft-404"`), migration `20260809000000_add_apply_url_check_reason`. **Applied
to the live database via the Supabase MCP at the time of writing**, ahead of
the deploy — required, because preview deployments share the production DB, so
`test` would have hit a missing column. The two false flags were cleared in the
same pass.

**Round two — the first fix was wrong about the cause, and the real one is
worse.** The guess above ("the `h2` path is the likelier candidate") was
mistaken. With the reason persisted, the next run said **`http-404`**: Bolt's
edge genuinely answers this checker with a 404 while serving a browser the live
page. A **stealth block** — indistinguishable at this layer from a retired
posting. Only Bolt does it; the other ~25 curated links check clean.

That falsified the assumption the first fix rested on, that a 404/410 is
authoritative. The request leaves a **datacenter IP without a browser's TLS
fingerprint, header order or JS**, and a site objecting to any of that answers
however it likes. **No status code obtained this way can prove a listing is
dead.** So the feature is now advisory end to end:
- `checkApplyUrl` returns `{ flagged, status, reason }` — **there is no
  `broken` field**, so no caller can promote a signal to a verdict. A test
  asserts the key is absent. Don't reintroduce it.
- One amber badge: `Check · 404` / `Check · 410` / `Check · reads as empty`,
  each with a tooltip saying what was seen and that some careers sites answer
  automated checks with a 404 even when live. No red state, no "broken" in the
  UI, no automatic action — unpublishing stays a human decision.
- The asymmetry that settles it: a false positive costs an employer a live paid
  listing; a false "check" costs one click.
- The UA still identifies itself honestly rather than impersonating a browser
  to get past a site that has chosen to refuse bots — which would not reliably
  beat fingerprinting anyway. `Accept-Language` and a fuller `Accept` are sent.
- `applyUrlBroken` now means "flagged for review" despite its name; the schema
  says not to spend a migration on the rename alone. The UI reads
  `applyUrlCheckReason` only.

**Sandbox limitation that shaped all of this:** `bolt.eu` is blocked by the
**egress proxy** — no `curl`, no `WebFetch` — so its pages cannot be read from
here at all, and the cause was only identifiable once the reason was persisted
and the admin re-ran the check. Adding a probe route to see for myself was
deliberately refused: that is exactly how the SSRF-shaped endpoint in the
earlier soft-404 investigation ended up on production. **Persisting the
observation and reading it back is the supported way to debug this.**

**Open, if the amber flags on the two Bolt links become annoying:** there is no
"ignore this link" affordance, so they will re-flag on every run. That needs a
column; worth pairing with the `applyUrlBroken` rename.

`scripts/verify-link-check.ts` serves fixtures from a local HTTP server and
covers the whole path: real 404/410 authoritative, genuine soft 404 a suspicion
only, both false-positive shapes clean, 403/5xx/unreachable inconclusive.

---

## Session: IT & Systems added to the taxonomy

The board covered engineering, and separately the business functions a Cyprus
fintech hires for, but **corporate IT fell between them** and had no home. The
nearest existing parents were both wrong, and the distinction is worth keeping:
**DevOps & Cloud is product infrastructure** — the systems the company sells run
on — whereas IT is **the systems the company runs ON**. A sysadmin and an SRE
are not interchangeable hires; Security covers infosec engineering, not a
helpdesk. An IT Operations Manager was unfileable.

New parent **`IT & Systems` (slug `it`)** with 14 roles: IT Support Specialist,
IT Helpdesk Technician, Desktop Support Engineer, Service Desk Analyst, System
Administrator, Network Engineer, Network Administrator, Database Administrator,
IT Operations Engineer, IT Operations Manager, IT Project Manager, Solutions
Architect, IT Manager, Head of IT. Taxonomy is now **22 parents / 152 roles**.

The `"IT "` prefix appears **only where an unprefixed slug would collide** —
`it-project-manager` against Operations' `project-manager`,
`it-operations-manager` against Operations' `operations-manager`. Slugs were
checked against the table before inserting.

**Written straight to the live `categories` table** (the source of truth for
nav, homepage grid and all three job pickers), same as the earlier broad-taxonomy
session — so the roles are selectable immediately, ahead of any deploy. Same
caveat as last time: the **nav dropdown is cached** (`getNavCategories`,
`unstable_cache`, tag `CATEGORY_CACHE_TAG`), and a direct SQL insert does not
bust it, so the new parent reaches the nav within ~1h or on the next deploy.
The pickers and homepage grid read uncached queries and show it now.

`prisma/seed.ts` updated to match, and **verified by diffing the seed tree
against the live table — 174 entries, exact match.** Worth repeating that check
whenever the taxonomy is touched; it is the only thing keeping a fresh database
reproducible.

**The skill picker needed widening too, and this is the easy half to miss.**
`TECH_STACK_OPTIONS` is a **closed list**, so an IT role could be filed but not
tagged — no Active Directory, Windows Server, VMware or ITIL existed. Added
~31 IT entries (AD/Group Policy/M365/Intune/Exchange/Entra/SCCM, VMware/Hyper-V/
Citrix/Veeam/Proxmox, Cisco/Fortinet/pfSense/VPN/DNS/DHCP/TCP-IP/VoIP, ITIL/
ServiceNow/JSM/Zendesk/Freshservice, backup & DR, endpoint management, helpdesk,
hardware troubleshooting, macOS admin). Icons only where a real brand icon
exists — `resolveSkillIcon` falls back, which reads better than a wrong logo.
358 options total, no duplicates.

**A pleasant interaction with the SEO fix:** all 15 new categories are empty on
day one, so `noindexWhenEmpty` marks them `noindex` and the sitemap omits them
automatically. Adding a whole taxonomy branch no longer creates thin pages —
each one starts appearing to Google only once it has a job.

Verified against a scratch Postgres with the app running: the grid tile renders
with its icon and links to `/jobs/category/it`; that page and a child role page
return 200 with correct titles; the picker query is unfiltered so it lists the
new roles; the empty pages are `noindex` and absent from the sitemap.

---

## Session: readable job URLs, and the AI-endpoint SSRF closed

**Job URLs are now `company-role-city`** — `/jobs/exness-data-analyst-limassol`.
They were `slugify(title) + Date.now().toString(36)` from the admin route
(`data-analyst-msdjd3yn` — that suffix decodes to the creation timestamp) or
`title-company` from the employer routes. Three generators, none matching what
anyone types into Google.

- One helper, `src/lib/job-slug.ts`, used by all three creation routes.
- Remote with no city gets `remote`; neither gets no location segment.
  Duplicates take a counter (`…-limassol-2`). Capped at 90 chars, trimming the
  title on a hyphen so company and location survive.
- **A slug is assigned once and does NOT follow later edits** to title, city or
  company. A URL moving under an indexed page costs more than a fresh slug
  gains.

**The redirect layer is the part that matters — do not remove it.** New
`JobSlugHistory` table holds every slug a job has ever had; `/jobs/[slug]`
falls back to it and issues `permanentRedirect` (308, which Google treats as a
301). Renaming without this would have 404'd every indexed job page and thrown
away their ranking. **Its unique constraint is load-bearing**: `uniqueJobSlug`
checks history as well as live slugs, so a new listing can never claim a
retired URL and silently redirect people to the wrong job.

**Backfill done: all 26 jobs renamed, 26 redirects recorded.** Order mattered
and is worth repeating if this ever happens again — migration first, then
deploy the redirect code, *then* rename. Renaming before the code is live means
every old URL 404s in the gap. Verified after the fact on production: an old
URL resolves to a 200 whose canonical is the new slug. `scripts/
backfill-job-slugs.ts` is dry-run by default and re-runnable;
`scripts/verify-job-slug.ts --db` covers the rules and the redirect path.

**Security backlog #1 is closed — the SSRF and the unmetered AI spend.**
`candidates/parse-cv` and `cv-review` both took a URL from an unauthenticated
body, fetched it, and returned Claude's reading of the response. Requiring
sign-in was never the fix (parse-cv runs at onboarding step 7, before
verification at step 8; cv-review sits on public job pages). The observation
that made it easy: **a real CV has always come from our own storage**, so the
URL never needed to be arbitrary. `src/lib/cv-url.ts` pins it to the `cvs`
bucket on the project's Supabase host — https only, no credentials in the URL,
exact hostname, path under `/storage/v1/object/public/cvs/`.

- **It fails CLOSED**, deliberately unlike `rate-limit.ts`, which fails open. A
  counter that cannot be read should not take the site down; an allowlist that
  cannot be evaluated must not wave requests through.
- Both routes now carry `enforceIpLimit` at 12/hour. On `cv-review` it sits at
  the POST entry so the **file-upload branch is metered too** — that path calls
  Anthropic as well and is easy to forget.
- Refusals log their reason server-side but return the routes' existing generic
  message, so the allowlist cannot be mapped by probing.
- `scripts/verify-cv-url.ts` — 16 cases weighted at the bypasses:
  `169.254.169.254`, localhost, `host@evil.com` credentials trick, lookalike
  subdomain, host as a path segment, http on the right host, right host wrong
  bucket, right host pointed at the REST API, `..` traversal. **Also checked
  the three real CV URLs in the production database against the allowlist
  before shipping** — a pattern that refused genuine uploads would have broken
  CV parsing silently.

**Still open on the AI endpoints:** rate limits are per-IP, so they cap a
casual abuser rather than a distributed one, and the Anthropic spend is capped
only by that. Fine for now; revisit if the bill ever looks odd.

**Caught right after: `job_slug_history` shipped without RLS.** Supabase's
advisor flagged it CRITICAL and was right. **Every table in `public` is exposed
through PostgREST, and the anon key ships in the browser bundle** — the grants
on the new table were the Supabase default, `SELECT/INSERT/UPDATE/DELETE/
TRUNCATE` for `anon`. So anyone could have minted unlimited slugs redirecting
to real listings (SEO spam through our own domain), or deleted the rows and
404'd all 26 previously indexed job URLs.

Fixed with `ENABLE ROW LEVEL SECURITY` and **zero policies**, matching
`apply_clicks` / `job_alerts` / `rate_limits`: the table is only ever touched by
the server through Prisma, which connects as the owner and bypasses RLS, so no
policy is needed and anon/authenticated are denied outright. Verified with
`set local role anon` — owner still sees 26 rows, anon sees 0, an anon INSERT
probe left nothing behind, and an old job URL still redirects on production.

**The lesson, because this will recur: a table created by raw SQL through the
Supabase MCP does not get RLS.** Prisma migrations do not emit it either — every
other table has RLS because someone turned it on deliberately. **Any new table
in `public` needs an explicit `ENABLE ROW LEVEL SECURITY` in the same
migration**, and the repo migration for this one now carries it so a fresh
database is not born with the hole.

---

## Security backlog — found in an audit

Ordered by how easily someone could do damage. All 49 API routes, every RLS
policy and the render paths were reviewed; what is missing here was checked and
is fine (service-role key never reaches the client, admin routes all gated,
Stripe webhook verifies signatures, employer job routes check ownership).

1. **Unauthenticated AI endpoints — STILL OPEN, approach decided.**
   `candidates/parse-cv` and `cv-review` take a POST from anyone and call the
   Anthropic API — no auth, no per-user cap. `parse-cv` additionally does
   `fetch(userSuppliedUrl)` with no host allowlist and returns Claude's reading
   of the response: an SSRF read primitive. **Do NOT require sign-in** — verified
   by tracing callers: `parse-cv` runs at step 7 of candidate onboarding (before
   verification at step 8), and `cv-review` sits on the public job page with no
   gate. Both legitimately serve people without accounts. The fix that does not
   break guests: (a) restrict the fetched URL to the project's own Supabase
   storage host — a real CV always comes from there, since `cv-upload` put it
   there — which closes the SSRF; (b) add the existing `rate-limit.ts`
   (anon-vs-signed-in, same shape as `cv-upload`) to cap the Anthropic spend.
   Realistic exposure is the **API bill**, not a data breach — Vercel's setup
   dampens the internal-address angle. This is the top remaining launch blocker.
2. **`employers/logo-upload` — FIXED this session (live on `main`).** Was
   anonymous write access to a public bucket with no rate limit, permitted
   `image/svg+xml`, and trusted the client's declared type/filename. Now: cannot
   require a session (the logo is chosen at wizard step 2, before verification at
   step 4), so it is IP-rate-limited when anonymous / account-limited when signed
   in; validation ignores the declared type and sniffs magic bytes, deriving both
   stored content-type and extension from them; SVG dropped (script vector, public
   bucket). Shared `src/lib/logo-upload.ts`; `scripts/verify-logo-upload.ts`
   covers it (SVG and HTML relabelled as PNG both rejected).
3. **Email enumeration** on the three `check-email` routes — `{exists:true|false}`
   for any address. On a job board that leaks who is job-hunting.
4. **`stripe/checkout` takes `employerId` from the request body**, not the
   session. Pricing is server-side, so no amount tampering — but it is an ID
   oracle. **More pressing now that Stripe is live (real payments, see External
   services)** — still not a payment-amount risk, but worth deriving from the
   authenticated session before this gets more traffic.
5. **No security headers** — no CSP, HSTS, X-Frame-Options or Referrer-Policy in
   `next.config.ts`. A CSP would also blunt any future XSS.
6. **Preview deployments share the production `DATABASE_URL`.** A preview URL can
   write real user data. Override it for the Preview environment in Vercel. More
   pressing now that `test` is used routinely.

**Rate-limit coverage is 3 of 50 routes** (`cv-upload`, `applications/guest`,
`logo-upload`). Every public unauthenticated route that writes or costs money
should have it; the pattern is reactive-per-route, which is exactly how the logo
hole stayed open. `rate-limit.ts` fails **open** (a DB that can't serve the
counter can't serve the request either), so it is not a defence during an outage.

---

## Open items / TODO

Numbered as one list (the old one restarted at 2 halfway down — merged here).

1. ~~**Security backlog #1 — the AI-endpoint SSRF / unmetered spend.**~~
   **DONE** — `src/lib/cv-url.ts` allowlist + `enforceIpLimit` on both routes,
   shipped and verified against the real CV URLs in production. See the
   "readable job URLs" session below.
2. **Fix the position-picker dropdown z-index bug** (see the latest session
   section). Small, visible, employer-facing; reproduce before claiming done.
3. **Fill in `src/lib/legal.ts`** — `registeredName` and `registeredAddress` are
   still blank, so the privacy policy and terms name the website rather than a
   legal person (the one thing GDPR's controller-identity rule asks for). Maxim
   has no company; a natural person is a valid controller — needs a full name and
   a postal address that receives mail (a service address is fine, it gets
   published). Trading as "CyprusTech.Careers" in Cyprus likely also needs a
   business name registered under Cap. 116 — an accountant settles that plus tax
   and VAT.
4. **Guest applications never exercised against real Supabase.** The single most
   important path on the site (what job seekers come to do) and it has never run
   for real — candidate tables are Supabase-served, so the scratch Postgres can't
   cover the insert. Submit one real guest application.
5. ~~Confirm Stripe end to end~~ **DONE — Stripe is now live (not test mode)**,
   confirmed with a real card and a `credited` webhook log. See External
   services / env and the Google go-live session above.
6. **Preview `DATABASE_URL`** — override it for the Preview environment in Vercel
   (security backlog #6). Live risk now that `test` is used routinely.
7. **No error monitoring** (no Sentry or equivalent). A crash in the apply flow
   is invisible unless a user reports it. Given #4, higher priority than it looks.
8. Delete the **eight** stale `claude/*` branches on GitHub (sandbox can't —
   proxy rejects deletes): `analyze-design-system-Y5y44`,
   `compact-card-layout-92qmqy`, `connect-database-7OQd6`,
   `connect-database-MZ1XL`, `cyprus-tech-jobs-context-elmi9o`,
   `cyprus-tech-jobs-repo-s9ar6h`, `context-md-review-8yvpxp` and
   `cyprus-tech-jobs-context-nrt0cp`. All superseded / contained in `main`.
   Enumerate with `git ls-remote origin` before deleting — the count has grown
   every time this list was written down; see Branches history for why.
9. **Status colours have no dark-mode variants.** `--success-bg`, `--warning-bg`,
   `--error-bg`, `--info-bg` stay pale on dark surfaces — visible on
   `/style-guide` in dark mode.
10. `employers/dashboard/page.tsx` holds all 9 remaining lint errors (`any`,
    `prefer-const`). Untouched for several sessions; worth a cleanup pass.
11. `src/app/employers/login/LoginForm.tsx` is dead code (nothing imports it; the
    page just redirects). Safe to delete.
12. Re-check FCP/LCP in Vercel Speed Insights now that `dub1` is confirmed live.
13. Editing a legacy listing with no salary now forces one to be added — a
    consequence of the mandatory-salary change worth watching for.
14. The SEO items listed as "still open" above.
15. **Release the GA4 client-side page-view fix.** `test` is one commit ahead of
    `main` (`234ba8c`); until it ships, production GA4 undercounts every visit to
    a single page view, so don't read anything into the numbers yet.

**DONE this session (was on the list):** `CRON_SECRET` confirmed set (item was
"must be set"); admin sign-in completed end to end (was "still never completed").

**DONE in the Google go-live / SEO session:** item 5 above (Stripe confirmed end
to end — live mode, not test); the "no role pages" and "sitemap omits
`/companies`/company profiles" SEO gaps (category landing pages shipped; company
profiles were already in the sitemap — that line was stale, see
`getCompanySlugs()` in `queries.ts`); favicon was not on this list but is fixed
(see that session's section). **NOT done, still open:** items 1, 2, 3, 6, 7, 9,
10, 11, 13; item 8's branch list (unchanged); item 12 (FCP/LCP re-check).

---

## Working agreements

- **Commit to `test`. `main` moves only when Maxim explicitly asks to release**,
  and a release is `git merge --ff-only test`. See `AGENTS.md` — this line used
  to say "develop on a branch off `main`", which contradicted it.
- Don't open PRs unless asked.
- **A scratch Postgres beats guessing.** Postgres 16 is installed but refuses to
  run as root — `initdb`/`pg_ctl` under `su -s /bin/bash nobody` with a data dir
  in `/var/tmp` (not the scratchpad, which `nobody` cannot read), then
  `npx prisma db push --url …&sslmode=disable`. Prisma's adapter tries TLS
  otherwise. This is how the filter, sanitiser and employer-access checks were
  run against real queries rather than reasoned about. Note the candidate-side
  tables are Supabase-served, so anything touching them cannot be covered this
  way.
- Playwright is not a dependency; `npm i -D --no-save playwright` and launch with
  `executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"` (the
  bundled version expects a build number that is not installed). Remove it before
  committing so `package.json` stays clean. Scripts run from the scratchpad need
  `NODE_PATH=<repo>/node_modules` since Playwright is installed in the repo, not
  globally.
- **Vercel MCP for production checks.** `curl` to the live domain is proxy-blocked;
  use the Vercel MCP `web_fetch_vercel_url` tool. Fetch the **public** host
  (`www.cyprustech.careers`) not the `*.vercel.app` deployment URL — the latter is
  behind SSO and returns a 302 to a login page for assets. Handy trick: fetching
  the compiled CSS chunk confirms which build is actually live. Unauthenticated
  hits to gated routes are a cheap probe (`/api/cron/*` → 401 set / 503 unset).
- **DNS lives at Vercel** (nameservers `ns1/ns2.vercel-dns.com`), edited under
  Domains → cyprustech.careers → DNS. No DNS-**write** MCP tool exists, so DNS
  changes are Maxim's to make; read/verify with Python `dnspython` (resolve
  against `8.8.8.8` to dodge stale local caching). Watch the classic Vercel
  gotcha: enter a subdomain host as just the label (`google._domainkey`), never
  the FQDN, or it becomes `…​.cyprustech.careers.cyprustech.careers`.
- Verify UI changes visually before committing — run the app and screenshot with
  Playwright (`playwright-core` + `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`,
  `--no-sandbox`). For auth-gated or wizard UI, a temporary throwaway route that
  renders the component with stub props works well; delete it before committing.
- Watch for **stale dev servers holding a port** — a screenshot that comes back
  unstyled or showing removed content usually means an old server is serving a
  previous build whose asset hashes no longer exist. Start on a fresh port.
  This bit hard again this session: a security fix appeared *not* to work because
  `next start` had silently failed to bind an occupied port, so the test hit the
  previous build. Kill the old process by PID and confirm the new server's uptime
  before trusting a result. `pkill -f "next start"` is a trap — it matches the
  shell running the command and kills that instead.
- **Don't declare something fixed without exercising it.** Every claim in the
  session above came from running the thing: injected XSS payloads in a real
  browser, `set local role anon` to prove the RLS leak, measured pixel heights
  for the mobile filters. Three of those started as "this looks right" and turned
  out not to be.

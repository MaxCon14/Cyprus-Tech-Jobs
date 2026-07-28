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
- **Stripe (test mode)** — Standard `price_1TUCiXRupFe5vg1GnWRQ81Rl` (€9.99),
  Featured `price_1TUCirRupFe5vg1GvgLccOtB` (€14.99). Employers buy "slots"
  (`standardSlots` / `featuredSlots` on `Employer`); the webhook credits them via
  `src/lib/stripe-fulfill.ts`, with `SlotPurchase` as the idempotency log.

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

**Still open:** no 410 for expired listings (they return 200 + noindex);
`export const dynamic = "force-dynamic"` on job pages means no ISR; the sitemap
omits `/jobs/famagusta`, `/companies` and company profiles; no role pages or
role×city "money pages" (categories are query params only); no `hreflang` for
`el-CY`/`en-CY`; robots doesn't disallow filter query params.

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
   oracle.
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

1. **Security backlog #1 — the AI-endpoint SSRF / unmetered spend.** Top launch
   blocker; approach decided (restrict fetch URL to Supabase storage + rate
   limit, no sign-in requirement). See the Security backlog section.
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
5. **Confirm Stripe end to end** with test card `4242 4242 4242 4242` — checkout
   *and* the fulfilment webhook. Never tested; if broken, employers pay and get
   nothing.
6. **Preview `DATABASE_URL`** — override it for the Preview environment in Vercel
   (security backlog #6). Live risk now that `test` is used routinely.
7. **No error monitoring** (no Sentry or equivalent). A crash in the apply flow
   is invisible unless a user reports it. Given #4, higher priority than it looks.
8. Delete the **six** stale `claude/*` branches on GitHub (sandbox can't — proxy
   rejects deletes): `analyze-design-system-Y5y44`, `compact-card-layout-92qmqy`,
   `connect-database-7OQd6`, `connect-database-MZ1XL`,
   `cyprus-tech-jobs-context-elmi9o`, and `cyprus-tech-jobs-repo-s9ar6h` (the new
   one — see Branches history). All superseded / contained in `main`.
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

**DONE this session (was on the list):** `CRON_SECRET` confirmed set (item was
"must be set"); admin sign-in completed end to end (was "still never completed").

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

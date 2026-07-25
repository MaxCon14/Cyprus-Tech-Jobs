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

**Golden rule for new work: branch from `main`. Release by merging into `main`.**

### History — why this section used to say the opposite

Production previously tracked a stale `claude/*` branch while all real work
happened on another, so every release had to be promoted by hand in the Vercel
dashboard. That caused an incident: a chat branched off stale `main`
(`claude/compact-card-layout-92qmqy`) and promoted it, rolling production back
~43 commits and restoring the broken magic-link login. Resolved by promoting the
correct build, fast-forwarding `main`, and pointing Branch Tracking at `main`.
The stale branches (`claude/analyze-design-system-Y5y44`,
`claude/compact-card-layout-92qmqy`, `claude/connect-database-MZ1XL`) are dead —
they could not be deleted from the sandbox because the git proxy rejects branch
deletes (403), so **they may still exist on GitHub and should be deleted there**.
`claude/connect-database-7OQd6` is identical to an old `main` and is kept only as
a historical marker — don't build on it.

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
- Design tokens in `src/app/globals.css` — pink `--accent` `#FF3D7F`, Figtree
  sans, Fragment Mono. **Dark mode is `[data-theme="dark"]` on the root element,
  not `prefers-color-scheme`.**
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
- **Email**: Resend domain `cyprustech.careers` is verified, sending enabled,
  region `eu-west-1`. Sign-in codes are being **sent and delivered** — this was
  confirmed against Resend's delivery log, and sign-ins have succeeded.
  Two operational facts worth knowing:
  - **`hello@cyprustech.careers` has no inbox** (receiving is disabled on the
    domain). Mail to it **bounces**. If `ADMIN_EMAIL` is set to that address,
    admin sign-in codes can never arrive — point it at a mailbox that receives.
  - Mail to `@avocadots.com` is accepted by its server (Microsoft 365) but not
    reaching the inbox; Gmail delivery works fine. Investigation was stopped at
    the user's request.
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

## Open items / TODO

1. Delete the three stale `claude/*` branches on GitHub (sandbox can't — the git
   proxy rejects deletes).
2. **Status colours have no dark-mode variants.** `--success-bg`, `--warning-bg`,
   `--error-bg`, `--info-bg` stay pale against dark surfaces — visible on
   `/style-guide` in dark mode.
3. Re-check FCP/LCP in Vercel Speed Insights now that `dub1` is confirmed live.
4. Confirm Stripe end-to-end with a test card (`4242 4242 4242 4242`).
5. Editing an existing listing with no salary now forces one to be added — a
   consequence of the mandatory-salary change worth watching for on legacy jobs.
6. `src/app/employers/login/LoginForm.tsx` is dead code (nothing imports it;
   the page just redirects). Safe to delete.
7. The SEO items listed as "still open" above.

---

## Working agreements

- Develop on a branch off `main`; merge to `main` to release. See `AGENTS.md`.
- Don't open PRs unless asked.
- Verify UI changes visually before committing — run the app and screenshot with
  Playwright (`playwright-core` + `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`,
  `--no-sandbox`). For auth-gated or wizard UI, a temporary throwaway route that
  renders the component with stub props works well; delete it before committing.
- Watch for **stale dev servers holding a port** — a screenshot that comes back
  unstyled or showing removed content usually means an old server is serving a
  previous build whose asset hashes no longer exist. Start on a fresh port.

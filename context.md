# Project Context — CyprusTech.Careers

A running handoff of what this session touched, the deploy setup, and open items.
Read this first if you're picking up the project in a new chat.

---

## Branches & production

- **`main` is the source of truth and the production branch.** It holds all the
  work that used to live only on `claude/connect-database-7OQd6` (that branch was
  fast-forward merged into `main`; the two are identical).
- Vercel **Settings → Environments → Production → Branch Tracking** is set to
  `main`, so every push to `main` creates a Production Deployment automatically.
  "Auto-assign Custom Production Domains" is enabled, which keeps
  `cyprustech.careers` / `www.cyprustech.careers` attached to each new deploy.

**Golden rule for new work: branch from `main`.**

### History — why this section used to say the opposite

Production previously tracked a stale `claude/*` branch while all real work
happened on another, so every production release had to be promoted by hand in
the Vercel dashboard. That setup caused an incident: a separate chat branched off
stale `main` (`claude/compact-card-layout-92qmqy`) and promoted it, rolling
production back ~43 commits and restoring the broken magic-link login. It was
resolved by promoting the correct build, merging the work into `main`, and
pointing Branch Tracking at `main`. The manual-promotion step is no longer
needed — don't reintroduce it.

Stale branches left over from that period (`claude/analyze-design-system-Y5y44`,
`claude/compact-card-layout-92qmqy`, `claude/connect-database-MZ1XL`) are far
behind `main` and should not be built on.

---

## Stack & conventions

- **Next.js 16.2.4** (App Router, Turbopack). ⚠️ This project pins an unusual
  Next version — read `node_modules/next/dist/docs/` before writing Next code
  (per AGENTS.md). Docs live under `01-app/`.
- **Prisma 7 + `@prisma/adapter-pg`**, Postgres on **Supabase** (region
  `eu-west-1`, Ireland). Client in `src/lib/prisma.ts`.
- **Supabase Auth** — login is an **8-digit OTP code** flow
  (`src/components/ui/OtpCodeInput.tsx`, `src/app/login/LoginForm.tsx`). The old
  magic-link flow is deprecated and only survives on stale `main`.
- **Resend** for transactional email (`src/lib/resend.ts`).
- **Stripe** for listing-slot purchases (see below).
- Design tokens in `src/app/globals.css` (pink `--accent` #FF3D7F, Figtree sans,
  Fragment Mono). Brand: "CyprusTech.Careers".
- Styling is mostly inline styles using CSS custom properties; some responsive
  helpers are CSS classes in `globals.css`.

---

## External services / env

`.env` keys in use: `DATABASE_URL` (Supabase pooler, port 6543),
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`,
`NEXT_PUBLIC_APP_URL`, and Stripe keys:
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`,
`STRIPE_STANDARD_PRICE_ID`, `STRIPE_FEATURED_PRICE_ID`.

- **DB password** was reset to a known value and updated in Vercel
  `DATABASE_URL`; a bad/stale `DATABASE_URL` previously caused `P1000` auth
  failures at build.
- **Email deliverability**: production uses Resend as Supabase Auth's custom SMTP
  (`smtp.resend.com:465`, user `resend`, sender `hello@cyprustech.careers`).
  Domain `cyprustech.careers` DNS is on **Vercel** (moved from GoDaddy); Resend
  SPF/DKIM/MX records verified. Supabase's built-in email is rate-limited
  (~3–4/hr) — that's why custom SMTP was configured.
- **Stripe (sandbox/test)** price IDs:
  - Standard listing: `price_1TUCiXRupFe5vg1GnWRQ81Rl`
  - Featured listing: `price_1TUCirRupFe5vg1GvgLccOtB`
  - Pricing logic lives in `src/app/api/stripe/checkout/route.ts`
    (standard base €9.99, featured €14.99, with per-extra-slot pricing).
    Employers buy listing "slots" (`standardSlots` / `featuredSlots` on
    `Employer`); webhook `src/app/api/stripe/webhook/route.ts` credits them via
    `src/lib/stripe-fulfill.ts`. `SlotPurchase` model = idempotency log.
- **MCP connectors** (Supabase/Resend/Vercel/Stripe/GitHub) exist on the user's
  claude.ai account but were **not usable from the Claude Code sandbox** this
  session (the egress proxy blocks those hosts; connectors also weren't loaded
  in-session). DNS lookups DO work from the sandbox. GitHub MCP is scoped to
  `maxcon14/cyprus-tech-jobs` only.

---

## Performance notes

- FCP/LCP were ~3.09s on production while INP/CLS/FID were excellent → it was a
  **TTFB/server-response** problem, not client JS.
- Root cause: DB in Ireland (`eu-west-1`) but Vercel functions defaulted to
  `iad1` (US-East) → transatlantic DB round-trips.
- **Fix shipped:** `vercel.json` pins `"regions": ["dub1"]` (Dublin) to
  co-locate functions with the DB. Requires a redeploy to take effect; also
  check Vercel Settings → Functions → Function Region.
- Also done: `getJobs` uses an explicit `select` (drops the big `description`
  body + unused `category` relation); `getCategoriesWithCount` parallelized;
  `JobCard`/`SkillTag` moved to server components with tiny client islands so
  the ~300-entry skill-icon map (`src/lib/skill-icons.ts`) no longer ships to
  the browser on listing pages; Figtree trimmed to 4 weights; preconnect hints
  for icon CDNs.

---

## What this session changed (high level)

Auth/login: 8-digit OTP code input — fixed mobile overflow (8 boxes overflowed
narrow viewports) and made paste fill all boxes.

Employers / applicants panel (`src/app/employers/dashboard/ApplicationsPanel.tsx`):
- Full redesign for a non-technical hiring manager: tinted tray + lifted white
  cards, color-coded **"Set status"** decision bar (Reviewed/Shortlist/Reject),
  sentence-case sans typography.
- Removed the initial-letter avatar (candidates can't upload photos).
- Destination-aware profile-link labels (an X/Twitter URL in the free-form
  "portfolio" field now reads "X / Twitter", etc.) via `linkLabel()`.
- **Compact triage row by default**: each applicant is a dense row (name +
  one-line summary + quick ★/✕ + status pill + time); click to expand to
  contact, skills, document links, and the full decision bar. (This reconciled
  the "compact row" idea from the other chat onto the redesign.)

Candidate onboarding:
- CV autofill: "Autofill" button (enabled only when a CV was uploaded) parses
  the CV via Claude and fills work experience (`/api/candidates/parse-cv`).
- Inline edit of saved positions; edit form renders in place of the card.
- Scroll-to-top on every step change; tapping a skill chip no longer opens the
  mobile keyboard.
- Removed the initial-letter avatar / circular ring from candidate dashboard
  hero → left-aligned with a horizontal progress bar.

Jobs / apply:
- In-app application form now opens in a **centered modal** (was a squished
  sidebar); fixed the modal's inner scroll (flex `min-height:0`).
- "About the role" collapses on mobile past a height threshold with a
  "Read full description" toggle (`CollapsibleDescription.tsx`).

Post a job:
- Fixed the browser "leave site?" warning firing on successful **Post Job**
  (stale-closure race; a `leavingRef` bypasses the beforeunload guard on
  intentional navigation).

Home page:
- "Browse by category" grid now shows **real** per-category job counts (was
  hardcoded placeholders); FAQ left-aligned and full page-container width;
  removed a redundant "VIEW ALL" link.

Sitewide:
- Stripped decorative `→` arrows from button/link CTAs (kept purposeful icons
  like the Bell); role cards on `/get-started` are real buttons; job-seeker CTA
  retitled "Create job seeker account".

Reliability:
- Blog helpers (`src/lib/blog.ts`) fall back to the 3 static posts if the DB is
  unreachable, so a DB hiccup no longer fails the whole build (`/blog` used to
  hard-fail prerender).

---

## Open items / TODO

1. Re-check FCP/LCP in Vercel Speed Insights. The `dub1` region pin is now live
   in production (deployments report `regions: ["dub1"]`), so the transatlantic
   DB round-trips should be gone — the numbers just need confirming.
2. Confirm Stripe end-to-end with a test-mode card (`4242 4242 4242 4242`) once
   real keys are in Vercel; there's a dev-only `/api/stripe/test-credits`
   endpoint (blocked in production) for local testing without Stripe.
3. Delete the stale `claude/*` branches listed above so nothing branches off them
   by mistake.

**Done since this file was first written:** production restored, work merged into
`main`, Branch Tracking pointed at `main`, `dub1` pin live.

---

## Working agreements

- Develop on a branch off `main`; merge to `main` to release.
- Don't open PRs unless asked.
- Prefer verifying UI visually (Playwright screenshots of a static token-matched
  mock) before committing design changes.

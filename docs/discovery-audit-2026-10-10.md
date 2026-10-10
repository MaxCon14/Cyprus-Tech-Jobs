# CyprusTech.Careers discovery audit — 10 October 2026

## Scope and release status

This is a verified first release of the discovery work, not a certification that the entire product has completed end-to-end QA. Production ships from `main`, not the repository's default branch. Changes were built and checked on `test` first. The release PR records the final deployed commit and deployment.

Baseline production commit: `8269a59219380d901ba942b35d0137cae5df10a2`. Rollback deployment: `dpl_C1Vb55na6j6FfP1ivAc4EsWjMagq`.

Implemented commits include `2142714`, `a7b3068`, and `67bda40`. PR #7's expiry and sitemap work is incorporated in the ancestry and was reviewed for independent keyword OR and expiry OR conditions.

## Changes and evidence

| Finding | Severity | Change / status |
| --- | --- | --- |
| Status ACTIVE could outlive the expiry timestamp | High | Shared `activeJobWhere` / `isActiveJob` checks cover discovery queries, related jobs, counts, sitemap, structured data, application endpoints, and candidate saved-job availability. Boundary cases and both application endpoints pass regression tests. |
| Company directory publicly discoverable before launch | High | Public directory and profile routes return 404, company URLs leave sitemap/llms.txt, homepage CTA removed, job-detail company-profile CTA gated. Employer data and publishing infrastructure remain. Preview /companies returns 404. |
| Keyword search could be affected by expiry query composition | High | Separate nested expiry OR under AND preserves keyword OR, category parents/children, city and remote filters. Listing/count regression test passes; preview eToro search exposes 13 matching job links at inspection. |
| Guest alerts lacked a dependable ownership/consent boundary | High | Explicit opt-in, unconfirmed guest subscriptions, confirmation email and explicit confirmation POST, authenticated self-service lookup/deletion, preference validation, IP rate limit, and serialized duplicate lookup. Mocked guest flow and unauthenticated access tests pass. Real delivery remains unverified. |
| Alert delivery could advance despite a provider error | High | Check Resend errors before cursor update, use idempotency keys, exclude expired jobs, respect undisclosed salaries, and match category descendants. Failure/success regression tests pass. Durable outbox and cross-subscription deduplication remain open. |
| Salary disclosure and employer identity wrong in JobPosting | High | Emit salary only when disclosed; do not use an ATS application host as employer identity; preserve sanitized HTML description. Representative preview JSON-LD parses and contains required core fields. |
| Remote schema assumed Cyprus eligibility without recording it | High | Do not emit JobPosting for a fully remote role with no explicitly supplied eligible countries. The normal page remains indexable. A data-entry field/migration and editorial verification are needed to restore eligibility safely. |
| Salary guide claimed placeholder data was verified | High | Removed unsupported ranges, market medians, growth figures and tax assertions. Kept the URL and design tokens; supplied a useful offer-comparison checklist and official tax link. Preview page returns 200 with updated metadata. |
| Home and employer marketing used unsupported claims | Medium | Corrected salary promises, invented employer/market metrics and candidate-reach claims. No fabricated testimonials or partnerships added. |
| Employer CTA led anonymous visitors straight to login | Medium | /post-a-job now explains the product and links to employer onboarding/sign-in before authentication; existing authenticated publishing flow retained. Preview returns 200. |
| Pagination and faceted results shared indexable metadata | Medium | Paginated browse pages self-canonicalize; filters are noindex/follow. Repeated parameters normalize, invalid salaries are ignored, invalid or empty later pages return 404. Preview page 2 and invalid inputs checked. |
| Robots blocked rendering resources | Medium | Removed /_next/ disallow; canonical production sitemap retained. Preview robots response verified. |
| Saved/applied curated jobs lost employer names | Medium | Use the curated company-name fallback in candidate dashboard queries; historical application rows retained. Typecheck/lint pass; authenticated UI still needs browser verification. |
| External applications depended on a JavaScript-only button | Medium | Standard external/email links retain click tracking, work without hydration and clearly identify the external destination/new tab. Final preview HTML verification required before release. |
| Next.js dependency audit included a critical advisory | High | Updated Next.js and matching lint configuration to 16.4.0 with lockfile. No critical audit result afterward; 50 total advisories remained (18 high, 31 moderate, 1 low). This is not a clean security audit. |

## Verification

- Clean install with the committed lockfile; Prisma client generation succeeded.
- TypeScript and ESLint exit 0. Existing lint warnings remain, including image/script/navigation warnings.
- Nine regression tests pass: expiry boundaries; query composition; salary/organization schema; JSON-LD escaping; denied alert access; guest consent/confirmation; HTML/remote schema; expired application rejection; failed/successful digest delivery.
- Vercel production builds for test commits reached READY. Preview `dpl_Bc1PnNbuDXq5gzw4gWa9G9mVn3GP` and `dpl_C3vVXz9QqGE1PiPppb7kf45FwQpY` built successfully.
- Preview HTML checked for homepage, salary guide, employer landing, search, pagination, a category/city page and two job detail pages.
- Preview sitemap at inspection: 294 unique canonical URLs, no company URLs. Counts change as jobs are published. Production baseline sitemap was stale at 147 URLs; the database later held 102 active jobs.
- Preview company directory and enormous invalid page number return 404.
- Preview unauthenticated alert lookup returns 401.
- Preview error/fatal runtime-log query returned no groups during the observed checks. This is a limited observation window.
- Existing HTTPS/www redirects and public login/get-started noindex behavior were checked in the baseline.
- No existing production user records were edited; no database schema changes, mass emails, real applications or account permission changes were made.

## Limits and open work

1. **Full browser QA is incomplete.** The local execution service failed to start, and browser transport failed. HTTP-rendered HTML and source checks succeeded through the connected deployment service, but mobile screenshots, keyboard behavior, hydration, authenticated candidate/employer/admin flows and Core Web Vitals have not been certified.
2. **Email is not verified end to end.** Resend domain verification was confirmed; mocks validate control flow. Inbox placement, confirmation receipt, unsubscribe behavior under real delivery and bounce/webhook handling need an isolated test recipient/environment. Do not run the production digest as a test.
3. **Alert reliability needs a durable delivery record.** Current provider idempotency is helpful but is not exactly-once delivery. Overlapping subscriptions can repeat the same job; a process failure between provider acceptance and database update is not fully solved. Add a transactional outbox, stable batch payload, send-attempt state and measured retry policy. Add versioned consent/confirmation timestamps and a guest preference-management flow.
4. **Blog factual review remains open.** Six public article URLs were reachable. Source review found unsupported salary/market-share claims, salary-disclosure promises inconsistent with the product, and time-sensitive tax, immigration and pay-transparency assertions. Three articles are DB-backed overrides of static copies; editing the static file alone will not fix those pages. Do not treat this release as a factual endorsement of these articles. See the content roadmap for the evidence required before revision.
5. **Original employer posting dates and remote eligibility need editorial verification.** Stored publication timestamps are not proof of the original employer date. Do not refresh dates to make old vacancies appear new. Two remote records existed at inspection; confirm their geographic eligibility before adding Google Jobs markup.
6. **Remaining dependency advisories need targeted updates.** Production dependency audit also flagged Tiptap, sanitize-html and transitive packages such as ws/fast-uri/source-map-js. Prisma's suggested audit fix involved a major version change; do not apply `npm audit fix --force` blindly. Validate editor, uploads and database tooling after changes.
7. **Security/database review is partial.** Existing RLS was enabled. Tables with RLS but no public policy are not automatically broken and should not be opened to fix advisor notices. Authentication/storage ownership and every privileged endpoint still need dedicated review. The leaked-password-protection advisor warning was not changed.
8. **No search-performance baseline was available.** No ranking gain, traffic gain, Google Jobs acceptance, real-user CWV result or conversion uplift is claimed. Structured-data parsing is not Google's Rich Results Test certification.
9. **Telemetry needs interpretation.** An external apply click is intent, not a completed application. Provider acceptance is not proof of inbox delivery. Report these separately.

## Release and rollback procedure

Recheck that main is still the baseline ancestor of the tested head. Move main only by fast-forward with the expected old SHA. Wait for the production deployment to become READY, then check the canonical site's robots, sitemap, homepage, search, pagination, company 404, job schema and employer landing.

If smoke tests fail, restore the previous READY production deployment using Vercel rollback and revert the release through the normal test-to-main workflow. Do not delete jobs, reset database rows, force-push over newer work or roll back unrelated commits. There are no schema migrations in this release.

## 30 / 60 / 90-day growth plan

**Days 1–30: trust, indexing and measurement.** Complete browser and email QA; address high dependency advisories; correct the six existing articles with primary sources. Verify Search Console ownership, submit the canonical sitemap, inspect representative active/expired jobs, and distinguish indexed pages from excluded facets. Establish weekly metrics before setting numeric growth targets. Audit source vacancy availability and link destinations.

**Days 31–60: useful coverage and repeat visits.** Publish two or three researched content pieces from the roadmap, add contextual links to relevant active role/city pages, and collect employer-verified salary data with source dates and methodology. Improve confirmation and return-visit conversion using measured funnel drop-off. Implement reliable alert delivery and guest preference management before growing subscriptions.

**Days 61–90: evidence-led expansion.** Expand only categories/cities supported by real vacancies and useful original content. Seek employer interviews and relevant editorial links through individually approved outreach. Compare cohorts and search queries, improve weak landing pages, and evaluate employer signup-to-first-post conversion. Consider Google's JobPosting Indexing API only with verified Search Console access and a reliable lifecycle event queue.

## Success metrics

| Metric | Definition / baseline |
| --- | --- |
| Organic impressions, clicks, CTR, average position | Search Console; split branded/non-branded, page type and query intent. Establish a 28-day baseline; compare matching periods. |
| Valid indexed job URLs | Search Console coverage and sampled URL inspection; compare with genuinely active inventory, not total database rows. |
| Job application clicks | Deduplicated external apply clicks by role and source; distinguish from completed in-app applications. |
| Candidate registrations | Successful verified account creation, not onboarding visits or guest candidate records. |
| Employer activation | Verified employer registration → first valid published job; report conversion and elapsed time. |
| Alert activation | Confirmed subscriptions / valid opt-in requests; track pending confirmation and errors separately. |
| Alert reliability | Accepted, delivered, bounced, complained, unsubscribed and repeated-job rates; never expose recipient addresses in public reports. |
| Repeat visits | Consented analytics cohort retention and return sessions; distinguish email-driven and organic returns. |
| CWV | Mobile field p75 LCP, INP and CLS when sufficient traffic exists; use lab data for diagnosis, not a field-performance claim. |

Technical references: [Google JobPosting documentation](https://developers.google.com/search/docs/appearance/structured-data/job-posting), [Next.js robots metadata](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots), [Next.js 16.4 release](https://nextjs.org/blog/next-16-4).

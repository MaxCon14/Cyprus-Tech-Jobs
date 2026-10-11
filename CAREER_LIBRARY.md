# Career Library implementation and review

Branch: `feature/career-library`. Target: `main`. Merge and production deployment require owner approval.

## Delivered
Six database-backed published paths, 56 learning stages, 24 detailed portfolio projects and 90 distinct curated provider resources. Public catalog supports instant search and category/level filtering. Detail pages provide expandable sequential roadmaps, tasks, milestone completion, resource filters, project briefs, readiness checklists, actual active vacancies and related links.

Guest progress persists in this browser. Existing Supabase accounts store saved paths, stages, tasks and readiness across devices. Browser progress imports only after an explicit action. Account changes reload progress and in-flight requests cannot overwrite another account's state.

Existing navigation, branding, jobs components and admin authorization are reused. Career pages have server-rendered content, unique metadata, canonical and Open Graph URLs, breadcrumbs and sitemap entries. Preview deployments retain the site's noindex policy.

## Content management
Visit `/admin/careers` with the existing authorized admin account (`ADMIN_EMAIL`). Create/edit careers, publish/unpublish, edit SEO, reorder stages, maintain tasks/resources, assign stage resources, build projects and edit readiness. New careers use the same components. Saves validate HTTPS resource links and stable IDs, run atomically, reject stale concurrent edits and invalidate content caches. Unpublishing removes public content through RLS.

Resources are shared entities: editing a resource with an existing ID updates its uses across careers. Removing learning items intentionally cascades their progress. Keep stable IDs for ordinary text edits.

## Database
Additive `career_library` schema; existing public tables were not modified. These migrations have been applied to the connected Tech Jobs Cyprus project and content seeded:
- `20261011123837_career_library.sql`: normalized content, ownership FKs, indexes, RLS and atomic editorial writer.
- `20261011125458_career_library_documents.sql`: RLS-aware JSON document reader.
- `20261011134137_career_project_resources.sql`: include project-only starter resources in published resource visibility/documents.

`supabase/seed-careers.sql` seeds the six paths. It is for initial setup; re-running career saves can replace later editorial edits. Versioned JSON under `content/careers/` is seed material, not the frontend data source. Reads and writes use the existing Prisma database connection with scoped PostgreSQL roles; learner requests validate the existing Supabase user first. No privileged key is exposed to the browser.

## Changed files
- `src/lib/careers/{types,queries,validation}.ts`: data contracts, secure reads/writes and editorial validation.
- `src/components/careers/{CareerCatalog,LearningRoadmap,ResourceLibrary}.tsx`, `useCareerProgress.ts`: public interactions and persistence.
- `src/app/careers/`: catalog, detail, saved-learning pages, layout, CSS, loading/error/not-found.
- `src/app/api/careers/[slug]/progress/route.ts`: authenticated learner API with origin checks.
- `src/app/admin/careers/` and `src/app/api/admin/careers/route.ts`: authorized guided editor.
- `src/components/layout/Nav.tsx`, `src/app/admin/_components/AdminNav.tsx`, `src/app/sitemap.ts`: platform integration.
- `content/careers/`, `supabase/migrations/`, `supabase/seed-careers.sql`, `supabase/tests/career_library_rls.sql`: content and database history.
- `scripts/qa/career-library-{content,browser}.cjs`: repeatable focused QA.

## Verification
- TypeScript and targeted lint pass; repository lint has zero errors and 25 existing warnings.
- Preview production build succeeds.
- Six seeded career documents read correctly under anonymous RLS.
- SQL assertions verify owner progress persistence, cross-user read/write/delete denial, user reassignment denial and editorial write denial. Test changes roll back.
- Draft visibility and atomic editorial save were checked inside rollback transactions.
- Content QA validates all six seeds, counts and rejection of unsafe URLs, duplicate IDs and unknown resource references.
- Provider HTTP verification: 88/90 links returned HTTP 200. DataCamp and OpenIntro block automated requests (403/406); their exact official learning pages were confirmed separately.

Browser test coverage includes all six pages, search/combined filters/empty states, native roadmap expansion, projects, guest persistence, resource filtering, safe external links, SEO, sitemap, unauthorized API access, CSRF, 404s, responsive widths and existing homepage/jobs/city/blog routes. The account UI contract uses mocked responses; SQL checks use the real database.

## Review limits
A real signed-in cross-device browser session and authorized admin browser editing still need owner-account verification. No account credentials were requested or impersonated. Automated accessibility checks cover the Career Library; they are not a full-site WCAG certification. Field Core Web Vitals require post-release traffic and were not claimed. Resource access/pricing can change; no prices, ratings or unverified course durations were invented.

No main merge or live-site deployment was performed. The additive database schema/content exists in the shared project so the preview can be reviewed.

## Repeat checks
```sh
node scripts/qa/career-library-content.cjs
npx tsc --noEmit
npm run lint
# Install Playwright + axe in a temporary QA directory, outside production dependencies.
npm install --prefix /tmp/career-qa playwright@1.58.2 @axe-core/playwright@4.11.1
/tmp/career-qa/node_modules/.bin/playwright install chromium
CAREER_QA_NODE_MODULES=/tmp/career-qa/node_modules QA_PREVIEW_URL='protected-preview-share-url' node scripts/qa/career-library-browser.cjs
```
Run `supabase/tests/career_library_rls.sql` with an administrative connection in a test transaction; its inserts are rolled back.

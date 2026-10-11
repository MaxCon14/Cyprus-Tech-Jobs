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

Final browser regression passed on commit 5a1cb942 (preview deployment dpl_7pA9WBtd73MNca57mCdg29JpEtUr), including actual HTTP 404s, all five widths (360/390/768/1024/1440), sitemap, unauthorized admin, CSRF and existing-route smoke checks with no browser exceptions. Both catalog and roadmap passed light/dark axe checks with zero serious or critical findings. Desktop and mobile screenshots were visually inspected.

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

## Presentation revision following preview feedback

The library now uses role colors, tool/provider SVG marks served locally, interest-based browsing, a career journey overview, and a prominent next-stage action. A keyboard-accessible section navigator shows one focused panel at a time. Resource cards have tinted identity headers, functional external actions and links back to the right roadmap stage. Project cards preview the brief and tools before expansion. Native stage/project expansion, learner progress, existing auth, admin content and SEO remain integrated. Desktop/mobile spacing, responsive section labels and post-render scroll targets reduce reading and navigation effort.

No production release or database changes were needed for this presentation revision. Static logo files are traced to their catalog/provider sources in public/careers/logos/README.md; no runtime icon dependency was added.

Redesign regression passed on preview commit 441f41d5: all six career paths, functional provider logo assets, focused panels, interest filters, stage return links, guest persistence, next-stage actions, keyboard tabs, mocked account import/failure/isolation, every panel at 360/390/768/1024/1440px, sitemap, API permissions, 404s and existing routes. All six surfaces (catalog, roadmap, resources, projects, readiness, jobs) passed light/dark axe checks with zero serious/critical findings. TypeScript and scoped lint passed; the preview production build succeeded.

## Exact changed-file inventory

- `CAREER_LIBRARY.md`
- `content/careers/careers.json`
- `content/careers/resources.json`
- `public/careers/logos/README.md`
- `public/careers/logos/cisco.svg`
- `public/careers/logos/coursera.svg`
- `public/careers/logos/css.svg`
- `public/careers/logos/datacamp.svg`
- `public/careers/logos/docker.svg`
- `public/careers/logos/excel.svg`
- `public/careers/logos/express.svg`
- `public/careers/logos/figma.svg`
- `public/careers/logos/frontendmentor.svg`
- `public/careers/logos/git.svg`
- `public/careers/logos/github.svg`
- `public/careers/logos/google.svg`
- `public/careers/logos/googlesheets.svg`
- `public/careers/logos/html.svg`
- `public/careers/logos/javascript.svg`
- `public/careers/logos/kaggle.svg`
- `public/careers/logos/material.svg`
- `public/careers/logos/mdn.svg`
- `public/careers/logos/microsoft.svg`
- `public/careers/logos/node.svg`
- `public/careers/logos/numpy.svg`
- `public/careers/logos/odin.svg`
- `public/careers/logos/openapi.svg`
- `public/careers/logos/opentelemetry.svg`
- `public/careers/logos/owasp.svg`
- `public/careers/logos/pandas.svg`
- `public/careers/logos/portswigger.svg`
- `public/careers/logos/postgresql.svg`
- `public/careers/logos/powerbi.svg`
- `public/careers/logos/python.svg`
- `public/careers/logos/react.svg`
- `public/careers/logos/redis.svg`
- `public/careers/logos/scikitlearn.svg`
- `public/careers/logos/streamlit.svg`
- `public/careers/logos/tryhackme.svg`
- `public/careers/logos/typescript.svg`
- `public/careers/logos/ubuntu.svg`
- `public/careers/logos/vercel.svg`
- `public/careers/logos/wireshark.svg`
- `scripts/qa/career-library-browser.cjs`
- `scripts/qa/career-library-content.cjs`
- `src/app/admin/_components/AdminNav.tsx`
- `src/app/admin/careers/CareerEditor.tsx`
- `src/app/admin/careers/[slug]/page.tsx`
- `src/app/admin/careers/editor.css`
- `src/app/admin/careers/new/page.tsx`
- `src/app/admin/careers/page.tsx`
- `src/app/api/admin/careers/route.ts`
- `src/app/api/careers/[slug]/progress/route.ts`
- `src/app/careers/[slug]/page.tsx`
- `src/app/careers/careers.css`
- `src/app/careers/error.tsx`
- `src/app/careers/layout.tsx`
- `src/app/careers/not-found.tsx`
- `src/app/careers/page.tsx`
- `src/app/careers/saved/loading.tsx`
- `src/app/careers/saved/page.tsx`
- `src/app/sitemap.ts`
- `src/components/careers/CareerCatalog.tsx`
- `src/components/careers/CareerVisuals.tsx`
- `src/components/careers/LearningRoadmap.tsx`
- `src/components/careers/ResourceLibrary.tsx`
- `src/components/careers/useCareerProgress.ts`
- `src/components/layout/Nav.tsx`
- `src/lib/careers/queries.ts`
- `src/lib/careers/types.ts`
- `src/lib/careers/validation.ts`
- `supabase/migrations/20261011123837_career_library.sql`
- `supabase/migrations/20261011125458_career_library_documents.sql`
- `supabase/migrations/20261011134137_career_project_resources.sql`
- `supabase/seed-careers.sql`
- `supabase/tests/career_library_rls.sql`

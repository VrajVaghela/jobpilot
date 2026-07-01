# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

### Current Status

**Phase:** Phase 5 — Dashboard
**Last completed:** 17 Analytics Charts — Real Data
**Next:** None (Phase 5 and all project phases complete)

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [x] 07 AI Profile Extraction from Resume
- [x] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [x] 09 Find Jobs Page — Full UI
- [x] 10 Adzuna Job Discovery
- [x] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [x] 12 Job Details Page — Full UI
- [x] 13 Company Research Agent

### Phase 5 — Dashboard

- [x] 14 Dashboard Page — Full UI
- [x] 15 Stats Bar — Real Data
- [x] 16 Recent Activity — Real Data
- [x] 17 Analytics Charts — Real Data

---

## Decisions Made During Build

- **01 Homepage** — Switched root layout font from Geist to **Inter** via `next/font/google` with `variable: "--font-sans"` (per ui-rules), applied on `<html>`.
- **01 Homepage** — Did not install `lucide-react`; the landing design is icon-light, so no new dependency was needed.
- **01 Homepage** — All section/CTA background washes use `radial-gradient` built from CSS color tokens (`--color-accent-light`, `--color-info-light`, `--color-accent-muted`, `--color-surface`) — no raw hex. Card frames use the box-shadow from ui-tokens.
- **01 Homepage** — CTAs (Get Started / Find Your First Match) link to `/login` for now; auth-aware redirect (→ /dashboard when logged in) deferred to feature 02.
- **01 Homepage** — Used `@/public/...` static imports with `next/image` for logo and screenshots (auto width/height, no layout shift).
- **02 Auth** — Package is `@insforge/sdk@1.4.3` (SSR helpers under `@insforge/sdk/ssr`); the context files' `@insforge/ssr` package does not exist. Corrected architecture.md, library-docs.md, code-standards.md to match the real API.
- **02 Auth** — OAuth is **server-driven**: `signInWithProvider()` Server Action → `signInWithOAuth(..., { skipBrowserRedirect: true })` → stash `codeVerifier` in httpOnly cookie → redirect to provider → `/auth/callback` Route Handler exchanges `insforge_code` via `exchangeOAuthCode()` and sets session cookies. SSR browser client does NOT auto-exchange.
- **02 Auth** — Next.js 16 renamed middleware → **`proxy.ts`** (named `proxy` export). Route protection = `updateSession()` (refresh) + cookie-presence redirect, plus a `getCurrentUser()` guard in `app/dashboard/layout.tsx` (defense in depth).
- **02 Auth** — Session cookies: `insforge_access_token` (readable bearer) + `insforge_refresh_token` (httpOnly), set by the SDK helpers. `/api/auth/refresh` = `createRefreshAuthRouter()`.
- **02 Auth** — `getCurrentUser()` (not `getUser()`); user shape is `{ sub, email, role }`.
- **02 Auth** — `proxy.ts` casts Next's cookie stores to the SDK's `CookieStore` (commented) — a structural-typing quirk in an unused `set()` overload; matches the SDK's documented usage.
- **02 Auth** — Built a minimal `/dashboard` placeholder (email + Sign Out) to make the flow testable now; replaced by the real dashboard in feature 14.
- **02 Auth** — DEPENDENCY (manual, InsForge dashboard): Google + GitHub providers are enabled, but `allowedRedirectUrls` is empty — `http://localhost:3000/auth/callback` must be added there before OAuth login will succeed at runtime.
- **Analytics provider removed** — Dashboard analytics should be sourced from InsForge tables (`jobs`, `agent_runs`) rather than a third-party event platform. No analytics SDK/client files should be added.
- **05 Profile Page — Full UI** — Created the entire Profile page layout and UI matching the design specs, including interactive state management that dynamically updates the circular `CompletionIndicator` score (starts at 70%) as fields are modified.
- **05 Profile Page — Full UI** — Implemented both `ResumeUpload` (dashed dropzone) and `ResumePreview` (renders parsed document metadata and dynamic text preview block) toggled via client state.
- **05 Profile Page — Full UI** — Updated the `Navbar` to dynamically underline active nav links (`Dashboard`, `Find Jobs`, `Profile`) on hover and selection using a client-side pathname check.
- **06 Profile Save Logic** — Created Server Actions in `actions/profile.ts` for saving profile data (doing on-demand upserts and sanitizing/mapping form fields like experience count and text arrays for seeker preferences) and handling resume file uploads/deletions (uploading PDFs <= 5MB to `resumes/{user_id}/resume.pdf` in InsForge Storage and saving URLs in the DB).
- **06 Profile Save Logic** — Updated the `app/profile/page.tsx` route to query `profiles` by user ID and pass it down as initial props, falling back to a clean default state with only email pre-filled.
- **06 Profile Save Logic** — Fixed the `CompletionIndicator` component to show a green success checkmark icon instead of a red warning/alert icon when the profile reaches 100% completeness.
- **07 AI Profile Extraction from Resume** — Created Route Handler at `app/api/resume/extract/route.ts` to download PDF resumes from storage, parse them using the class-based API of modern `pdf-parse` (v2.4.5), and extract structured profile JSON via the Gemini API.
- **07 AI Profile Extraction from Resume** — Used `gemini-2.5-flash` as it is fully compatible with the new secure `AQ.` API key format in the `v1beta` endpoint (which threw a 404 for `gemini-1.5-flash`).
- **07 AI Profile Extraction from Resume** — Added a loader, extraction success banners, and action triggers to `ResumePreview.tsx` and `ProfileClient.tsx`.
- **08 Resume PDF Generation from Profile** — Created Route Handler at `app/api/resume/generate/route.tsx` utilizing `@react-pdf/renderer` and Gemini 2.5 Flash to polish professional summary and bullet points on-the-fly, generating a clean single-page PDF structure and saving it to InsForge storage.
- **08 Resume PDF Generation from Profile** — Used `.tsx` extension for route to support JSX PDF layout elements and adjusted `next.config.ts` to declare `@react-pdf/renderer` as a `serverExternalPackages` dependency.
- **08 Resume PDF Generation from Profile** — Resolved a bug where react-pdf's `toBuffer()` returned a stream rather than a raw buffer in Next.js server context, leading to corrupted PDF uploads. Stream is now read into chunks, concatenated, and cast to `Uint8Array` for upload.
- **10 Adzuna Job Discovery** — Created `lib/adzuna.ts` with country code mapping and search service helpers, `agent/adzuna.ts` managing runs, log records, and batch Gemini 2.5 Flash matching (concurrency = 3), and POST `/api/agent/find` route handler. Wired `<SearchControls />` client form to submit requests and trigger Next.js page refresh fetching real `jobs` records.
- **11 Filter + Sort + Pagination** — Connected filter dropdowns (All, Strong, Good matches), sort order dropdowns (Match Score, Newest, Oldest), text search filter, and page controls to database queries on the server. Applied a client-side 300ms debounce on search input changes and reset page indices to 1 on filter/sort changes.
- **12 Job Details Page — Full UI** — Created the dynamic details page `app/find-jobs/[id]/page.tsx` and linked jobs table roles to it. Styled the page to match `job-details.png` layout. Resolved truncated description texts from the Adzuna API using a bottom fade-out gradient overlay and a direct link to the original listing.
- **13 Company Research Agent** — Added `agent/research.ts` orchestrator that derives the employer homepage URL by following the Adzuna `redirect_url` (stripping subdomains, falling back to `www.{company}.com`), opens a single Browserbase session via Stagehand v3 (model `openai/gpt-4o`), extracts the homepage + up to 3 same-domain sub-pages (sorted by kind priority: engineering > product > about > blog > team > careers > other), closes the session, and synthesizes the 9-field dossier with Gemini 2.5 Flash (`temperature: 0.4`) using a `responseSchema`. Wrote `lib/browserbase.ts` + `lib/stagehand.ts` thin helpers and `POST /api/agent/research` route (auth + ownership check + idempotency short-circuit when `company_research` already exists). Built `components/job-details/CompanyResearch.tsx` Client Component that renders empty state + button, in-flight spinner card, dossier with sectioned rendering for all 9 fields (Your Edge in accent + emerald dots, Gaps to Address in amber, Smart Questions in accent, Sources as small links), and inline error + Retry on failure. Replaced the inline Company Research card markup in the details page.
- **13 Company Research Agent** — Stagehand v3 API uses `model: { modelName, apiKey }` (not v2's `modelName` + `modelClientOptions`), `stagehand.extract(instruction, schema)` lives on the Stagehand instance, the page comes from `stagehand.context.pages()[0]`, and `page.goto()` takes `timeoutMs` (not `timeout`).
- **13 Company Research Agent** — Stayed on Gemini 2.5 Flash for synthesis (matches the Adzuna scoring pattern) while Stagehand uses `gpt-4o` for its browser reasoning — added `OPENAI_API_KEY`, `BROWSERBASE_API_KEY`, `BROWSERBASE_PROJECT_ID` as required env vars. The agent always writes a dossier — if browser research fails or Browserbase is unconfigured, Gemini synthesizes from the job posting and profile alone with an empty `sources` array.
- **14 Dashboard Page — Full UI** — Installed `recharts` (using `--legacy-peer-deps` to preserve React 19 / Next.js 16 environment). Designed client chart components (`ResumeTailoringChart.tsx`, `JobsFoundChart.tsx`, `MatchScoreChart.tsx`) styled precisely with design token colors (stroke width, grids, font size, axes) and embedded custom tooltips. Created `components/dashboard/DashboardClient.tsx` client wrapper rendering the top welcome header, custom action links (`/find-jobs`, `/profile`), 4 stat cards with green growth badges, recent activity list (5 entries) using custom activity dots (outer-ring + inner-dot), and the 3 dynamic charts imported with `ssr: false` to eliminate hydration mismatch warnings. Overwrote `app/dashboard/page.tsx` as a Server Component querying `profiles` table to fetch `is_complete` status, rendering Navbar, DashboardClient, and Footer in-line.
- **15 Stats Bar — Real Data** — Extracted the inline stats cards from `DashboardClient` into a modular `components/dashboard/StatsBar.tsx` component. Configured parallel query execution (`Promise.all`) inside the server component `app/dashboard/page.tsx` to retrieve: user's total jobs count, matching scores to calculate average match rate in JS, count of researched jobs (`company_research` not null), and count of jobs created within the last 7 days. Omitted dynamic trend badges to optimize DB overhead, setting static subtitles instead.
- **16 Recent Activity — Real Data** — Wired recent activity feed to real database records. Queried `agent_runs` table and `jobs` table (where `company_research` is not null) in parallel, merged them on the server, sorted by timestamp descending, and formatted them into human-readable strings with relative "time ago" timestamps on the server. Mapped activity types to custom dot styles (green for successful discovery runs, blue/purple for completed company research, red for failed runs) and handled the empty feed state.
- **17 Analytics Charts — Real Data** — Wired the three Recharts dashboard charts to live database data from the `jobs` table for the user. Calculated a 30-day timeline of daily job discovery counts, mapped match scores to 5 distribution brackets (absorbing any scores < 50% into the 50-60% bracket), and grouped company research activity by day of the week. Added a totalCount check to display clean fallback text overlays when no data points are present instead of rendering empty chart coordinates. Optimized queries by consolidating database reads into a single query of `id, company, found_at, match_score, company_research` from `jobs`.

---

## Notes

_Add notes here as the build progresses — workarounds, patterns, anything that differs from the context files._

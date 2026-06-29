# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 4 — Job Details Page
**Last completed:** 12 Job Details Page — Full UI
**Next:** 13 Company Research Agent

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
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — Real Data

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

---

## Notes

_Add notes here as the build progresses — workarounds, patterns, anything that differs from the context files._

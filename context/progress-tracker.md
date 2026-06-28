# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** 06 Profile Save Logic
**Next:** 07 AI Profile Extraction from Resume

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 Database Schema

### Phase 2 — Profile Page

- [x] 05 Profile Page — Full UI
- [x] 06 Profile Save Logic
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
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

---

## Notes

_Add notes here as the build progresses — workarounds, patterns, anything that differs from the context files._

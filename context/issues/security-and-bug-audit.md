# JobPilot — Security & Bug Audit

**Audit date:** 2026-07-01
**Method:** 9-dimension review (auth/session, authz/tenant isolation, injection/XSS, secrets/leaks, file upload/DoS, business logic, concurrency/cost-abuse, CSRF/CSP/SSRF, config/dependencies). 130 candidate findings discovered, 74 confirmed after adversarial second-pass verification.

---

## Executive Summary

Overall posture is **moderate**. Per-user scoping (`.eq("user_id", user.id)`) is applied consistently across all sensitive queries, secret partitioning is correct (Adzuna/Gemini keys are server-only, only the InsForge `anon_` JWT is in `NEXT_PUBLIC_*`), PKCE OAuth is used, and every protected page has a page-level `getCurrentUser()` guard — these defense-in-depth choices materially mitigate several configuration mistakes below.

**Single most consequential issue:** `proxy.ts` (the Next.js 16 route-protection middleware) is listed in `.gitignore` and is **untracked in git** (`git ls-files proxy.ts` returns nothing). On any fresh clone or Vercel deploy, the middleware is silently absent — session refresh stops, defense-in-depth disappears (the per-page guards still hold, so there is no actual auth bypass today, but the protection narrows to a single layer).

**Recommended first 5 fixes (do in this order):**

1. **Un-ignore + commit `proxy.ts`** (`CFG-001 / AUTH-001`).
2. **Privatize the `resumes` bucket; stop persisting public URLs** (`IDOR-010`, `FIND-005`, `FIND-010`).
3. **Add agent-run idempotency + dedup + reaper** (`F4 + F5 + F6`).
4. **Rate-limit `/api/agent/find`, `/api/resume/generate`, `/api/resume/extract`** (`F1`, `F3`, `FIND-003`).
5. **Resolve Tailwind v4 vs AGENTS.md** (`DEP-001`) AND **fix `detectCountry` substring bugs** (`BUG-001`, `BUG-018`).

---

## Critical / High Severity

### AUTH-001 / CFG-001 — `proxy.ts` is gitignored and untracked

- **File:** `.gitignore:48`
- **Confirmed severity:** high
- **What:** The Next.js 16 middleware file `proxy.ts` (Next 16 renamed `middleware.ts` → `proxy.ts`) is listed in `.gitignore`. `git ls-files proxy.ts` returns empty — the file is genuinely untracked.
- **Why it matters:** On a fresh clone / Vercel deploy, middleware ships missing. `updateSession()` cookie refresh stops, and any future protected route added without a per-page guard is exposed.
- **Mitigated by:** existing per-page `getCurrentUser()` guards in `app/dashboard/layout.tsx:14`, `app/profile/page.tsx:15`, `app/find-jobs/page.tsx:50`, `app/find-jobs/[id]/page.tsx:43` — so no current auth bypass.
- **Fix:**
  ```bash
  # remove line 48 from .gitignore
  git add proxy.ts
  git commit -m "track proxy middleware"
  git check-ignore -v proxy.ts   # should be empty
  ```
  Do **not** rename to `middleware.ts` — `proxy.ts` is the correct Next 16 convention. Verify `next build` lists a Middleware/Proxy entry.

### IDOR-010 / FIND-005 — Generated resume PDF persists a public URL

- **File:** `app/api/resume/generate/route.tsx:400-417` (also `actions/profile.ts:199-207`)
- **Confirmed severity:** high
- **What:** The route correctly scopes auth/upload/DB-update by `user.id`, but calls `getPublicUrl(storagePath)` and writes the resulting **unsigned** URL into `profiles.resume_pdf_url`. The signed URL returned to the client is a façade.
- **Exploit:** anyone who learns the URL (log leak, profile-row exposure, sharing) can fetch the PDF — which contains full name, email, phone, location, work history, education — indefinitely.
- **Fix:** make the `resumes` bucket private; store only the storage key (`${user.id}/resume.pdf`) in `resume_pdf_url`; mint short-lived signed URLs on demand (the `createSignedUrl` pattern already exists at `actions/profile.ts:221-223`). Backfill existing rows.

### F4 — Concurrent agent runs (no idempotency lock)

- **File:** `agent/adzuna.ts:124-265`, `app/api/agent/find/route.ts:5-42`
- **Confirmed severity:** medium (originally proposed high)
- **What:** No DB or app-level lock prevents two concurrent `runJobDiscovery` calls per user. Two tabs / a script can double Gemini cost and create duplicate `agent_runs` rows.
- **Fix:**
  ```sql
  CREATE UNIQUE INDEX agent_runs_one_running_per_user
    ON agent_runs(user_id) WHERE status='running';
  ```
  In the route, catch unique-violation (Postgres `23505`) and return **409 Conflict**. Pair with the F6 reaper.

### F5 — `jobs` table has no `(user_id, source_url)` uniqueness

- **File:** `agent/adzuna.ts:217-242`
- **Confirmed severity:** medium (originally proposed high)
- **What:** Every Adzuna result is `.insert()`-ed with no upsert and no precheck. Re-running the same search inserts duplicates.
- **Fix:**
  ```sql
  CREATE UNIQUE INDEX jobs_user_source_url_uniq ON jobs(user_id, source_url);
  ```
  Switch to upsert with `ignoreDuplicates: true`. **Also** pre-fetch existing `source_url`s for the user and skip them **before** the Gemini scoring loop — the unique index alone only saves the DB write after Gemini tokens are already spent.

### F6 — Zombie `agent_runs` rows after process termination

- **File:** `agent/adzuna.ts:143-294`
- **Confirmed severity:** high
- **What:** Terminal-state updates (success at lines 271-278, failure at 285-291) live in try/catch. Vercel timeouts, OOMs, and mid-request deploys bypass both branches, leaving rows stuck at `status='running'` forever. Combined with F4's lock, this would permanently deadlock the user.
- **Fix:** Add a Vercel Cron route (`app/api/cron/reap-runs/route.ts`, every 1–5 min):
  ```sql
  UPDATE agent_runs
     SET status='failed', completed_at=NOW(), failure_reason='timeout_reaped'
   WHERE status='running' AND started_at < NOW() - INTERVAL '10 minutes';
  ```
  Set `export const maxDuration = 60` on `app/api/agent/find/route.ts`.

### DEP-001 — Tailwind v4 contradicts AGENTS.md policy

- **File:** `package.json:21,27`
- **Confirmed severity:** medium (originally proposed high)
- **What:** `AGENTS.md:137` mandates Tailwind 3.4. `package.json` pins `tailwindcss: ^4` and `@tailwindcss/postcss: ^4`. The whole codebase is committed to v4 idioms (`@import "tailwindcss"`, `@theme {}` block in `app/globals.css`, v4-only PostCSS plugin, no `tailwind.config.{js,ts}`).
- **Fix:** Reconcile. Either (a) downgrade to `tailwindcss: 3.4.17`, rewrite `globals.css` to v3 `@tailwind base/components/utilities`, create `tailwind.config.ts` with the `@theme` tokens, replace `@tailwindcss/postcss` with v3 PostCSS setup; OR (b) get explicit sign-off to update `AGENTS.md:137` to permit v4. Pick one.

---

## Medium Severity

### FIND-003 / F1 / F3 — No rate limit on AI/PDF endpoints

- **Files:** `app/api/agent/find/route.ts:5-42`, `app/api/resume/generate/route.tsx:267-453`, `app/api/resume/extract/route.ts`
- **Confirmed severity:** medium
- **What:** All three endpoints are auth-gated but unbounded. Each call burns shared Gemini quota and runs react-pdf / pdf-parse / batched Gemini scoring. A single user can drain quota for everyone, inflate the bill, or saturate Node CPU/memory.
- **Fix:**
  - Per-user token-bucket: e.g., 10/hour for `/api/agent/find`, 5/hour for `/api/resume/generate`, 5/hour for `/api/resume/extract`.
  - Idempotency on `/api/resume/generate`: hash the profile and skip Gemini + re-render when unchanged (add a `resume_generated_at` column).
  - Wrap `pdf(doc).toBuffer()` in `p-limit(3-5)`.
  - Hard `MAX_JOBS_PER_RUN = 20` in `agent/adzuna.ts:184` slicing before the batch loop.

### HDR-001 — No security response headers

- **File:** `next.config.ts:1-9`
- **Confirmed severity:** medium
- **What:** No CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, or HSTS configured. `proxy.ts` also doesn't add any.
- **Fix:** Add a `headers()` block in `next.config.ts`:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - Restrictive `Permissions-Policy`
  - CSP report-only first (`default-src 'self'`, `frame-ancestors 'none'`), iterate to allow InsForge + Gemini origins, then enforce.
  - HSTS only if the platform isn't already setting it.

### BUG-001 — `detectCountry` substring matching misroutes US queries to Canada

- **File:** `lib/adzuna.ts:23-42`
- **Confirmed severity:** high
- **What:** `loc.includes(" ca")` matches **every** "City, CA" US query (San Francisco, Los Angeles, San Diego, …) and short-circuits to Canada **before** the US default. `loc.includes(" in")` catches "jobs in Denver". `loc.includes("gb")` is even broader.
- **Fix:** Split on comma, inspect the last token, match against an explicit map of full country names + exact 2-letter ISO codes. Default to `"us"`. Drop the `"gb"` substring entirely.

### BUG-002 — Adzuna search hardcoded to page 1, 10 results

- **File:** `lib/adzuna.ts:75-77`
- **Confirmed severity:** medium
- **What:** No pagination parameter; combined with F5, repeated clicks duplicate the same 10 listings.
- **Fix:** Accept a `page` arg; loop pages up to a cap. Persist Adzuna's stable `job.id` in a new `external_id` column with a unique `(user_id, external_id)` index for dedup that survives `redirect_url` rotation.

### BUG-003 — All Adzuna results saved regardless of match score

- **File:** `agent/adzuna.ts:217-263`
- **Confirmed severity:** medium
- **What:** Failed-Gemini sentinels (`matchScore: 0, matchReason: "Error occurred during matching."`) and genuinely low scores are persisted, polluting the dashboard.
- **Fix:** Skip insertion when `matchReason === "Error occurred during matching."` (extract as a shared constant `MATCH_ERROR_REASON`), and apply a threshold (e.g. `matchScore >= 50`). Log the skip via `logAgent`.

### BUG-005 — Salary formatting produces "$NaNk"

- **File:** `agent/adzuna.ts:93, 226-228`
- **Confirmed severity:** medium
- **What:** `Math.round(job.salary_max! / 1000)` runs even when only `salary_min` is set, producing `"$80k - $NaNk"` in both the Gemini prompt and the persisted `salary` column.
- **Fix:** Extract a `formatSalary(min?, max?)` helper handling all four cases (both / min-only / max-only / neither). Drop the `!` non-null assertion.

### BUG-009 — `JobFilters` debounce race

- **File:** `components/find-jobs/JobFilters.tsx:109-121`
- **Confirmed severity:** medium
- **What:** Effect deps only `[searchValue]`; the timer closure holds a stale `searchParams`, so a fast match/sort change can be overwritten by the pending search push (lost filter state under rapid interaction).
- **Fix:** Add `searchParams` to the dep array (re-arm on URL change), or read `searchParams` from a ref inside `setTimeout`.

### BUG-015 — `?page` query not validated

- **File:** `app/find-jobs/page.tsx:56-93`
- **Confirmed severity:** low (originally proposed medium)
- **What:** `parseInt("abc", 10) → NaN`, then `query.range(NaN, NaN)`. Negative or huge values produce confusing empty states.
- **Fix:**
  ```ts
  const parsedPage = parseInt(resolvedParams.page || "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;
  ```
  After fetching `totalCount`, redirect to last valid page if `page > Math.ceil(totalCount/itemsPerPage)`.

### BUG-016 — `q` ILIKE not escaping `%`, `_`, `,`

- **File:** `app/find-jobs/page.tsx:72-74`
- **Confirmed severity:** low (originally proposed medium)
- **What:** Wildcards `%`/`_` in user input act as ILIKE meta-chars. A query containing `,` breaks the PostgREST `or()` filter syntax — e.g. searching `"Smith, Jones"` or `"Foo, Inc"` returns broken/empty results. No security impact (user_id scope holds), pure correctness.
- **Fix:** Escape PostgREST reserved chars (`,`, `(`, `)`, `\`) and LIKE wildcards (`%`, `_`) before interpolation, e.g.
  ```ts
  const safe = q.trim().replace(/[\\%_(),]/g, (c) => "\\" + c);
  ```

### BUG-025 / FIND-004 — PDF generation crashes on missing `highest_degree`

- **File:** `app/api/resume/generate/route.tsx:208-215, 291, 443`
- **Confirmed severity:** medium
- **What:** Guard uses OR; when `institution` is filled but `highest_degree` is null, `highest_degree.toUpperCase()` throws. Also `full_name.toLowerCase()` at line 443 throws if `full_name` is non-string. A throw after upload + DB write leaves storage/DB updated while client sees 500.
- **Fix:**
  - Conditionally render the degree line only when `highest_degree` is truthy, or coerce: `(profile.education.highest_degree ?? "").toUpperCase()`.
  - `String(profile.full_name ?? "resume").toLowerCase()`.
  - Compute `fileName` **before** storage upload/DB update to avoid inconsistent state.

### DOC-001 — Docs claim GPT-4o; code uses Gemini 2.5 Flash

- **Files:** `components/homepage/HowItWorks.tsx:14`, `context/architecture.md` (lines 12, 62-65, 154, 174, 188, 265, 412, 434, 454), `context/project-overview.md`, `context/library-docs.md`, `context/build-plan.md`, `context/code-standards.md`
- **Confirmed severity:** low (originally proposed medium)
- **What:** User-facing copy is wrong; contributor docs mislead; AGENTS.md says use OpenRouter+OpenAI SDK while code uses `@google/generative-ai` directly. Three-way inconsistency.
- **Fix:** Pick one provider, update homepage copy, sweep all `context/*.md` to match implementation, and either rewrite AGENTS.md guidance or migrate to OpenRouter. Standardize on `GEMINI_API_KEY`, drop the `GEMINI_AI_API_KEY` fallback.

---

## Low Severity & Quality

### Authentication / OAuth

| ID | File:Lines | Issue |
|---|---|---|
| AUTH-003 | `app/auth/callback/route.ts:6-33` | No `state` param / Origin/Referer check; passes possibly-undefined `codeVerifier` to `exchangeOAuthCode`. PKCE absorbs most risk. |
| AUTH-004 / SEC-008 | `actions/auth.ts:37-42` | PKCE verifier cookie missing `Secure` flag. Add `secure: process.env.NODE_ENV === "production"`. |
| AUTH-005 | `app/auth/callback/route.ts:10-33` | Verifier cookie not cleared on error redirect paths. Extract a `fail()` helper that builds redirect and deletes cookie on every exit. |
| AUTH-006 / SEC-009 | `actions/auth.ts:17-19` | Protocol defaults to `http`; origin derived from untrusted `Host` header. Source from env var `APP_ORIGIN` / `NEXT_PUBLIC_SITE_URL`. |
| AUTH-009 | `actions/auth.ts:17-24` | OAuth `redirectTo` derived from Host header without allowlist (host-header injection anti-pattern). |
| AUTH-014 | `app/(auth)/login/page.tsx:10-33` | Renders error banner for any `?error=...` value. Allowlist known codes (`oauth`, `oauth_init`). |
| AUTH-002 | `proxy.ts:1-39` | Cookie attributes for `insforge_access_token` / `insforge_refresh_token` not visible in repo (set by SDK). Manually verify via DevTools that they are `HttpOnly; Secure; SameSite=Lax`. |

### Authorization / Tenant Isolation (positive)

| ID | File:Lines | Issue |
|---|---|---|
| IDOR-006 | `app/find-jobs/page.tsx:66-95` | List query correctly scopes by user_id. Only weakness is the `.or()` injection covered in FIND-001 / BUG-016. |
| IDOR-011 | `app/profile/page.tsx:19-67` | Profile read scoped by `user.id`; resume URL displayed is a 1-hour signed URL (correct pattern). |

### Injection / Data Validation

| ID | File:Lines | Issue |
|---|---|---|
| FIND-001 | `app/find-jobs/page.tsx:72-74` | PostgREST `.or()` accepts unsanitized `q`. user_id scope prevents cross-tenant leakage, so this is a correctness/UX bug (LIKE wildcards `%`, `_`, commas break the filter), not a security hole. Sanitize before interpolation. |
| FIND-002 | `agent/adzuna.ts:88-99` | Indirect prompt injection via Adzuna text into Gemini `scoreJob`. Bounded by `responseSchema` (no tool calls, no shape escape) and React text escaping (no XSS). Hardening: wrap third-party fields in `<untrusted>` tags, truncate `job.description` to ~4-6k chars, clamp `matchScore` to [0,100]. |
| FIND-010 | `agent/adzuna.ts:217-236` | Adzuna response trusted without validation before DB insert. Use Zod for runtime validation; trim/cap lengths; validate `redirect_url` with `new URL()` + http(s) scheme allowlist. |
| FIND-011 | `app/api/resume/extract/route.ts:171-201` | No length cap on PDF text before Gemini prompt (token cost amplification). `text.slice(0, 50_000)` before prompt construction. |

### File Upload / DoS

| ID | File:Lines | Issue |
|---|---|---|
| FIND-001 (upload) | `actions/profile.ts:176-178` | File-type check uses spoofable client MIME. Add `%PDF` magic-byte sniff. Pass explicit `contentType: 'application/pdf'` to storage. |
| FIND-006 | `app/api/resume/generate/route.tsx:370-376` | Unbounded `Buffer.concat`; add running-size ceiling (~5MB) while collecting chunks. |
| FIND-007 | `components/profile/ResumeUpload.tsx:18-36, 54-61` | `handleFileChange` skips client-side type/size validation; `handleDrop` checks type but not size. Mirror checks via shared `validateResumeFile()` helper. |
| FIND-009 | `actions/profile.ts:180-182` | 5MB cap enforced at upload but not re-validated in extract route. Extract `MAX_RESUME_BYTES` constant and re-check `fileBlob.size` after `download()` in extract. Configure bucket-level max-object-size. |
| FIND-012 | `app/api/resume/generate/route.tsx:355-360` | Silent Gemini fallback hides outages. Add `polished: boolean` to response; emit metric. |
| FIND-008 | `app/api/resume/extract/route.ts:129-144` | **Positive:** `parser.destroy()` in `finally` correctly cleans up pdfjs worker. |
| F8 | `app/api/resume/generate/route.tsx:386-425` | Non-atomic upload + DB update; mostly self-healing because path is deterministic and previous DB value preserved on failure. |

### Information Disclosure / Secrets

| ID | File:Lines | Issue |
|---|---|---|
| SEC-002 | `.env.local`, `lib/insforge-client.ts` | `NEXT_PUBLIC_INSFORGE_ANON_KEY` is intentionally public. **Audit InsForge RLS policies** on every table (`profiles`, `jobs`, `agent_runs`, `agent_logs`) to confirm `auth.uid() = user_id`. |
| SEC-003 | `app/api/agent/find/route.ts:35-41`, `actions/profile.ts:147,195,217,270`, `app/api/resume/extract/route.ts:204`, `app/api/resume/generate/route.tsx:448` | Raw error messages echoed to clients (PostgREST/Gemini internals, user UUIDs). Return generic + log + correlation id. |
| SEC-004 | `app/api/resume/generate/route.tsx:377-383` | `pdfErr.message` leaked — return generic "Failed to generate resume PDF". |
| SEC-005 | `lib/adzuna.ts:53-58` | **Positive:** Adzuna keys correctly server-only, no `NEXT_PUBLIC_` leakage. |
| SEC-006 | `agent/adzuna.ts:173`, `app/api/resume/extract/route.ts:153`, `app/api/resume/generate/route.tsx:299` | Dead fallback `GEMINI_API_KEY \|\| GEMINI_AI_API_KEY`. Pick one canonical name; drop the fallback. |
| SEC-010 | `agent/adzuna.ts:53, 206, 245, 282` | `console.error` may include profile PII in error objects/messages. Hygiene only; wrap in a structured logger that strips known PII fields. |

### Business Logic / Correctness

| ID | File:Lines | Issue |
|---|---|---|
| BUG-004 | `agent/adzuna.ts:271-278` | `jobs_found` stores total Adzuna count, not matchedCount. Add separate `jobs_saved` column. |
| BUG-007 | `actions/profile.ts:43-95` + `components/profile/ProfileClient.tsx:47-96` | Duplicate `calculateCompleteness` logic — drift risk. Extract to `lib/profile-completeness.ts`. |
| BUG-010 | `app/api/agent/find/route.ts` | Race protection only client-side (`disabled={loading}`); multi-tab / direct API still races. Resolved by F4 server-side guard. |
| BUG-011 | `app/profile/page.tsx:74` | `userEmail={user.email}` is typed `string` but `user.email` can be undefined. Default to `""`. |
| BUG-012 | `app/profile/page.tsx:65`, `actions/profile.ts:223`, `app/api/resume/generate/route.tsx:430` | 1-hour signed URL expires while page is open. Add a `resignResumeUrl()` server action invoked on click / `visibilitychange`. |
| BUG-013 / F13 | `actions/profile.ts:258` | `storageError.message.includes("not found")` throws if `message` is undefined. Use `?.`. |
| BUG-014 | `agent/adzuna.ts:225` | Location fallback echoes raw user query string (e.g. searching `"CA"` persists `"CA"` as job location). Use `null` instead. |
| BUG-017 | `app/find-jobs/[id]/page.tsx:57-59` | Conflates not-found and DB error — both silently redirect. Use `notFound()` for missing rows, surface real errors. |
| BUG-018 | `lib/adzuna.ts:23` | `"gb"` substring matches Nigerian place names like "Ogbomosho". Use `\bgb\b` regex or drop the substring entirely. |
| BUG-019 | `agent/adzuna.ts:184-186` | `Promise.all` batches of 3 have head-of-line blocking. Use `p-limit(3)` for steady throughput. |
| BUG-020 | `actions/profile.ts:79-90` + `components/profile/ProfileClient.tsx:79-91` | Composite `EDUCATION` missing-field tag — split into `EDUCATION_INSTITUTION`, `EDUCATION_YEAR`. |
| BUG-021 | `components/profile/ProfileForm.tsx:67-72, 82-87` | Case-sensitive skill/industry dedup (`"React"` vs `"react"` both accepted). Compare via `.toLowerCase()`. |
| BUG-027 | `components/profile/ProfileClient.tsx:182` | `setProfile(data.profile)` wholesale-replaces, wiping pre-filled optional fields not in extract schema. Use `setProfile(prev => ({ ...prev, ...data.profile }))`. |
| BUG-028 | `lib/adzuna.ts:70-72` | `params.set("where", location)` uses untrimmed value while `normalizedLoc` is trimmed for the guard. Use `location.trim()`. |
| BUG-032 | `app/find-jobs/page.tsx:97-99` | DB error renders identically to empty state. Surface an error banner / trigger `error.tsx`. |
| BUG-035 | `agent/adzuna.ts:147` | Empty location → `detectCountry` returns `"us"` ignoring user's region. Fall back to `profile.location` before calling `detectCountry`. |
| BUG-036 | `app/find-jobs/page.tsx:106`, `app/find-jobs/[id]/page.tsx:93` | When Gemini fails, UI shows "0% Match Score" as if it's a model verdict. Render "Not scored" when `match_reason === MATCH_ERROR_REASON`. |

### CSRF / Headers / Clickjacking

| ID | File:Lines | Issue |
|---|---|---|
| CSRF-001 | `app/api/agent/find/route.ts:5-42` | No Origin/Referer/CSRF-token validation on raw POST. `SameSite=Lax` absorbs most cross-site attacks; remaining risk is subdomain confusion. Add Origin allowlist check + rate limit (covered by F1). |
| HDR-002 | `proxy.ts:1-39` | No `frame-ancestors` / `X-Frame-Options` for clickjacking. SameSite=Lax mitigates most cookie-bearing iframe attacks; still worth adding. Covered by HDR-001 fix. |

### Config / Dependencies / Tooling

| ID | File:Lines | Issue |
|---|---|---|
| CFG-002 | `package.json:9` | `"lint": "eslint"` lacks path arg. Change to `"eslint . --max-warnings=0"`. **Do NOT switch to `next lint`** — removed in Next 16. Flat config already present at `eslint.config.mjs`. |
| CFG-004 | `README.md` | Missing env vars / AI provider / `.env.local.example`. Add an "Environment Variables" section enumerating `GEMINI_API_KEY`, Adzuna keys, InsForge anon key acquisition steps. |
| DEP-002 | `package.json` | No `engines` field; `pdf-parse@2.4.5` requires Node `>=20.16.0 <21 \|\| >=22.3.0`. Add `"engines": { "node": ">=20.16.0 <21 \|\| >=22.3.0" }`. |
| TS-001 | many files (`agent/adzuna.ts:35,62,69,154,205,281`; `actions/profile.ts:152,232,275`; `components/profile/ProfileForm.tsx:50,57,110`; `components/profile/ResumePreview.tsx:8,197`; `app/api/resume/generate/route.tsx:141,143,149,150,185,301,315,334,372,373,377,446`; `app/find-jobs/page.tsx:102`) | Pervasive `: any` / `as any` despite `strict: true`. Replace `catch (err: any)` with `unknown` + `err instanceof Error`. Tighten ProfileForm `updateField` to `<K extends keyof ProfileData>(field: K, value: ProfileData[K])`. Enable `@typescript-eslint/no-explicit-any` as `warn`. |

---

## What's Solid (positive findings)

- **Per-user scoping is consistent** — every `.from('jobs')`, `.from('profiles')`, `.from('agent_runs')` query that reads sensitive data filters on `user.id`. No real IDOR vector in data access; the only "IDOR-like" issue is the public-URL persistence (IDOR-010).
- **Secret partitioning is correct** — `ADZUNA_APP_ID/KEY` and `GEMINI_API_KEY` are not `NEXT_PUBLIC_*`. Only the InsForge `anon_` JWT is in `NEXT_PUBLIC_INSFORGE_ANON_KEY` (correct pattern).
- **`pdf-parse` cleanup is correct** (`FIND-008` — `parser.destroy()` in `finally`).
- **Profile page resume display correctly uses a 1-hour signed URL** (`IDOR-011`).
- **Find-jobs base query is properly scoped** (`IDOR-006`).
- **PKCE-with-httpOnly-verifier** OAuth flow is the right pattern.
- **Page-level `getCurrentUser()` guards on every protected route** — defense in depth that successfully mitigates the gitignored `proxy.ts` issue.

---

## Recommended Remediation Order (top 5)

1. **Un-ignore + commit `proxy.ts`** (`CFG-001 / AUTH-001`) — two-line `.gitignore` edit + one commit. Restores middleware on deploy.
2. **Privatize the `resumes` bucket; stop persisting public URLs** (`IDOR-010`, `FIND-005`, `FIND-010`). Switch `resume_pdf_url` to store storage keys; mint signed URLs on read. Backfill rows.
3. **Add agent-run idempotency + dedup + reaper** (`F4 + F5 + F6` together). Partial unique index on `agent_runs(user_id) WHERE status='running'`, unique index on `jobs(user_id, source_url)` with pre-loop dedup against existing source URLs, Vercel Cron reaper at 1–5 min interval.
4. **Rate-limit `/api/agent/find`, `/api/resume/generate`, `/api/resume/extract`** (`F1`, `F3`, `FIND-003`). Per-user token bucket plus idempotency on generate (profile-hash short-circuit).
5. **Resolve Tailwind v4 vs AGENTS.md** (`DEP-001`) AND **fix `detectCountry` substring bugs** (`BUG-001`, `BUG-018`). Ends a policy/code disagreement and restores correctness for the largest user segment (US queries currently misrouted to Canada).

After these five, the medium list (security headers, salary NaN, debounce race, page validation, PDF education crash, doc accuracy) is straightforward cleanup; the low/quality tables fold into normal dev work.

---

## Audit Methodology

- **Discovery (parallel):** 9 dimension-specific reviewer agents, each reading the full source files for its dimension and producing structured findings via JSON schema.
- **Verification (per-finding):** every candidate finding handed to an independent adversarial verifier instructed to refute unless evidence is rock-solid. Verifiers re-read source files, checked for upstream mitigations, and adjusted severity up or down.
- **Outcome:** 130 candidates → 74 confirmed (56 rejected during adversarial verification, mostly for being already mitigated by upstream guards, framework defaults, or for overstating impact).
- **Synthesis:** confirmed findings re-clustered and prioritized in this report.

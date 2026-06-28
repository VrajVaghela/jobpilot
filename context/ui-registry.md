# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Baseline — Established 2026-06-28

[Note: established via `/imprint audit`. This is the canonical pattern for each
property. New components must match these. `ui-tokens.md` / `ui-rules.md` are the
source spec; where they disagreed, the audit resolved it below.]

| Property                 | Correct class                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| Card / frame radius      | `rounded-xl` (maps to `--radius-xl` = 16px — NOT `rounded-2xl`, which is Tailwind's un-tokenized default) |
| Button radius            | `rounded-md`                                                                                       |
| Avatar radius            | `rounded-full`                                                                                     |
| Card background          | `bg-surface`                                                                                       |
| Page background          | `bg-background`                                                                                    |
| Card border              | `border border-border`                                                                             |
| Card shadow              | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]`                            |
| Card padding             | `p-6` (content card) · `p-8` (auth / modal card variant)                                           |
| Primary button (in-app)  | `bg-accent text-accent-foreground rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90` |
| Landing CTA (variant)    | `bg-overlay-dark text-accent-foreground rounded-md px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90` |
| Secondary button         | `border border-border bg-surface text-text-primary rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-secondary` |
| Text — primary           | `text-text-primary`                                                                               |
| Text — secondary         | `text-text-secondary`                                                                             |
| Text — muted             | `text-text-muted`                                                                                 |
| Nav link (inactive)      | `text-sm font-medium text-text-dark transition-colors hover:text-accent`                          |
| Link hover               | `transition-colors hover:text-accent`                                                             |

**Resolved conflicts:**

- Radius: `rounded-xl` is canonical for cards/frames. `rounded-2xl` is banned (relies on Tailwind's default, not a token). Both currently render 16px, so this is a naming standard, not a visual change.
- Primary button: `bg-accent` (purple) is the in-app primary per `ui-rules`. `bg-overlay-dark` is a named landing-CTA variant only.
- Card padding: `p-6` for content cards; `p-8` reserved for auth/modal cards.
- Button padding: standard buttons `px-4 py-2`; prominent landing CTAs `px-5 py-2.5`.

**Fix list (deviations from baseline) — applied 2026-06-28:**

- `app/(auth)/login/page.tsx` — card `rounded-2xl` → `rounded-xl` ✓
- `app/dashboard/page.tsx` — card `rounded-2xl` → `rounded-xl` ✓
- `components/auth/OAuthButtons.tsx` — provider button `py-2.5` → `py-2` ✓
- `components/homepage/HowItWorks.tsx` — image frame missing `bg-surface` → added ✓

**Doc corrections — applied 2026-06-28:**

- `ui-tokens.md` Cards token now reads `rounded-xl` (was "rounded-2xl in Tailwind") ✓
- `ui-rules.md` Navbar inactive color now `text-text-dark` (#364153), was un-tokenized `#4A5565` ✓

---

## Components

### Layout

**Navbar** — `components/layout/Navbar.tsx`

- Wrapper: `w-full border-b border-border bg-surface`
- Inner: `mx-auto flex h-16 max-w-6xl items-center justify-between px-6`
- Logo: `next/image` from `@/public/logo.png`, `h-8 w-auto`
- Nav link: `text-sm font-medium text-text-dark transition-colors hover:text-accent`
- Dark CTA button: `inline-flex items-center justify-center rounded-md bg-overlay-dark px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90`

**Footer** — `components/layout/Footer.tsx`

- Wrapper: `mt-auto border-t border-border bg-surface`
- Inner: `mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row`
- Logo: `h-7 w-auto`; copyright: `text-xs text-text-muted`
- Footer link: `text-sm font-medium text-text-secondary transition-colors hover:text-accent`

### Homepage

**CtaButtons** — `components/homepage/CtaButtons.tsx` (shared primary + secondary CTA pair)

- Primary (dark): `inline-flex items-center justify-center rounded-md bg-overlay-dark px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90`
- Secondary (outline): `inline-flex items-center justify-center rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary`

**Hero** — `components/homepage/Hero.tsx`

- Section: `relative overflow-hidden`; pastel wash via absolute `-z-10` div using `radial-gradient(... var(--color-accent-light) / --color-info-light / --color-accent-muted ...)`
- Headline: `text-5xl font-bold leading-tight tracking-tight text-text-primary sm:text-6xl`
- Subhead: `text-base leading-relaxed text-text-secondary`
- Preview frame (reused pattern): `overflow-hidden rounded-xl border border-border bg-surface shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]` wrapping `next/image` `h-auto w-full`

**Features / HowItWorks** — `components/homepage/Features.tsx`, `components/homepage/HowItWorks.tsx` (two-column text + screenshot, mirrored order)

- Section: `mx-auto max-w-6xl px-6 py-20`; grid: `grid items-center gap-12 lg:grid-cols-2`
- Section heading: `text-3xl font-bold tracking-tight text-text-primary`
- Feature item title: `text-base font-semibold text-text-primary`; desc: `mt-1.5 text-sm leading-relaxed text-text-secondary`
- HowItWorks reverses columns with `order-1` / `order-2` at `lg`

**Testimonial** — `components/homepage/Testimonial.tsx`

- Section: `mx-auto max-w-3xl px-6 py-20 text-center`
- Eyebrow: `text-sm font-medium text-accent`
- Quote: `text-2xl font-medium leading-snug tracking-tight text-text-primary`
- Avatar: `h-12 w-12 rounded-full object-cover`; name `text-sm font-medium text-text-primary`; role `text-xs text-text-muted`

**CtaSection** — `components/homepage/CtaSection.tsx`

- Card: `rounded-xl border border-border px-6 py-16 text-center` with `radial-gradient(... var(--color-accent-light), var(--color-surface) ...)` background
- Heading: `text-3xl font-bold tracking-tight text-text-primary`

### Auth

**Login page** — `app/(auth)/login/page.tsx`

- Page wrapper (centered card layout): `flex min-h-screen items-center justify-center bg-background px-6 py-12`
- Auth card: `w-full max-w-sm rounded-xl border border-border bg-surface p-8 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]` (p-8 = auth/modal card variant)
- Heading: `text-xl font-semibold text-text-primary`; subhead: `mt-1.5 text-sm text-text-secondary`
- Error banner: `rounded-md border border-error/30 bg-error/5 px-3 py-2 text-center text-sm text-error`
- Fine print: `text-center text-xs text-text-muted`

**OAuthButtons** — `components/auth/OAuthButtons.tsx` (client; one `<form>` per provider, Server Action via `signInWithProvider.bind`, `useFormStatus` pending state)

- Provider button (full-width secondary): `inline-flex w-full items-center justify-center gap-3 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-60`
- Icons: inline SVG, `h-5 w-5` — Google uses official brand colors; GitHub uses `fill="currentColor"`
- Reusable pattern for any full-width OAuth/secondary action button

### CompletionIndicator

File: `components/profile/CompletionIndicator.tsx`
Last updated: 2026-06-28

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface` (card), `bg-error/5` (missing pills) |
| Border           | `border border-border` (card), `border border-error/25` (missing pills) |
| Border radius    | `rounded-xl` (card), `rounded-sm` (missing pills) |
| Text — primary   | `text-text-primary` |
| Text — secondary | `text-text-secondary`, `text-error` |
| Spacing          | `p-6` (padding), `gap-6` (flex items gap), `gap-2` (missing pills gap) |
| Hover state      | none |
| Shadow           | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]` |
| Accent usage     | `stroke-success` / `stroke-error` (circular progress ring stroke), `text-error` (warning labels) |

**Pattern notes:**
- Represents completeness score using SVG radial path and status colors.
- Missing required sections are tagged with warning pills for user focus.

### ResumeUpload

File: `components/profile/ResumeUpload.tsx`
Last updated: 2026-06-28

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface` (card), `bg-surface-secondary` (dropzone area), `bg-accent-muted` (upload icon wrapper) |
| Border           | `border border-border` (card), `border border-dashed border-border-muted` (dropzone) |
| Border radius    | `rounded-xl` (card & dropzone), `rounded-md` (buttons) |
| Text — primary   | `text-text-primary` |
| Text — secondary | `text-text-secondary`, `text-text-muted` |
| Spacing          | `p-6` (card padding), `py-10 px-4` (dropzone padding), `mt-6 border-t pt-4` (footer spacing), `gap-4` (footer gap) |
| Hover state      | `hover:bg-surface-tertiary` (dropzone hover), `hover:opacity-90` (generate button hover) |
| Shadow           | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]` (card), `shadow-sm` (buttons) |
| Accent usage     | `bg-accent text-accent-foreground` (generate button), `text-accent bg-accent-muted` (upload icon) |

**Pattern notes:**
- Drag-and-drop dropzone accepts PDF files up to 5MB.
- Prompts user to auto-generate a resume draft from details when empty.

### ResumePreview

File: `components/profile/ResumePreview.tsx`
Last updated: 2026-06-28

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface` (card & preview details), `bg-surface-secondary` (file container), `bg-red-100` (PDF icon) |
| Border           | `border border-border` (card, file container & preview container) |
| Border radius    | `rounded-xl` (card), `rounded-lg` (file & preview containers) |
| Text — primary   | `text-text-primary` |
| Text — secondary | `text-text-secondary`, `text-text-muted` |
| Spacing          | `p-6` (card & preview containers padding), `p-4` (file block padding) |
| Hover state      | `hover:bg-surface-secondary` (download button hover), `hover:underline` (remove button hover) |
| Shadow           | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]` (card), `shadow-inner` (preview container) |
| Accent usage     | `text-red-600` (PDF icon) |

**Pattern notes:**
- Renders file info and parsed content summary in a styled terminal code editor block (`font-mono text-xs text-text-dark bg-white`).
- Exposes quick actions like Remove and Download.

### ProfileForm

File: `components/profile/ProfileForm.tsx`
Last updated: 2026-06-28

| Property         | Class           |
| ---------------- | --------------- |
| Background       | `bg-surface` (card & inputs), `bg-surface-secondary` (work exp card) |
| Border           | `border border-border` (card, inputs, work exp card) |
| Border radius    | `rounded-xl` (card), `rounded-lg` (work exp card), `rounded-md` (inputs, buttons) |
| Text — primary   | `text-text-primary` |
| Text — secondary | `text-text-secondary`, `text-text-dark` |
| Spacing          | `p-6` (card padding), `p-4` (work exp card padding), `space-y-8` (sections spacing), `space-y-6` (work exp items spacing) |
| Hover state      | `hover:bg-surface-secondary` (add/remove buttons), `hover:opacity-90` (save button) |
| Shadow           | `shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]` (card), `shadow-sm` (buttons) |
| Accent usage     | `bg-accent text-accent-foreground` (save button), `text-accent` (add role link, tag text), `bg-accent-muted` (skill tags) |

**Pattern notes:**
- Comprehensive profile editor including basic, professional, experience, education, and preference fields.
- Provides interactive adding and deletion of skills, industries, and experience records.



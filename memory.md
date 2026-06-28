# Memory — Feature 03 Database Schema

Last updated: 2026-06-28 21:06 +05:30

## What was built

Created the InsForge persistence layer for JobPilot:

- `profiles` table with all architecture fields, `resume_pdf_url`, `resume_pdf_key`, timestamps, and RLS.
- `agent_runs` table with search inputs, status, counts, `error_message`, timestamps, and RLS.
- `jobs` table with structured job fields, `company_research` jsonb, `researched_at`, `updated_at`, timestamps, and RLS.
- `agent_logs` table with run/job linkage, log level validation, timestamps, and RLS.
- Private `resumes` storage bucket.

Also updated `context/progress-tracker.md` to mark Feature 03 complete and move the next step to Feature 05.

## Decisions made

- Use `CHECK` constraints for stable value sets instead of Postgres enums.
- Keep `profiles.id` as the auth user id and use it as the ownership key for that table.
- Keep `jobs.company_research` as the single dossier store rather than introducing a separate research table.
- Add `profiles.resume_pdf_key` so later storage operations can use the returned object key, not just the public URL.
- Add `jobs.researched_at` and `jobs.updated_at` to support dashboard analytics and later dossier updates.
- Add `agent_runs.error_message` so failed runs can be captured without parsing logs.
- Make the `resumes` bucket private/authenticated.

## Problems solved

- The workspace did not have `rg` available in the shell, so schema discovery had to fall back to PowerShell search commands.
- InsForge backend metadata showed the project started with no tables or buckets, so the schema had to be created from scratch.
- Verified the DDL by reading back each table schema and bucket state after creation.

## Current state

- All four database tables exist with RLS policies.
- The `resumes` bucket exists and is private.
- Feature 03 is done in the progress tracker.
- The app code has not yet been wired to use the new schema.

## Next session starts with

Start Feature 05: build the Profile page UI with mock data, following the established UI tokens and registry patterns. Then wire the profile save logic in the next feature after that.

## Open questions

- None for the schema itself.
- The remaining OAuth redirect URL issue in InsForge still needs the local callback URL added before end-to-end login can be fully verified again.

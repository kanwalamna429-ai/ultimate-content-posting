---
name: Phase 7 Publishing Engine Architecture
description: Key design decisions for the publishing engine — especially the Deno/Node.js split.
---

# Phase 7 — Publishing Engine Architecture

## Critical Deno/Node.js split

**Problem:** Supabase Edge Functions run in Deno. The platform adapters and `@google/generative-ai` SDK are Node.js-only — they cannot run in Deno.

**Solution:** Two-layer architecture:
- `supabase/functions/process-scheduled-posts/index.ts` — Deno Edge Function. Minimal orchestrator: queries due posts, calls Next.js Route Handler via `fetch()`, logs summary.
- `frontend/app/api/process-posts/route.ts` — Next.js Route Handler (Node.js). Does ALL heavy work: lock, generate AI content, call adapter, save result.

**Why:** Avoids Deno compatibility issues entirely. All adapter/AI code stays in Node.js.

## Required env vars
- `PROCESS_POSTS_SECRET` — shared secret protecting `/api/process-posts` (set in both Vercel and Supabase Edge Function secrets)
- `NEXTJS_SITE_URL` — Vercel deployment URL (set in Supabase Edge Function secrets)
- `POSTFLOW_ENCRYPTION_KEY` — 64-char hex for credential AES-256-GCM decryption (set in Vercel)
- `GEMINI_API_KEY` — for AI content generation (set in Vercel)
- `SUPABASE_SERVICE_ROLE_KEY` — for Edge Function to bypass RLS (set in Supabase Edge Function secrets)

## DB columns added (migration 007)
Added to `scheduled_posts`: `locked_at`, `locked_by`, `next_retry_at`, `published_at`, `error_code`
Added to `published_posts`: `scheduled_post_id`, `platform_post_id`, `platform_post_url`, `response_data`, `content`, `published_at`

## Retry schedule
- Attempt 1: +1 min, Attempt 2: +5 min, Attempt 3: +15 min → then status=failed
- Lock timeout: 10 minutes (stale lock reclaim)

## Idempotency
- `acquireLock()` uses `.eq('status', 'pending')` as atomic condition — prevents double-lock
- Published/failed/cancelled posts are skipped immediately
- Stale locks (>10 min) are released and reclaimed

## Content generation
- Scheduled posts are created with `metadata.content_pending = true` (placeholder content)
- `content-resolver.ts` detects this, loads `extracted_content` from DB, calls Gemini
- Generated content is saved back to `scheduled_posts` so retries skip regeneration
- Bookmark platforms → `generateDescription()`, others → `generateSocialPost()`

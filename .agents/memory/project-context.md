---
name: PostFlow Project Context
description: Full project overview, completed phases, tech stack rules, and next phase to build (Phase 7).
---

# PostFlow — Universal Content Distribution Platform

## Tech Stack
- Frontend: Next.js 15+ App Router, TypeScript, TailwindCSS, shadcn/ui
- Backend: Supabase (Auth, PostgreSQL, Storage, Edge Functions, Scheduled Jobs)
- AI: Gemini API
- Deployment: Vercel

## Architecture Rules

### NEVER USE
- Express, custom Node.js servers, API servers outside Next.js Route Handlers
- node-cron, cron, BullMQ, Redis, RabbitMQ
- Background workers, long-running Node processes
- WebSocket servers (unless explicitly required later)

### ALWAYS USE
- Next.js frontend
- Supabase backend services (Auth, PostgreSQL, Storage, Edge Functions, Scheduled Jobs)
- Vercel deployment

## Completed Phases
- Phase 1: Foundation & UI (auth, dashboard, all pages, dark mode, components)
- Phase 2: Database Architecture (all tables, RLS, migrations, triggers)
- Phase 3: URL Ingestion & Metadata Extraction (single/bulk import, OG/JSON-LD/meta parsing)
- Phase 4: AI Content Generation (Gemini API, prompt templates, all content types)
- Phase 5: Campaign Engine (campaign CRUD, scheduling, upfront publish record creation)
- Phase 6: Platform Expansion (Bluesky, Mastodon, Misskey, Pixelfed, Reddit, Tumblr, Dev.to, Hashnode, Diigo, Raindrop.io, Pocket, Instapaper — adapters, connection management, credential storage)

## Next Phase: Phase 7 — Publishing Engine

### Platform Adapters (lib/platforms/)
Files: bluesky.ts, mastodon.ts, misskey.ts, pixelfed.ts, devto.ts, hashnode.ts, reddit.ts, tumblr.ts, diigo.ts, raindrop.ts, pocket.ts, instapaper.ts

Each adapter exposes:
- validateConnection()
- publish()
- deletePost()

### Publishing Workflow
1. Load scheduled record
2. Generate content if missing
3. Upload image if required
4. Publish to platform
5. Save API response
6. Save published URL
7. Update status

### Retry System
- Attempt 1: +1 minute
- Attempt 2: +5 minutes
- Attempt 3: +15 minutes
- After 3 failures: status = failed

### Supabase Edge Function
Name: process-scheduled-posts
Responsibilities: find due posts, lock records, prevent duplicates, publish, save responses/logs, handle retries, update status
Requirements: idempotent, Deno-compatible, production-ready

### Logging
Track: publish attempts, responses, errors, retry events

## Phase 8 (Future) — Production Hardening
Security: credential encryption, CSRF, rate limiting, input validation, duplicate publishing prevention
Reliability: error boundaries, monitoring hooks, audit logs, health checks
Deployment: Vercel + Supabase production config

## Agent Rules (Critical)
1. Read entire repo before any change
2. Reuse existing architecture
3. Do NOT rewrite completed modules
4. Do NOT refactor unrelated files
5. Do NOT regenerate completed phases
6. Only modify files relevant to the requested phase
7. Show file paths before generating code
8. Explain impact before modifying architecture

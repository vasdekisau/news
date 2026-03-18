# ARCHITECTURE.md - System Architecture

## Architecture Pattern
- **SPA + BFF** - Single Page App with Backend-for-Frontend
- Frontend: Next.js (Cloudflare Pages)
- Backend: Cloudflare Workers (Hono)

## Layers

### Frontend (Next.js)
- Server components for initial load
- Client components for interactivity
- API calls to Workers

### API (Workers + Hono)
- Route-based handlers: `/articles`, `/preferences`, `/sources`, `/pdfs`, `/feed`
- D1 database queries
- Response: JSON

### Data (D1)
- SQLite database
- Tables: articles, device_preferences, content_sources, pdfs, jobs

## Data Flow
1. RSS sources → Worker (fetch) → D1 (store articles)
2. User → Frontend → Worker API → D1 (read/preferences)
3. User preference → Frontend → Worker → D1 (thumbs up/down)

## Entry Points
- **Frontend**: `frontend/src/app/page.tsx` (main feed)
- **Worker**: `workers/src/index.ts` (Hono app)

## Abstractions
- Routes: `workers/src/routes/*.ts`
- No ORM visible - direct D1 SQL queries
- Device-based preferences (no auth)

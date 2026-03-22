# News Vasdekis

## What This Is

A private, LLM-curated news aggregator that pulls content from RSS feeds and web sources into one fast, personalized reading feed. Articles are pre-processed so readers can consume full content without leaving the site. Designed for personal use only—no auth, no sharing, just a better news experience that's yours alone.

## Core Value

A single, personalized reading feed that learns your preferences through simple upvotes/downvotes with comments, presenting the most relevant news from across the internet in a fast, distraction-free interface.

## Requirements

### Validated

- ✓ RSS feed aggregation — fetch and parse feeds, store articles in D1
- ✓ Article scraping — extract full content from URLs with Playwright fallback
- ✓ AI content cleaning — LLM-powered boilerplate removal
- ✓ AI daily ranking — LLM ranks articles by importance within each day
- ✓ In-page article reading — full content visible without leaving site (expand/collapse)
- ✓ Thumbs up/down with comments — user feedback with sentiment analysis
- ✓ Topic extraction — AI extracts topics from feedback for interest tracking
- ✓ Source scoring — tracks which sources user likes/dislikes
- ✓ LLM personalization — reranks feed based on user preferences and interests
- ✓ Dark mode UI — mobile-first Tailwind design
- ✓ Day-grouped articles — collapsible day sections

### Active

- [ ] Fix API 1014 error — Worker route not accessible from browser
- [ ] Deploy frontend to Cloudflare Pages — make accessible globally
- [ ] Google Drive PDF sync — ingest Economist PDFs from Drive

### Out of Scope

- [User authentication] — Personal use only, device-based tracking is sufficient
- [Multi-user support] — Single-user private dashboard
- [Public sharing] — Private by design, no social features
- [Search functionality] — Preference-based curation replaces search

## Context

**Brownfield project** — Substantial existing implementation. Most features working, deployment incomplete.

**Existing infrastructure:**
- Worker API deployed to Cloudflare Workers
- D1 database with schema (articles, device_preferences, content_sources, etc.)
- Next.js 14 frontend (build succeeds, not deployed to Pages)
- Terraform config exists but Pages not configured

**Key issues to resolve:**
1. API 1014 error — Worker route returns error when accessed
2. Frontend not on Cloudflare Pages — only runs locally
3. PDF sync with Google Drive not implemented

## Constraints

- **[Platform]**: Cloudflare Workers + Pages — serverless, global CDN, low cost
- **[Database]**: D1 for metadata — Cloudflare native SQLite
- **[Auth]**: None — device-based preferences via localStorage
- **[Privacy]**: 100% private, no auth, no analytics, no external calls except to feed sources

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Device-based preferences | Personal use, no auth needed | ✓ Good |
| Cloudflare Workers + Pages | Serverless, global CDN, D1/R2 native | ✓ Good |
| AI content cleaning | Remove boilerplate, improve readability | ✓ Good |
| LLM daily ranking | Surface most important articles first | ✓ Good |
| LLM personalization | Rerank feed based on user feedback | ✓ Good |
| Topic extraction | Learn user interests from comments | ✓ Good |

---
*Last updated: 2026-03-22 after codebase analysis*

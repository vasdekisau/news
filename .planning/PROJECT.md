# News Vasdekis

## What This Is

Personalized content aggregator that pulls articles from RSS feeds and PDFs from Google Drive, presenting a curated feed based on thumbs up/down voting. Designed for personal use with no authentication—preferences are stored per-device.

## Core Value

A single, personalized reading feed that learns what you like through simple thumbs up/down curation, pulling content from RSS feeds and your Google Drive PDFs.

## Requirements

### Validated

- ✓ Cloudflare Workers API deployed with Hono — existing
- ✓ D1 database schema — existing
- ✓ Next.js 14 frontend with dark mode — existing
- ✓ Article card component with thumbs up/down — existing
- ✓ RSS sources seeded in database — existing

### Active

- [ ] RSS feed fetching — parse feeds, fetch articles, store in D1
- [ ] Content scraping — extract full article content from URLs
- [ ] Google Drive PDF sync — sync PDFs from Drive folder, extract text
- [ ] Personalized feed — rank articles by preference scores
- [ ] Device preference storage — persist thumbs up/down per device
- [ ] Fix API 1014 error — Worker route not accessible

### Out of Scope

- [User authentication] — Device-based preferences sufficient for personal use
- [Multi-user support] — Not needed for personal use case
- [Search functionality] — Deferred to future
- [Social features] — Not a community app

## Context

**Brownfield project** — Worker and frontend partially deployed. API returns 1014 error (route not properly configured). Frontend not yet on Cloudflare Pages.

**Existing infrastructure:**
- Worker `news` deployed to Cloudflare
- D1 database with seeded RSS sources (BBC, Wired, NPR, Guardian, HN)
- Next.js frontend (build succeeds, not deployed)
- Terraform config for Pages project (not yet applied)

**Key issues to resolve:**
- API 1014 error blocking all functionality
- Frontend deployment pending Terraform
- Google Drive OAuth not yet configured

## Constraints

- **[Platform]**: Cloudflare Workers + Pages — specified by user
- **[Auth]**: None — public app, device-based preferences
- **[Storage]**: D1 for data, R2 for PDFs — Cloudflare services
- **[UI]**: Mobile-first dark mode — from spec

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Device-based preferences | Personal use, no auth needed | ✓ Good |
| Cloudflare Workers + Pages | Low cost, serverless, CDN | ✓ Good |
| No search in v1 | Minimally viable curation | — Pending |
| Google Drive sync | User has Economist PDFs there | — Pending |

---
*Last updated: 2026-03-19 after questioning*

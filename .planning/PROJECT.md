# My News Curator

## What This Is

A private, LLM-curated news aggregator that pulls content from RSS feeds and web sources into one fast, personalized reading feed. Articles are pre-processed so readers can consume full content without leaving the site. Designed for personal use only—no auth, no sharing, just a better news experience that's yours alone.

## Core Value

A single, personalized reading feed that learns your preferences through simple upvotes/downvotes, presenting the most relevant news from across the internet in a fast, distraction-free interface.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] RSS feed aggregation — fetch and parse feeds from user-selected sources
- [ ] Full article scraping — extract complete article content from URLs (readability)
- [ ] LLM-powered summarization — generate summaries for quick scanning
- [ ] Pre-processed fast loading — articles rendered from storage, not live fetch
- [ ] In-page article reading — full content visible without leaving the site
- [ ] Personal curation — thumbs up/down to train preference scoring
- [ ] Preference-based ranking — feed sorted by predicted interest per user
- [ ] Source management — add/remove RSS sources
- [ ] Mobile-first dark mode UI — fast, readable on all devices

### Out of Scope

- [User authentication] — Personal use only, device-based tracking is sufficient
- [Multi-user support] — Single-user private dashboard
- [Public sharing] — Private by design, no social features
- [Search functionality] — Preference-based curation replaces search
- [Advertising] — No monetization in v1

## Context

**Greenfield project** — No existing code to preserve. Building from scratch with modern stack.

**User wants:**
- News aggregated from sources they choose (RSS feeds initially)
- Full articles readable in-page (not linking out)
- Fast loading via pre-processing
- Google News-like experience but private and without copyright concerns
- LLM curation/summarization to help triage what's worth reading

**Performance is critical:**
- All content pre-processed and stored
- Sub-second page loads
- Offline-capable reading

## Constraints

- **[Platform]**: Cloudflare Workers + Pages — serverless, global CDN, low cost
- **[Database]**: D1 for metadata, R2 for article cache — Cloudflare native storage
- **[Auth]**: None — device-based preferences via localStorage
- **[Privacy]**: 100% private, no auth, no analytics, no external calls except to feed sources
- **[Content]**: Personal use only — no distribution, no public access

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Device-based preferences | Personal use, no auth needed | — Pending |
| Cloudflare Workers + Pages | Serverless, global CDN, D1/R2 native | — Pending |
| Pre-process all content | Fast load times critical UX | — Pending |
| RSS-first approach | Most sources support RSS, easy to parse | — Pending |
| Readability extraction | In-page article reading without leaving | — Pending |

---
*Last updated: 2026-03-22 after initialization*

# Roadmap: News Vasdekis

**Phase count:** 2 | **Requirements:** 20 (14 complete, 6 pending) | **Milestone:** v1.0

## Phase 1: Core Features

**Goal:** All core personalization and content features working

**Status:** Complete ✓

**Requirements covered:** INGEST-01 through READ-04, INFRA-03, INFRA-04

**Success criteria:**
1. RSS feeds fetch and articles store in D1
2. Articles display in day-grouped, collapsible sections
3. User can expand articles to read full content inline
4. User can give thumbs up/down with comments
5. Sentiment and topics extracted from feedback
6. Source scores tracked per device
7. LLM ranks articles by importance daily
8. LLM reranks personalized feed
9. Dark mode mobile-first UI working

---

## Phase 2: Infrastructure & Deployment

**Goal:** Fix API errors and deploy frontend to Cloudflare Pages

**Status:** Pending

**Requirements covered:** INFRA-01, INFRA-02

**Success criteria:**
1. Worker API accessible at public URL (no 1014 error)
2. Frontend builds and deploys to Cloudflare Pages
3. API_BASE correctly configured in frontend
4. End-to-end feed loading works from deployed URL

**Blockers identified:**
- 1014 error suggests route configuration issue in Cloudflare
- Terraform Pages project not yet applied
- wrangler.toml may need route/middleware configuration

---

## Phase 3: PDF Integration

**Goal:** Google Drive PDF sync working

**Status:** Pending

**Requirements covered:** PDF-01, PDF-02, PDF-03, PDF-04

**Success criteria:**
1. User can authenticate with Google Drive
2. PDFs sync from configured Drive folder
3. PDF text extracted and stored
4. PDFs appear in feed alongside articles

---

## Summary

| # | Phase | Goal | Requirements | Status |
|---|-------|------|--------------|--------|
| 1 | Core Features | Personalization + content pipeline working | 14 complete | ✓ |
| 2 | Infrastructure | Fix API, deploy frontend | INFRA-01, INFRA-02 | ○ |
| 3 | PDF Integration | Drive sync for PDFs | PDF-01 through PDF-04 | ○ |

**Progress:** ████░░░░░░ 70% (14/20 requirements complete)

---
*Roadmap created: 2026-03-22*

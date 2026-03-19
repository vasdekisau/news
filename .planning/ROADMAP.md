# ROADMAP.md - News Vasdekis

## Overview

**3 phases** | **24 requirements** | All v1 requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Core Feed | RSS fetching + API + personalized feed | RSS-01-05, CONT-04, PREF-04-05, FEED-01-04 | 6 |
| 2 | Content + Preferences | Full content scraping + voting | CONT-01-03, PREF-01-03 | 5 |
| 3 | PDF Integration | Google Drive sync + extraction | PDF-01-06 | 6 |

---

## Phase 1: Core Feed

**Goal:** Get articles flowing from RSS into a personalized API

### Requirements
- RSS-01, RSS-02, RSS-03, RSS-04, RSS-05
- CONT-04
- PREF-04, PREF-05
- FEED-01, FEED-02, FEED-03, FEED-04

### Success Criteria
1. Cron job fetches RSS feeds and stores articles in D1
2. `GET /feed?device_id=xxx` returns personalized articles
3. `POST /preferences` accepts thumbs up/down
4. Articles are deduplicated by URL
5. Feed ranks by preference scores within time bands
6. Negatively-scored sources filtered by default

---

## Phase 2: Content + Preferences

**Goal:** Full article scraping and working preference system

### Requirements
- CONT-01, CONT-02, CONT-03
- PREF-01, PREF-02, PREF-03

### Success Criteria
1. Scraping endpoint extracts full article content
2. Metadata (author, image, categories) extracted
3. Thumbs up increases source score
4. Thumbs down decreases source score
5. Preferences persist per device in D1

---

## Phase 3: PDF Integration

**Goal:** Sync Economist PDFs from Google Drive

### Requirements
- PDF-01, PDF-02, PDF-03, PDF-04, PDF-05, PDF-06

### Success Criteria
1. OAuth flow connects Google Drive
2. PDFs listed from configured folder
3. New PDFs downloaded to R2
4. Text extracted and stored in D1
5. PDFs displayed in frontend with text

---

## Notes

- Phase 1 can run in parallel with Phase 3
- Phase 2 depends on Phase 1 (needs articles to scrape)
- Fix API 1014 error in parallel (blocking issue)

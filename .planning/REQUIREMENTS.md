# Requirements: News Vasdekis

**Defined:** 2026-03-22
**Core Value:** A personalized reading feed that learns your preferences through upvotes/downvotes, presenting relevant news in a fast, distraction-free interface.

## v1 Requirements

### Content Ingestion

- [ ] **INGEST-01**: User can add RSS feed sources via API
- [ ] **INGEST-02**: System fetches RSS feeds on schedule (cron job)
- [ ] **INGEST-03**: System scrapes full article content from URLs
- [ ] **INGEST-04**: AI cleans article content (removes boilerplate)
- [ ] **INGEST-05**: Articles stored in D1 with full metadata

### Personalization

- [ ] **PERS-01**: User can give thumbs up/down on articles with comments
- [ ] **PERS-02**: System extracts sentiment from feedback (positive/negative/neutral)
- [ ] **PERS-03**: System extracts topics from feedback for interest learning
- [ ] **PERS-04**: System tracks source preferences per device
- [ ] **PERS-05**: LLM reranks personalized feed based on preferences
- [ ] **PERS-06**: LLM ranks articles by importance within each day

### Reading Experience

- [ ] **READ-01**: Articles displayed in day-grouped sections
- [ ] **READ-02**: User can expand article to read full content inline
- [ ] **READ-03**: Summaries shown by default, full content on demand
- [ ] **READ-04**: Fast load times (pre-processed content from D1)

### Infrastructure

- [ ] **INFRA-01**: Worker API accessible at public URL (fix 1014 error)
- [ ] **INFRA-02**: Frontend deployed to Cloudflare Pages
- [ ] **INFRA-03**: Dark mode mobile-first UI
- [ ] **INFRA-04**: Device ID stored in localStorage

### PDF Integration

- [ ] **PDF-01**: User can connect Google Drive account
- [ ] **PDF-02**: System syncs PDFs from configured Drive folder
- [ ] **PDF-03**: PDF text extracted and searchable
- [ ] **PDF-04**: PDFs appear in feed alongside articles

## v2 Requirements

### Advanced Features

- **PERS-07**: User can set topic-based filtering (only show AI articles)
- **PERS-08**: System suggests new sources based on interests
- **READ-05**: Offline reading capability (PWA service worker)
- **INFRA-05**: Email/digest notifications for top stories

## Out of Scope

| Feature | Reason |
|---------|--------|
| User authentication | Personal use, device-based preferences sufficient |
| Multi-device sync | Not needed for single-user personal use |
| Public sharing | Private by design |
| Search | Curation replaces search |
| Social features | No community aspects |
| Advertising | No monetization |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INGEST-01 | Phase 1 | Complete |
| INGEST-02 | Phase 1 | Complete |
| INGEST-03 | Phase 1 | Complete |
| INGEST-04 | Phase 1 | Complete |
| INGEST-05 | Phase 1 | Complete |
| PERS-01 | Phase 1 | Complete |
| PERS-02 | Phase 1 | Complete |
| PERS-03 | Phase 1 | Complete |
| PERS-04 | Phase 1 | Complete |
| PERS-05 | Phase 1 | Complete |
| PERS-06 | Phase 1 | Complete |
| READ-01 | Phase 1 | Complete |
| READ-02 | Phase 1 | Complete |
| READ-03 | Phase 1 | Complete |
| READ-04 | Phase 1 | Complete |
| INFRA-01 | Phase 2 | Pending |
| INFRA-02 | Phase 2 | Pending |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 | Complete |
| PDF-01 | Phase 3 | Pending |
| PDF-02 | Phase 3 | Pending |
| PDF-03 | Phase 3 | Pending |
| PDF-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Complete: 14
- Pending: 6

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-22 after codebase analysis*

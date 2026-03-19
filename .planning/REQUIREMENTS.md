# Requirements: News Vasdekis

**Defined:** 2026-03-19
**Core Value:** A personalized reading feed that learns through thumbs up/down curation

## v1 Requirements

### RSS Aggregation

- [ ] **RSS-01**: Parse RSS 2.0, Atom, and JSON Feed formats
- [ ] **RSS-02**: Fetch articles from configured sources on schedule
- [ ] **RSS-03**: Deduplicate articles by URL and GUID
- [ ] **RSS-04**: Store articles in D1 with title, URL, description, pubDate, source
- [ ] **RSS-05**: Handle malformed feeds gracefully with error logging

### Content Management

- [ ] **CONT-01**: Extract full article content from URLs via scraping
- [ ] **CONT-02**: Extract metadata (author, image, categories) from articles
- [ ] **CONT-03**: Update existing articles with scraped content
- [ ] **CONT-04**: API endpoint to list articles with pagination

### User Preferences

- [ ] **PREF-01**: Thumbs up on article increases source score
- [ ] **PREF-02**: Thumbs down on article decreases source score
- [ ] **PREF-03**: Store preferences per device ID in D1
- [ ] **PREF-04**: API to submit preference (thumbs up/down)
- [ ] **PREF-05**: API to get preferences for device

### Feed Delivery

- [ ] **FEED-01**: Serve personalized article feed ranked by preference scores
- [ ] **FEED-02**: Show articles chronologically within preference bands
- [ ] **FEED-03**: Filter out negatively-scored sources by default
- [ ] **FEED-04**: API endpoint: GET /feed?device_id=xxx&limit=20

### PDF Integration

- [ ] **PDF-01**: OAuth flow to connect Google Drive account
- [ ] **PDF-02**: List PDFs from configured Drive folder
- [ ] **PDF-03**: Download new PDFs to R2 storage
- [ ] **PDF-04**: Extract text from PDFs using pdf-parse
- [ ] **PDF-05**: Store PDF text in D1 for display
- [ ] **PDF-06**: Display PDFs in frontend with extracted text

## v2 Requirements

### Smart Feed
- **FEED-05**: Category inference from article content
- **FEED-06**: Source-based preference learning
- **FEED-07**: "Read later" without voting

### Enhancement
- **CONT-05**: Image extraction and hosting
- **CONT-06**: Readability scoring for articles

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full-text search | Overkill for curated feed |
| Social sharing | Not a social app |
| Comments | Personal use only |
| Email newsletters | Not needed |
| Multiple user accounts | Device-based is sufficient |
| Bookmarks | Use read state instead |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| RSS-01 | Phase 1 | Pending |
| RSS-02 | Phase 1 | Pending |
| RSS-03 | Phase 1 | Pending |
| RSS-04 | Phase 1 | Pending |
| RSS-05 | Phase 1 | Pending |
| CONT-04 | Phase 1 | Pending |
| PREF-04 | Phase 1 | Pending |
| PREF-05 | Phase 1 | Pending |
| FEED-01 | Phase 1 | Pending |
| FEED-02 | Phase 1 | Pending |
| FEED-03 | Phase 1 | Pending |
| FEED-04 | Phase 1 | Pending |
| CONT-01 | Phase 2 | Pending |
| CONT-02 | Phase 2 | Pending |
| CONT-03 | Phase 2 | Pending |
| PREF-01 | Phase 2 | Pending |
| PREF-02 | Phase 2 | Pending |
| PREF-03 | Phase 2 | Pending |
| PDF-01 | Phase 3 | Pending |
| PDF-02 | Phase 3 | Pending |
| PDF-03 | Phase 3 | Pending |
| PDF-04 | Phase 3 | Pending |
| PDF-05 | Phase 3 | Pending |
| PDF-06 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-19*
*Last updated: 2026-03-19 after research synthesis*

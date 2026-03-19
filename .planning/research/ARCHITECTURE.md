# ARCHITECTURE.md - Architecture

## Current Architecture

```
[RSS Feeds] → [Workers Cron] → [D1 Database]
                                       ↓
[User] → [Frontend] → [Workers API] → [D1 Database]
                                       ↓
                              [R2 Storage (PDFs)]
```

## Components

### 1. RSS Fetcher (Worker + Cron)
- Triggered by cron schedule
- Fetches RSS feeds in parallel
- Parses and deduplicates articles
- Stores in D1

### 2. Content Scraper (Worker)
- Triggered after RSS fetch OR on-demand
- Fetches article HTML
- Extracts main content using Readability
- Updates article in D1

### 3. PDF Sync (Worker + Google Drive)
- OAuth flow for Drive access
- Watches designated folder
- Downloads PDFs to R2
- Extracts text, stores in D1

### 4. Feed API (Worker)
- Serves personalized article feed
- Queries D1 with preference weighting
- Returns JSON to frontend

### 5. Preferences API (Worker)
- Stores device preferences
- Thumbs up/down per article
- Scores per source/category

## Data Flow

### RSS → Articles
1. Cron triggers `/sources/fetch` route
2. Worker fetches RSS from each source
3. Parse articles, check for duplicates
4. Insert new articles to D1
5. Return fetch summary

### User → Personalized Feed
1. User opens app → `GET /feed?device_id=xxx`
2. Fetch device preferences from D1
3. Query articles with preference weighting
4. Return sorted article list

### PDF → Searchable
1. Cron triggers `/pdfs/sync` route
2. List files from Google Drive folder
3. Download new PDFs to R2
4. Extract text using pdf-parse
5. Store text in D1 for PDF articles

## Build Order

1. **RSS Fetching** — Foundation, no dependencies
2. **Article API** — Needs RSS data
3. **Preferences API** — Simple key-value
4. **Personalized Feed** — Combines above
5. **Content Scraper** — Enhancement
6. **PDF Sync** — Independent path

# FEATURES.md - Feature Analysis

## Table Stakes (Must Have)

### RSS Aggregation
- **Feed parsing** — Parse RSS 2.0, Atom, JSON Feed
- **Periodic fetching** — Scheduled polling of feeds
- **Deduplication** — Don't add same article twice
- **Feed validation** — Handle malformed feeds gracefully

### Content Storage
- **Article storage** — Store title, URL, description, pubDate
- **Content source tracking** — Know which feed article came from
- **Metadata extraction** — Extract author, image, categories

### User Preferences
- **Thumbs up/down** — Simple binary preference
- **Device identification** — localStorage + API token
- **Preference persistence** — Store in D1 per device

### Feed Delivery
- **Chronological feed** — Recent articles first
- **Personalized ranking** — Boost liked sources/categories
- **Pagination** — Handle large article lists

## Differentiators

### Content Scraping
- **Full article extraction** — Not just RSS summaries
- **Readability scoring** — Extract main content
- **Image extraction** — Pull hero images from articles

### PDF Integration
- **Google Drive sync** — Watch folder for new PDFs
- **Text extraction** — OCR or direct extraction
- **PDF indexing** — Make PDFs searchable

### Smart Feed
- **Source weighting** — Weight by past likes
- **Category inference** — Auto-categorize articles
- **Read state** — Track what user has read

## Anti-Features (Don't Build)

- **Full-text search** — Overkill for curated feed
- **Social sharing** — Not a social app
- **Comments** — Personal use only
- **Email newsletters** — Not needed
- **Bookmarks** — Use read state instead

## Feature Dependencies

| Feature | Depends On |
|---------|------------|
| RSS Fetching | D1 schema, scheduled workers |
| Content Scraping | RSS fetching, article URLs |
| PDF Extraction | Google Drive OAuth, R2 storage |
| Personalized Feed | Thumbs up/down, preference storage |

# News Vasdekis - Content Aggregator

## Project Overview

- **Name**: News Vasdekis
- **Type**: Web application (PWA)
- **Core Functionality**: Aggregate content from across the internet, let users curate with thumbs up/down, ingest PDFs from Google Drive
- **Target Users**: Content consumers who want a personalized reading feed

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare                               │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │   Pages      │  │   Workers    │  │   D1 + R2      │  │
│  │  (Frontend)  │◄─┤   (API)      │◄─┤  (DB + Files)  │  │
│  └──────────────┘  └──────────────┘  └────────────────┘  │
│         │                 │                                 │
│         │         ┌──────┴──────┐                         │
│         │         │  Scheduler   │                         │
│         │         │  (Cron)     │                         │
│         │         └─────────────┘                         │
│         │                                                 │
└─────────│─────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────┐
│   Google Drive   │ (PDF ingestion)
└──────────────────┘

Content Sources: RSS, APIs, Scraping (respectful)
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, shadcn/ui |
| Backend | Cloudflare Workers, Hono |
| Database | D1 (SQLite) |
| File Storage | R2 (PDFs, images) |
| Auth | None (public app, device-based preferences) |
| PDF Ingestion | Google Drive API |
| Infrastructure | Terraform (all resources) |

## Database Schema (D1)

```sql
-- Articles from various sources
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_id TEXT,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  author TEXT,
  published_at INTEGER,
  image_url TEXT,
  category TEXT,
  tags TEXT, -- JSON array
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- User preferences (device-based, no auth)
CREATE TABLE device_preferences (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  article_id TEXT REFERENCES articles(id),
  preference INTEGER, -- 1 = thumbs up, -1 = thumbs down, 0 = neutral
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Content sources to aggregate
CREATE TABLE content_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- rss, api, scrape
  url TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  last_fetched_at INTEGER,
  fetch_interval_minutes INTEGER DEFAULT 60
);

-- PDFs from Google Drive
CREATE TABLE pdfs (
  id TEXT PRIMARY KEY,
  drive_file_id TEXT,
  filename TEXT NOT NULL,
  url TEXT,
  content TEXT, -- extracted text
  summary TEXT,
  added_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Jobs for background processing
CREATE TABLE jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  payload TEXT,
  status TEXT DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

## API Endpoints (Workers)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/articles` | List articles (paginated, filterable) |
| GET | `/api/articles/:id` | Get single article |
| POST | `/api/preferences` | Set thumbs up/down |
| GET | `/api/feed` | Personalized feed based on preferences |
| POST | `/api/sources` | Add content source |
| GET | `/api/sources` | List sources |
| POST | `/api/pdf/upload` | Upload PDF |
| GET | `/api/pdf` | List PDFs |
| POST | `/api/jobs` | Create job (fetch sources, process PDFs) |

## Frontend Pages

| Path | Description |
|------|-------------|
| `/` | Main feed (personalized) |
| `/articles` | All articles (filterable) |
| `/article/:id` | Article detail view |
| `/sources` | Manage content sources (admin) |
| `/pdfs` | Uploaded PDFs |
| `/settings` | App settings (dark mode, etc.) |

## Features

1. **Content Aggregation**
   - RSS feed fetching
   - Respectful API scraping
   - Scheduled fetching via Workers cron

2. **Personalization**
   - Thumbs up/down on articles
   - Device-based storage (localStorage + D1)
   - Algorithm: Show more of what user likes

3. **PDF Ingestion**
   - Google Drive integration
   - Extract text from PDFs
   - Summarize with AI (future)

4. **PWA**
   - Mobile-first design
   - Dark mode default
   - Offline capable

## Terraform Resources Needed

```hcl
# D1 Database
resource "cloudflare_d1" "main" {
  account_id = var.cloudflare_account_id
  name       = "economist-ai-db"
}

# R2 Bucket
resource "cloudflare_r2_bucket" "pdfs" {
  account_id = var.cloudflare_account_id
  name       = "economist-ai-pdfs"
}

# Workers
resource "cloudflare_worker_script" "api" {
  account_id = var.cloudflare_account_id
  name       = "economist-ai-api"
  content    = file("dist/worker.js")
}

# Pages Project
resource "cloudflare_pages_project" "frontend" {
  account_id = var.cloudflare_account_id
  name       = "economist-ai-frontend"
  production_branch = "main"
}

# Workers Routes
resource "cloudflare_worker_route" "api" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "api.economist-ai.*"
  script_name = "economist-ai-api"
}
```

## Implementation Order

1. **Infrastructure** (Terraform)
   - Create D1, R2, Workers, Pages
   - Set up CI/CD

2. **Backend** (Workers)
   - Article CRUD
   - Preferences API
   - RSS fetching
   - PDF processing

3. **Frontend** (Next.js)
   - Basic layout + dark mode
   - Article list + detail
   - Thumbs up/down
   - Settings page

4. **Integrations**
   - Google Drive sync for PDFs
   - Content source management

5. **Polish**
   - PWA features
   - Performance optimization

# AGENTS.md - News Vasdekis

## Project Overview

- **Project Name**: News Vasdekis (content aggregator)
- **Type**: Full-stack web application
- **Core Functionality**: Aggregate content from across the internet with personalized thumbs up/down curation, PDF ingestion from Google Drive
- **Target Users**: Content consumers wanting a personalized reading feed

## Architecture

```
Cloudflare:
├── Pages (Frontend - Next.js)
├── Workers (API - Hono)
├── D1 (Database)
├── R2 (File Storage)
└── Scheduler (Cron jobs)

External:
├── Google Drive (PDF ingestion)
└── Content Sources (RSS, APIs)
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, shadcn/ui |
| Backend | Cloudflare Workers, Hono |
| Database | D1 (SQLite) |
| File Storage | R2 |
| Auth | None (public app) |
| PDF | Google Drive API |
| IaC | Terraform |

---

## Agent 1: Infrastructure (Terraform)

**Category**: `unspecified-high`

**Responsibilities**:
- Create all Cloudflare resources via Terraform
- Set up D1 database with schema
- Configure R2 bucket for PDFs
- Set up Workers and Pages projects
- Configure routes and bindings

**Skills Required**: `terraform`, `cloudflare`

**Files to Create**:
- `terraform/main.tf` - Main Terraform config
- `terraform/variables.tf` - Variables
- `terraform/outputs.tf` - Outputs
- `terraform/d1/` - Database migrations

**Steps**:
1. Create Terraform configuration
2. Set up D1 database and run migrations
3. Configure Workers with D1/R2 bindings
4. Set up Pages project
5. Configure CI/CD (GitHub Actions)

---

## Agent 2: Backend API (Workers)

**Category**: `deep`

**Responsibilities**:
- Build Cloudflare Workers API
- Implement article CRUD
- Implement preferences API
- Build RSS fetcher
- Build PDF processor

**Skills Required**: `typescript`, `cloudflare-workers`, `hono`, `d1`

**Files to Create**:
- `workers/src/index.ts` - Entry point
- `workers/src/routes/articles.ts` - Article routes
- `workers/src/routes/preferences.ts` - Preference routes
- `workers/src/routes/sources.ts` - Source routes
- `workers/src/routes/pdf.ts` - PDF routes
- `workers/src/services/rss.ts` - RSS fetching
- `workers/src/services/pdf.ts` - PDF processing
- `workers/src/db/` - Database utilities
- `workers/wrangler.toml` - Worker config

**Steps**:
1. Set up Hono app structure
2. Implement D1 database queries
3. Build article endpoints
4. Build preferences endpoints
5. Build RSS fetcher service
6. Build PDF upload/processing
7. Add scheduled jobs (cron)

---

## Agent 3: Frontend (Next.js)

**Category**: `visual-engineering`

**Responsibilities**:
- Build Next.js frontend
- Implement dark mode UI
- Build article feed
- Implement thumbs up/down
- Build settings page

**Skills Required**: `next.js`, `tailwind-css`, `shadcn-ui`, `frontend-ui-ux`

**Files to Create**:
- `frontend/src/app/page.tsx` - Main feed
- `frontend/src/app/articles/page.tsx` - All articles
- `frontend/src/app/article/[id]/page.tsx` - Article detail
- `frontend/src/app/pdfs/page.tsx` - PDFs
- `frontend/src/app/settings/page.tsx` - Settings
- `frontend/src/components/` - UI components
- `frontend/src/lib/` - Utilities
- `frontend/tailwind.config.ts` - Tailwind config
- `frontend/next.config.ts` - Next.js config
- `frontend/wrangler.toml` - Pages config
- `frontend/terraform/` - Frontend Terraform

**Steps**:
1. Initialize Next.js project with Tailwind
2. Set up dark mode theme
3. Build article card component
4. Build main feed page
5. Build article detail page
6. Implement thumbs up/down
7. Build settings page
8. Build PDF list page
9. Configure PWA

---

## Agent 4: Integrations

**Category**: `deep`

**Responsibilities**:
- Google Drive integration for PDFs
- RSS feed source management
- Content source scraping

**Skills Required**: `google-drive-api`, `rss`, `cloudflare-workers`

**Files to Create**:
- `workers/src/services/google-drive.ts` - Drive API
- `workers/src/services/scraper.ts` - Content scraping

**Steps**:
1. Set up Google Drive OAuth
2. Build PDF sync service
3. Add RSS source management
4. Build content source scraper

---

## Delegation Order

1. **Agent 1 (Infrastructure)** - Run first, creates all resources
2. **Agent 2 (Backend)** - Run second, depends on D1/R2
3. **Agent 3 (Frontend)** - Run third, depends on API
4. **Agent 4 (Integrations)** - Run last, optional enhancements

---

## Key Patterns

### Database (D1)
- Use Drizzle ORM for type-safe queries
- Migrations in `terraform/d1/`
- Seed default content sources

### API (Workers)
- Use Hono for route handling
- Request validation with Zod
- Error handling with proper HTTP codes

### Frontend
- Mobile-first Tailwind classes
- Dark mode via `next-themes`
- Server components where possible
- Client components for interactivity

### Device Preferences
- Store device ID in localStorage
- Sync preferences to D1
- No auth required (public app)

---

## Secrets Required

| Secret | Description |
|--------|-------------|
| `GOOGLE_CLIENT_ID` | Google Drive OAuth |
| `GOOGLE_CLIENT_SECRET` | Google Drive OAuth |
| `GOOGLE_REDIRECT_URI` | OAuth callback |

---

## Notes

- All agents should coordinate through the human
- Agent 1 must complete before Agent 2 can test
- Frontend needs API URL from Agent 2
- Use session_id for multi-turn work within same agent

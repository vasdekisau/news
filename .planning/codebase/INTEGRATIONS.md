# INTEGRATIONS.md - External Services

## Cloudflare (Primary)
- **Workers** - API backend (`news` worker deployed)
- **Pages** - Frontend hosting (not yet deployed)
- **D1** - SQLite database (existing)
- **R2** - PDF file storage (configured)
- **DNS** - Domain management via `dns.tf`

## External APIs (Planned/Stubbed)
- **Google Drive API** - PDF ingestion
  - Service: Google Drive
  - Status: Not implemented (credentials in AGENTS.md)
  - Required secrets: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

## Data Sources (RSS Feeds)
- BBC News
- Wired
- NPR
- The Guardian
- Hacker News

Configured in database, fetched via `workers/src/services/rss.ts` (planned)

## Current API Endpoints
- `api.vasdekis.com.au` - Worker route (currently returns 1014 error)

## Deployment
- **GitHub Actions** - CI/CD for workers and frontend
- **Terraform Cloud** - Infrastructure state management

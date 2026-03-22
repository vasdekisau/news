# Phase 2: Infrastructure & Deployment - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix the API 1014 error and deploy the Next.js frontend to Cloudflare Pages. Phase delivers:
1. Worker API accessible at public URL (no 1014 error)
2. Frontend deployed to Cloudflare Pages at news.vasdekis.com.au
3. End-to-end feed loading works from deployed URL

</domain>

<decisions>
## Implementation Decisions

### API Error Resolution
- Add direct domain binding for api.vasdekis.com.au to Worker script
- Configure custom domain in Cloudflare dashboard (or via Terraform)
- Redeploy Workers after domain binding

### Frontend Deployment
- Use Terraform to manage Cloudflare Pages project
- Let Cloudflare build natively (no wrangler.toml override)
- Configure build command and output directory in Terraform
- GitHub Actions deploys via `wrangler pages deploy` or Cloudflare dashboard trigger

### Domain/Routing Strategy
- Frontend: news.vasdekis.com.au (Cloudflare Pages)
- API: api.vasdekis.com.au (Cloudflare Workers)
- CORS already enabled in Workers (cors() middleware)
- NEXT_PUBLIC_API_URL set to https://api.vasdekis.com.au

### Terraform Configuration
- Use `cloudflare_pages_project` resource for frontend
- Connect to GitHub repo for automatic builds
- Configure build settings: `npm run build` with `frontend/out` output
- Worker routes via `cloudflare_worker_route` resource

### Claude's Discretion
- Exact Terraform resource syntax for Pages project GitHub integration
- Specific wrangler command for triggering Cloudflare Pages builds from CI
- CORS configuration specifics (already enabled, but may need fine-tuning)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Infrastructure
- `workers/wrangler.toml` — Current Worker configuration with D1, KV, R2 bindings
- `.github/workflows/deploy-frontend.yml` — GitHub Actions workflow for frontend deployment
- `terraform/main.tf` — Existing Terraform config with Pages domain resource
- `terraform/resources.tf` — D1 and KV namespace resources

### Frontend
- `frontend/src/app/page.tsx` — Current feed page with API_BASE configuration
- `frontend/next.config.ts` — Next.js configuration

### Backend
- `workers/src/index.ts` — Hono app with CORS enabled
- `workers/src/routes/feed.ts` — Feed endpoint with device_id parameter

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- CORS middleware already configured in workers/src/index.ts
- GitHub Actions workflow already exists in deploy-frontend.yml
- Terraform state already has D1 database ID and KV namespace ID

### Established Patterns
- Workers use Hono framework with route modules
- Frontend uses Next.js 14 with Tailwind CSS
- API_BASE configured in page.tsx from environment variable

### Integration Points
- Frontend API calls: `https://api.vasdekis.com.au/api/feed?device_id=...`
- Worker has D1 (DB), KV, R2 (PDFS), and MYBROWSER bindings
- Cron triggers configured for */15 minutes

</code_context>

<specifics>
## Specific Ideas

- "Use terraform driver for GitHub connection to pages" — Let Terraform manage the Pages project GitHub integration
- "Allow CloudFlare to build it natively" — Don't override build settings with wrangler.toml

</specifics>

<deferred>
## Deferred Ideas

- PDF integration via Google Drive — Phase 3
- R2 bucket usage for PDF storage — noted for Phase 3

</deferred>

---

*Phase: 02-infrastructure-deployment*
*Context gathered: 2026-03-22*

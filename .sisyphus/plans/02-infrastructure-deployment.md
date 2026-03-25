# Phase 2 Plan: Infrastructure & Deployment

**Plan ID:** 02-infrastructure-deployment
**Created:** 2026-03-25
**Status:** Ready for execution

---

## TL;DR

> **Quick Summary**: Fix the Worker API 1014 error by removing conflicting route configuration, deploy the Worker, apply Terraform for Pages project, and trigger frontend deployment.
>
> **Deliverables**:
> - Worker API accessible at https://api.vasdekis.com.au (no 1014 error)
> - Frontend deployed at https://news.vasdekis.com.au
> - End-to-end feed loading verified
>
> **Estimated Effort**: Short (2-3 hours)
> **Parallel Execution**: NO (sequential - Worker must deploy before Terraform)
> **Critical Path**: T1 (Resolve route conflict) → T2 (Deploy Worker) → T3 (Apply Terraform) → T4 (Verify API) → T5 (Trigger frontend deploy) → T6 (Verify end-to-end)

---

## Context

### Phase Objectives (from ROADMAP.md)
1. Worker API accessible at public URL (no 1014 error)
2. Frontend builds and deploys to Cloudflare Pages
3. API_BASE correctly configured in frontend
4. End-to-end feed loading works from deployed URL

### Decisions Captured (from 02-CONTEXT.md)
- **API Error Resolution**: Add direct domain binding via Terraform `cloudflare_worker_route`
- **Frontend Deployment**: Use Terraform `cloudflare_pages_project` with native Cloudflare builds
- **Domain Strategy**: news.vasdekis.com.au (Pages) / api.vasdekis.com.au (Workers)
- **CORS**: Already enabled in Hono app

### Root Cause Analysis (1014 Error)
The 1014 error occurs when a Worker route pattern conflicts or isn't properly bound. Current state:
- `wrangler.toml` has `[[routes]]` block defining `api.vasdekis.com.au/*`
- `terraform/resources.tf` has `cloudflare_worker_route` for same pattern
- **Conflict**: Both mechanisms trying to manage routes → race condition/conflict

### Resolution
Remove `[[routes]]` from wrangler.toml and rely solely on Terraform's `cloudflare_worker_route`.

---

## Work Objectives

### Core Objective
Fix Worker API routing and deploy frontend to Cloudflare Pages.

### Concrete Deliverables
1. Worker at https://api.vasdekis.com.au/api/feed returns JSON
2. Frontend at https://news.vasdekis.com.au loads and displays feed
3. No 1014 or CORS errors

### Definition of Done
- [ ] `curl https://api.vasdekis.com.au/api/feed` returns JSON response
- [ ] Frontend page loads at news.vasdekis.com.au
- [ ] Feed data appears in frontend (end-to-end verified)

### Must Have
- Worker accessible via api.vasdekis.com.au without 1014 error
- Frontend at news.vasdekis.com.au

### Must NOT Have
- Route conflicts between wrangler.toml and Terraform
- Hardcoded API URLs in frontend (must use NEXT_PUBLIC_API_URL)

---

## Execution Strategy

### Sequential Workflow

```
T1: Resolve route conflict (remove wrangler.toml routes)
  ↓
T2: Deploy Worker to Cloudflare
  ↓
T3: Apply Terraform (creates Pages project + worker route)
  ↓
T4: Verify API endpoint (curl test)
  ↓
T5: Trigger frontend deployment
  ↓
T6: Verify end-to-end (frontend loads feed from API)
```

**Why Sequential**: Terraform depends on Worker being deployed first (script_name reference).

---

## TODOs

- [ ] 1. Remove [[routes]] conflict from wrangler.toml

  **What to do**:
  - Edit `workers/wrangler.toml` to comment out or remove the `[[routes]]` block (lines 24-26)
  - Keep everything else (D1, KV, R2 bindings, cron triggers)

  **Must NOT do**:
  - Don't remove D1/KV/R2 bindings
  - Don't remove the `name = "news"` or `main = "src/index.ts"` entries

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single file edit, minimal risk
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: None (can start immediately)
  - **Blocks**: T2 (Deploy Worker)

  **References**:
  - `workers/wrangler.toml:24-26` - Current routes block to remove
  - `terraform/resources.tf:15-19` - Terraform worker_route that should remain

  **Acceptance Criteria**:
  - [ ] `[[routes]]` block removed or commented in wrangler.toml
  - [ ] wrangler.toml still valid (has name, main, bindings)

  **QA Scenarios**:

  \`\`\`
  Scenario: wrangler.toml remains valid after edit
    Tool: Bash
    Preconditions: wrangler.toml has [[routes]] block
    Steps:
      1. Edit file to remove [[routes]] block
      2. Run: cd workers && cat wrangler.toml | grep -E "^\\[\\[|^name|^main|^\\[\\[d1|^\\[\\[kv"
    Expected Result: Output shows name, main, d1_databases, kv_namespaces entries (no routes)
    Failure Indicators: Syntax error, missing required fields
    Evidence: .sisyphus/evidence/task-1-wrangler-valid.txt
  \`\`\`

  **Evidence to Capture**:
  - [ ] wrangler.toml content after edit

  **Commit**: YES
  - Message: `fix: remove [[routes]] to avoid conflict with Terraform`
  - Files: `workers/wrangler.toml`

---

- [ ] 2. Deploy Worker to Cloudflare

  **What to do**:
  - Run `wrangler deploy` in workers directory
  - Verify deployment succeeds
  - Worker will be accessible at workers.news.vasdekis.workers.dev initially

  **Must NOT do**:
  - Don't modify any source files
  - Don't create new bindings

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard deployment command
  - **Skills**: `cloudflare-workers`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: T1 (wrangler.toml must be fixed first)
  - **Blocks**: T3 (Terraform apply needs deployed worker script_name)

  **References**:
  - `workers/wrangler.toml` - Configuration for deployment
  - `.env` - Contains CLOUDFLARE_API_TOKEN

  **Acceptance Criteria**:
  - [ ] `wrangler deploy` succeeds with exit code 0
  - [ ] Worker appears in Cloudflare dashboard

  **QA Scenarios**:

  \`\`\`
  Scenario: Worker deploys successfully
    Tool: Bash
    Preconditions: wrangler.toml fixed, credentials in .env
    Steps:
      1. cd workers && npx wrangler deploy --dry-run
      2. If dry-run succeeds, run: wrangler deploy
    Expected Result: Deployment completes, no errors
    Failure Indicators: Authentication failure, missing bindings, 1014 error
    Evidence: .sisyphus/evidence/task-2-deploy.log

  Scenario: Worker accessible at workers.dev subdomain
    Tool: Bash
    Preconditions: Worker deployed
    Steps:
      1. curl https://workers.news.vasdekis.workers.dev/api/feed?device_id=test
    Expected Result: JSON response (may be empty array but not 1014)
    Failure Indicators: 1014 error, connection refused
    Evidence: .sisyphus/evidence/task-2-workers-url.json
  \`\`\`

  **Evidence to Capture**:
  - [ ] Deployment output log
  - [ ] API response from workers.dev URL

  **Commit**: NO (already has changes from T1)

---

- [ ] 3. Apply Terraform configuration

  **What to do**:
  - Run `terraform init` and `terraform plan` first
  - Apply to create/update:
    - `cloudflare_pages_project.frontend` (manages Pages build config)
    - `cloudflare_worker_route.api` (binds api.vasdekis.com.au to worker)
  - Note: `cloudflare_pages_domain.news` already exists

  **Must NOT do**:
  - Don't run `terraform destroy`
  - Don't modify existing D1/KV resources

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Terraform commands, no custom logic
  - **Skills**: `terraform`, `cloudflare`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: T2 (Worker must be deployed first for script_name reference)
  - **Blocks**: T4 (API verification)

  **References**:
  - `terraform/main.tf` - Pages project resource
  - `terraform/resources.tf` - Worker route resource
  - `terraform/terraform.tfvars` - Variables

  **Acceptance Criteria**:
  - [ ] `terraform apply` completes successfully
  - [ ] Pages project configured in Cloudflare dashboard
  - [ ] Worker route shows api.vasdekis.com.au bound to "news" script

  **QA Scenarios**:

  \`\`\`
  Scenario: Terraform plan shows expected changes
    Tool: Bash
    Preconditions: Terraform files modified correctly
    Steps:
      1. cd terraform && terraform init
      2. terraform plan -out=plan.tfplan
    Expected Result: Plan shows ~2 changes (pages_project, worker_route)
    Failure Indicators: Provider error, missing variables
    Evidence: .sisyphus/evidence/task-3-plan.log

  Scenario: Terraform apply succeeds
    Tool: Bash
    Preconditions: Plan approved
    Steps:
      1. terraform apply plan.tfplan
    Expected Result: Apply completes, no errors
    Failure Indicators: Resource conflict, permission denied
    Evidence: .sisyphus/evidence/task-3-apply.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] terraform plan output
  - [ ] terraform apply output

  **Commit**: NO (Terraform state not committed)

---

- [ ] 4. Verify API endpoint at api.vasdekis.com.au

  **What to do**:
  - Test the API is accessible via the custom domain
  - `curl https://api.vasdekis.com.au/api/feed?device_id=test`
  - Should return JSON, not 1014 error

  **Must NOT do**:
  - Don't modify any files
  - Don't expect full data (device_id=test is not a real device)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple curl test, verification only
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: T3 (Terraform must apply route)
  - **Blocks**: T5 (Frontend deployment trigger)

  **References**:
  - `workers/src/routes/feed.ts` - Feed endpoint logic
  - `frontend/src/app/page.tsx` - Uses this URL for API calls

  **Acceptance Criteria**:
  - [ ] `curl -s https://api.vasdekis.com.au/api/feed?device_id=test` returns JSON
  - [ ] No 1014 error in response
  - [ ] Response is valid JSON (parseable)

  **QA Scenarios**:

  \`\`\`
  Scenario: API returns JSON at api.vasdekis.com.au
    Tool: Bash
    Preconditions: Terraform applied worker_route
    Steps:
      1. curl -s -w "\nHTTP_CODE:%{http_code}" "https://api.vasdekis.com.au/api/feed?device_id=test"
    Expected Result: HTTP 200, JSON response (may be empty array for unknown device)
    Failure Indicators: HTTP 1014, 500, or invalid JSON
    Evidence: .sisyphus/evidence/task-4-api-response.json

  Scenario: CORS headers present
    Tool: Bash
    Preconditions: API responding correctly
    Steps:
      1. curl -s -I "https://api.vasdekis.com.au/api/feed?device_id=test" | grep -i "access-control"
    Expected Result: CORS headers present (Access-Control-Allow-Origin)
    Failure Indicators: Missing CORS headers
    Evidence: .sisyphus/evidence/task-4-cors-headers.txt
  \`\`\`

  **Evidence to Capture**:
  - [ ] Full API response
  - [ ] HTTP headers

  **Commit**: NO (verification only)

---

- [ ] 5. Trigger frontend deployment

  **What to do**:
  - Either push a commit to trigger GitHub Actions
  - Or manually trigger via GitHub dashboard
  - Or use `wrangler pages deploy` from frontend directory

  **Must NOT do**:
  - Don't modify frontend source files unnecessarily

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Deployment trigger, no complex logic
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: T4 (API must work first, frontend depends on it)
  - **Blocks**: T6 (End-to-end verification)

  **References**:
  - `.github/workflows/deploy-frontend.yml` - Deployment workflow
  - `frontend/package.json` - Build script

  **Acceptance Criteria**:
  - [ ] Frontend build succeeds
  - [ ] Frontend deploys to news.vasdekis.com.au

  **QA Scenarios**:

  \`\`\`
  Scenario: GitHub Actions workflow runs
    Tool: Bash
    Preconditions: GitHub Actions configured
    Steps:
      1. git add -A && git commit --allow-empty -m "chore: trigger frontend deploy"
      2. git push origin main
      3. Monitor: gh run list --workflow=deploy-frontend.yml
    Expected Result: Workflow starts and completes successfully
    Failure Indicators: Build failure, deployment error
    Evidence: .sisyphus/evidence/task-5-workflow.json
  \`\`\`

  **Evidence to Capture**:
  - [ ] GitHub Actions run URL
  - [ ] Deployment URL

  **Commit**: YES (empty commit to trigger)
  - Message: `chore: trigger frontend deploy`
  - Files: None (empty commit)

---

- [ ] 6. Verify end-to-end functionality

  **What to do**:
  - Open news.vasdekis.com.au in browser or curl
  - Verify page loads without errors
  - Verify it calls api.vasdekis.com.au and displays data

  **Must NOT do**:
  - Don't modify any files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verification only
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocked By**: T5 (Frontend must be deployed)
  - **Blocks**: None (final verification)

  **References**:
  - `frontend/src/app/page.tsx` - Main feed page
  - `frontend/.env.local` - NEXT_PUBLIC_API_URL

  **Acceptance Criteria**:
  - [ ] `curl -s https://news.vasdekis.com.au` returns HTML
  - [ ] Page title or content indicates it's the news feed
  - [ ] No JavaScript errors in console (if using browser)

  **QA Scenarios**:

  \`\`\`
  Scenario: Frontend loads at news.vasdekis.com.au
    Tool: Bash
    Preconditions: Frontend deployed
    Steps:
      1. curl -s -w "\nHTTP_CODE:%{http_code}" "https://news.vasdekis.com.au"
    Expected Result: HTTP 200, HTML content
    Failure Indicators: 404, 500, connection refused
    Evidence: .sisyphus/evidence/task-6-frontend.html

  Scenario: Frontend makes API call
    Tool: Bash
    Preconditions: Frontend loaded
    Steps:
      1. curl -s "https://news.vasdekis.com.au" | grep -o "api.vasdekis.com.au" | head -1
    Expected Result: Found reference to API URL in page source
    Failure Indicators: API URL not found (might be hardcoded wrong)
    Evidence: .sisyphus/evidence/task-6-api-reference.txt
  \`\`\`

  **Evidence to Capture**:
  - [ ] Frontend HTML response
  - [ ] API URL reference found

  **Commit**: NO (verification only)

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read 02-CONTEXT.md and verify all decisions were implemented.
  - api.vasdekis.com.au bound via Terraform (not wrangler.toml)
  - Frontend deployed to news.vasdekis.com.au
  - CORS enabled on API
  Output: `VERDICT: APPROVE/REJECT`

- [ ] F2. **API Functionality Check** — `quick`
  `curl https://api.vasdekis.com.au/api/feed?device_id=test`
  Output: JSON response, no 1014 error

- [ ] F3. **Frontend E2E Check** — `quick`
  `curl https://news.vasdekis.com.au` loads successfully
  Output: HTML page, no errors

- [ ] F4. **Route Conflict Resolution** — `quick`
  Verify no `[[routes]]` in wrangler.toml and terraform worker_route exists
  Output: wrangler.toml clean, terraform has route

---

## Commit Strategy

| Step | Message | Files |
|------|---------|-------|
| T1 | `fix: remove [[routes]] to avoid conflict with Terraform` | workers/wrangler.toml |
| T5 | `chore: trigger frontend deploy` | (empty commit) |

---

## Success Criteria

### Verification Commands
```bash
# API accessible
curl https://api.vasdekis.com.au/api/feed?device_id=test
# Expected: JSON response, HTTP 200

# Frontend accessible
curl https://news.vasdekis.com.au
# Expected: HTML page, HTTP 200
```

### Final Checklist
- [ ] Worker at api.vasdekis.com.au (no 1014)
- [ ] Frontend at news.vasdekis.com.au
- [ ] wrangler.toml has no [[routes]] block
- [ ] Terraform has cloudflare_worker_route
- [ ] End-to-end feed loading works

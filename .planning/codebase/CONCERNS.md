# CONCERNS.md - Technical Debt & Issues

## Deployment Issues
- **API 1014 Error**: `api.vasdekis.com.au` returns Cloudflare error 1014
  - Likely: Worker route not properly configured
  - Worker `news` is deployed but not accessible
- **Frontend not deployed**: Next.js app built but not on Cloudflare Pages
- **Terraform not run**: Infrastructure not fully provisioned

## Security
- **No authentication**: Public app with device-based preferences only
- **API keys in config**: Google Drive credentials defined but not active
- **No rate limiting**: API endpoints unprotected

## Data
- **No data persistence strategy**: D1 has 4 sample articles only
- **RSS fetching not implemented**: Service planned but code incomplete
- **PDF ingestion not implemented**: Google Drive integration stubbed

## Code Quality
- **No tests**: Zero test coverage
- **No error handling docs**: Error patterns unclear
- **No logging**: Limited visibility into runtime

## Infrastructure
- **Terraform state in cloud**: `terraform/terraform.tfstate` exists but may be stale
- **Manual intervention needed**: Terraform Cloud needs manual queue

## Technical Debt
- No automated tests
- No linting/formatting enforcement visible
- No monitoring/observability

## Priority Issues
1. Fix API 1014 error (blocking all functionality)
2. Deploy frontend
3. Implement RSS fetching
4. Add tests

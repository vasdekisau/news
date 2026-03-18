# STACK.md - Technology Stack

## Languages
- **TypeScript** - Primary language for frontend and workers
- **SQL** - Database schema (D1/SQLite)
- **HCL** - Terraform configuration

## Runtimes
- **Node.js** - Frontend build (Next.js)
- **Cloudflare Workers** - Serverless runtime for API

## Frameworks

### Frontend
- **Next.js 14** (App Router) - React framework
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library (referenced in AGENTS.md)

### Backend
- **Hono** - Web framework for Cloudflare Workers
- **D1** - SQLite database on Cloudflare
- **R2** - Object storage (for PDFs)

### Infrastructure
- **Terraform** - Infrastructure as Code
- **Terraform Cloud** - Remote state management

## Key Dependencies

### Frontend (`frontend/package.json`)
- next: ^14.x
- react, react-dom
- tailwindcss
- typescript

### Workers (`workers/package.json`)
- hono
- @cloudflare/workers-types
- wrangler

## Configuration Files
- `frontend/next.config.ts` - Next.js configuration
- `frontend/tailwind.config.ts` - Tailwind configuration
- `frontend/tsconfig.json` - TypeScript config
- `workers/wrangler.toml` - Workers configuration
- `terraform/main.tf` - Cloudflare resources

## Environment
- Cloudflare Pages (frontend hosting)
- Cloudflare Workers (API)
- Cloudflare D1 (database)
- Cloudflare R2 (file storage)

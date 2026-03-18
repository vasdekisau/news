# STRUCTURE.md - Directory Structure

```
economist/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── page.tsx        # Main feed
│   │   │   ├── articles/       # All articles page
│   │   │   ├── pdfs/           # PDF list page
│   │   │   ├── settings/       # Settings page
│   │   │   ├── sources/       # Source management
│   │   │   ├── layout.tsx     # Root layout
│   │   │   └── globals.css     # Global styles
│   │   └── components/         # React components
│   │       ├── article-card.tsx
│   │       ├── header.tsx
│   │       └── theme-provider.tsx
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── package.json
│
├── workers/                     # Cloudflare Workers
│   ├── src/
│   │   ├── index.ts            # Entry point (Hono app)
│   │   └── routes/             # API routes
│   │       ├── articles.ts
│   │       ├── preferences.ts
│   │       ├── sources.ts
│   │       ├── pdfs.ts
│   │       ├── feed.ts
│   │       └── scraper.ts
│   ├── wrangler.toml
│   └── package.json
│
├── terraform/                   # Infrastructure
│   ├── main.tf                 # Cloudflare resources
│   ├── resources.tf            # Additional resources
│   ├── dns.tf                  # DNS config
│   ├── schema.sql              # D1 database schema
│   ├── terraform.tfstate
│   └── terraform.tfvars
│
├── AGENTS.md                   # Agent orchestration docs
├── SPEC.md                     # Project specification
└── README.md                   # Project readme
```

## Naming Conventions
- Routes: `*.ts` (lowercase, plural)
- Components: `PascalCase.tsx`
- Files: lowercase with hyphens

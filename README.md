# News Vasdekis

Your personalized content aggregator with thumbs up/down curation.

## Setup

### Workers
```bash
cd workers
npm install
wrangler deploy
```

### Frontend
```bash
cd frontend
npm install
npm run build
```

Deploy to Cloudflare Pages.

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS
- **Backend**: Cloudflare Workers, Hono
- **Database**: D1 (SQLite)
- **Storage**: R2 (PDFs)

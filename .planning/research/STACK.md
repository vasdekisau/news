# STACK.md - Technology Stack

## RSS Parsing

### Cloudflare Workers Compatible
- **rss-parser** (npm) — Lightweight RSS/Atom parser, works in Workers
- **feedparser** — More full-featured but larger bundle size
- **Custom SAX parser** — Minimal footprint, build your own

### Recommendation
- Use `rss-parser` for Cloudflare Workers (bundle size ~15KB)
- Parse RSS 2.0, Atom, JSON Feed formats

## Content Scraping

### Server-Side Options
- **@extractus/article-extractor** — Extracts article content, metadata
- **mozilla/readability** — Parse article content from HTML
- **cheerio** — jQuery-like DOM parsing for HTML

### Headless Browser (if needed)
- **Cloudflare Browser Rendering API** — Puppeteer in Workers
- **html2text** — Simple HTML to Markdown conversion

### Recommendation
- Start with `cheerio` + custom extraction logic
- Use Readability for article content extraction
- Avoid headless browser unless necessary (expensive)

## PDF Text Extraction

### Cloudflare Workers Compatible
- **pdf-parse** — Extract text from PDFs (Node.js compatible)
- **pdf.js (Mozilla)** — Client-side PDF rendering
- **@fs/pdf-parse** — Lightweight alternative

### Google Drive Integration
- **googleapis/googleapis** — Official Google API client
- **google-auth-library** — OAuth2 for Drive access

### Recommendation
- Use `pdf-parse` for PDF text extraction in Workers
- Stream PDFs from Drive to R2, then extract text
- Store extracted text in D1 for searchability

## Scheduling

### Cloudflare Cron Triggers
- Native Workers Cron Triggers (built into wrangler.toml)
- Schedule: `*/15 * * * *` for frequent fetches
- D1 timing limits apply

## Queue Processing
- **Cloudflare Queues** — For decoupling fetch from process
- **KV** — For rate limiting state

## Confidence Levels
- RSS parsing: HIGH — well-established, reliable libraries
- Content scraping: MEDIUM — depends on site structure
- PDF extraction: HIGH — mature libraries
- Google Drive sync: HIGH — official APIs

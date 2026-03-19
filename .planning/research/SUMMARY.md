# SUMMARY.md - Research Synthesis

## Key Findings

### Stack
- **RSS Parsing**: `rss-parser` npm package (~15KB, Workers compatible)
- **Content Scraping**: `cheerio` + `@extractus/article-extractor` or `readability`
- **PDF Extraction**: `pdf-parse` for text extraction
- **Google Drive**: Official `googleapis` npm package
- **Scheduling**: Cloudflare Cron Triggers (native to Workers)

### Table Stakes
1. RSS feed parsing and storage
2. Deduplication (URL normalization + GUID)
3. Thumbs up/down preferences per device
4. Personalized feed with preference weighting
5. Periodic fetching via cron

### Watch Out For
1. **Feed reliability** — Malformed XML, rate limiting, partial feeds
2. **Workers CPU limits** — 50ms free tier, batch processing needed
3. **D1 write limits** — 10 writes/sec, need batching
4. **Google OAuth** — Token refresh handling required
5. **PDF size** — Large PDFs may exceed memory limits

### Build Order
1. RSS fetching → Articles in D1
2. Article API endpoints
3. Preferences API
4. Personalized feed
5. Content scraping (enhancement)
6. PDF sync (parallel path)

### Confidence
- RSS parsing: HIGH confidence
- Content scraping: MEDIUM (depends on site structure)
- PDF extraction: HIGH confidence
- Google Drive: HIGH confidence (official APIs)

---
*Research synthesized from domain analysis*

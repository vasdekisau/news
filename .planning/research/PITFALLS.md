# PITFALLS.md - Common Mistakes

## RSS Aggregation Pitfalls

### Feed Reliability
- **Malformed XML** — Many RSS feeds have non-standard XML. Use forgiving parsers.
- **Feed drift** — Feeds change structure without notice. Log and monitor.
- **Rate limiting** — Don't hammer feeds. Cache aggressively.

### Article Deduplication
- **URL variations** — `?utm_source=...`, trailing slashes, case differences
- **GUID collisions** — Same GUID across feed updates
- **Content similarity** — Same story different feed

### Feed Limits
- **Partial feeds** — Some feeds only show summaries
- **Missing metadata** — No pubDate, author, or categories
- **Encoding issues** — UTF-8, ISO-8859-1, entities

## Content Scraping Pitfalls

### Blocked Requests
- **User-Agent blocking** — Sites block scrapers
- **CAPTCHA** — Cloudflare, reCAPTCHA
- **IP rate limiting** — Cloudflare Workers have shared IP

### Content Quality
- **Paywalls** — Can't extract what you can't access
- **JavaScript rendering** — Content loaded via JS
- **Infinite scroll** — Pagination not in HTML

## PDF Extraction Pitfalls

### Google Drive
- **OAuth token expiry** — Refresh tokens expire
- **Large file handling** — PDFs can be huge
- **Drive API quotas** — 1B requests/day but per-project limits

### PDF Processing
- **Scanned PDFs** — No text, need OCR
- **Image PDFs** — Same issue
- **Encrypted PDFs** — Password protected

## Architecture Pitfalls

### Workers Limitations
- **CPU time** — 50ms (free) to 30s (paid)
- **Memory** — 128MB
- **No filesystem** — Use R2/KV/D1

### D1 Limitations
- **Write limits** — 10 writes/sec per database
- **Read limits** — 100 reads/sec per database
- **No transactions** — Limited cross-table operations

## Prevention Strategies

| Pitfall | Prevention |
|---------|------------|
| Feed blocking | Use Cloudflare Cache, rotate User-Agent |
| Deduplication | Normalize URLs, use GUID |
| CPU limits | Process in batches, async |
| Token expiry | Implement token refresh |
| PDF size | Limit to first 10 pages if huge |

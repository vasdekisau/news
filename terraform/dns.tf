# DNS Record for news.vasdekis.com.au (will point to Cloudflare Pages)
resource "cloudflare_record" "news" {
  zone_id = var.cloudflare_zone_id
  name    = "news"
  content = "news-vasdekis.pages.dev"
  type    = "CNAME"
  proxied = true
}

# API subdomain (will point to Cloudflare Worker)
resource "cloudflare_record" "api" {
  zone_id = var.cloudflare_zone_id
  name    = "api"
  content = "news-vasdekis-api.workers.dev"
  type    = "CNAME"
  proxied = true
}

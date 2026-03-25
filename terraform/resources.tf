# D1 Database
resource "cloudflare_d1_database" "database" {
  account_id = var.cloudflare_account_id
  name       = "${var.project_name}-db"
}

# Workers Namespace for KV
resource "cloudflare_workers_kv_namespace" "cache" {
  account_id = var.cloudflare_account_id
  title      = "${var.project_name}-cache"
}

# Worker Route - binds api.vasdekis.com.au/* to the Worker
# Fixes 1014 error by properly establishing the route
resource "cloudflare_workers_route" "api" {
  zone_id     = var.cloudflare_zone_id
  pattern     = "api.vasdekis.com.au/*"
  script_name = "news"
}

output "d1_database_id" {
  value = cloudflare_d1_database.database.id
}

output "kv_namespace_id" {
  value = cloudflare_workers_kv_namespace.cache.id
}

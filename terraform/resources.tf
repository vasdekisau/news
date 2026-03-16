# D1 Database
resource "cloudflare_d1_database" "database" {
  account_id = var.cloudflare_account_id
  name       = "${var.project_name}-db"
}

# R2 Buckets - need separate token with R2 permissions
# For now, we'll use D1 to store PDF metadata and content as text
# Later can add R2 when token with R2 permissions is provided

# output "r2_pdfs_bucket" {
#   value = cloudflare_r2_bucket.pdfs.id
# }

# output "r2_images_bucket" {
#   value = cloudflare_r2_bucket.images.id
# }

# Workers Namespace for KV
resource "cloudflare_workers_kv_namespace" "cache" {
  account_id = var.cloudflare_account_id
  title      = "${var.project_name}-cache"
}

output "d1_database_id" {
  value = cloudflare_d1_database.database.id
}

output "kv_namespace_id" {
  value = cloudflare_workers_kv_namespace.cache.id
}

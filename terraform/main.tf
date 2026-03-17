terraform {
  required_version = ">= 1.0"

  cloud {
    organization = "vasdekisau"
    workspaces {
      name = "news"
    }
  }

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

variable "cloudflare_api_token" {
  description = "Cloudflare API Token"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
  default     = "4e50061ad5eb1f65b4d133d29e9505ea"
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for vasdekis.com.au"
  type        = string
  default     = "6b29981a73766ab0bb548604cee06ed4"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "news_vasdekis"
}

import {
  id = "4e50061ad5eb1f65b4d133d29e9505ea/news"
  to = cloudflare_worker_script.news
}

resource "cloudflare_worker_script" "news" {
  account_id = var.cloudflare_account_id
  name       = "news"
}

import {
  id = "6b29981a73766ab0bb548604cee06ed4/api.vasdekis.com.au/*"
  to = cloudflare_workers_route.api
}

resource "cloudflare_workers_route" "api" {
  zone_id = var.cloudflare_zone_id
  pattern = "api.vasdekis.com.au/*"
}

resource "cloudflare_pages_project" "frontend" {
  account_id        = var.cloudflare_account_id
  name              = "news-vasdekis"
  production_branch = "main"
}

output "account_id" {
  value = var.cloudflare_account_id
}

output "zone_id" {
  value = var.cloudflare_zone_id
}

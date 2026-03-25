-- News Vasdekis Database Schema

-- Articles from various sources
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_id TEXT,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  author TEXT,
  published_at INTEGER,
  image_url TEXT,
  category TEXT,
  tags TEXT,
  day_date TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- User preferences (device-based, no auth)
-- sentiment: positive, negative, or neutral
CREATE TABLE IF NOT EXISTS device_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  comment TEXT,
  sentiment TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  UNIQUE(device_id, article_id)
);

-- Content sources to aggregate
CREATE TABLE IF NOT EXISTS content_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  last_fetched_at INTEGER,
  fetch_interval_minutes INTEGER DEFAULT 60,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- PDFs from Google Drive or direct upload (store content as text in D1)
CREATE TABLE IF NOT EXISTS pdfs (
  id TEXT PRIMARY KEY,
  drive_file_id TEXT,
  filename TEXT NOT NULL,
  url TEXT,
  content TEXT,
  content_fixed TEXT,
  images TEXT,
  summary TEXT,
  added_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Jobs for background processing
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  payload TEXT,
  status TEXT DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Source scores per device (computed from preferences)
CREATE TABLE IF NOT EXISTS source_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  source TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  UNIQUE(device_id, source)
);

-- User interests learned from adjust comments
CREATE TABLE IF NOT EXISTS user_interests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  weight INTEGER DEFAULT 1,
  updated_at INTEGER DEFAULT (strftime('%s', 'now')),
  UNIQUE(device_id, topic)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_device_preferences_device ON device_preferences(device_id);
CREATE INDEX IF NOT EXISTS idx_content_sources_enabled ON content_sources(enabled);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_source_scores_device ON source_scores(device_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_device ON user_interests(device_id);

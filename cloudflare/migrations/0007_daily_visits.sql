CREATE TABLE IF NOT EXISTS site_daily_visits (
  visit_date TEXT PRIMARY KEY,
  visit_count INTEGER NOT NULL DEFAULT 0
);

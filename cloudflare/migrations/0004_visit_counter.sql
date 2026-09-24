CREATE TABLE IF NOT EXISTS site_visit_counter (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  visit_count INTEGER NOT NULL DEFAULT 10000,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_visit_counter (id, visit_count) VALUES (1, 10000);

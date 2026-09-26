CREATE TABLE IF NOT EXISTS quiz_players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  google_sub TEXT NOT NULL UNIQUE,
  email TEXT,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS quiz_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  score INTEGER NOT NULL,
  total INTEGER NOT NULL DEFAULT 10,
  difficulty TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(player_id, difficulty)
);
CREATE TABLE IF NOT EXISTS quiz_blocked_names (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  normalized_name TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL DEFAULT 'inadequado'
);
CREATE INDEX IF NOT EXISTS quiz_scores_rank ON quiz_scores(score DESC, updated_at ASC);
INSERT OR IGNORE INTO quiz_blocked_names (normalized_name, reason) VALUES
  ('porn', 'conteúdo sexual'), ('porno', 'conteúdo sexual'), ('pornografia', 'conteúdo sexual'),
  ('sexo', 'conteúdo sexual'), ('sex', 'conteúdo sexual'), ('xxx', 'conteúdo sexual'),
  ('nude', 'conteúdo sexual'), ('nudes', 'conteúdo sexual'), ('erotico', 'conteúdo sexual'),
  ('puta', 'linguagem ofensiva'), ('puto', 'linguagem ofensiva'), ('merda', 'linguagem ofensiva'),
  ('foda', 'linguagem ofensiva'), ('caralho', 'linguagem ofensiva'), ('buceta', 'linguagem ofensiva'),
  ('viado', 'linguagem ofensiva'), ('nazista', 'extremismo'), ('hitler', 'extremismo'),
  ('satanas', 'conteúdo incompatível'), ('satanas', 'conteúdo incompatível'), ('lucifer', 'conteúdo incompatível'),
  ('diabo', 'conteúdo incompatível'), ('demonio', 'conteúdo incompatível'),
  ('admin', 'nome reservado'), ('administrador', 'nome reservado'), ('moderador', 'nome reservado');

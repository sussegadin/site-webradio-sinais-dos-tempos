CREATE TABLE IF NOT EXISTS site_content (
  content_key TEXT PRIMARY KEY,
  content_value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_content (content_key, content_value) VALUES
  ('hero_eyebrow', 'UMA VOZ DE ESPERANÇA'),
  ('hero_title_line', 'Mensagem que'),
  ('hero_title_accent', 'transforma vidas.'),
  ('hero_description', 'Ouça, leia e compartilhe conteúdo que aproxima o coração de Deus. A Web Rádio Sinais dos Tempos está com você.'),
  ('radio_title', 'Uma programação para acompanhar você'),
  ('radio_description', 'Pregações, louvores e mensagens proféticas durante todo o dia.'),
  ('mission_kicker', 'NOSSA MISSÃO'),
  ('mission_title', 'Conteúdo que aponta para o alto.'),
  ('mission_description', 'Em cada palavra, canção e transmissão, buscamos levar paz, conhecimento bíblico e a esperança do retorno de Cristo.');

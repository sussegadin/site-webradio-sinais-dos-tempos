ALTER TABLE testimonials ADD COLUMN moderation_status TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE testimonials ADD COLUMN submitted_at TEXT;
ALTER TABLE testimonials ADD COLUMN moderated_at TEXT;
ALTER TABLE testimonials ADD COLUMN moderation_note TEXT;

UPDATE testimonials SET moderation_status='approved' WHERE moderation_status IS NULL OR moderation_status='';
CREATE INDEX IF NOT EXISTS testimonials_moderation_status ON testimonials(moderation_status, active, created_at);

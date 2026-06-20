CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contenido_id UUID NOT NULL REFERENCES contenido(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_likes_unico ON likes(contenido_id, session_id);
CREATE INDEX idx_likes_contenido ON likes(contenido_id);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de likes"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Inserción pública de likes"
  ON likes FOR INSERT
  WITH CHECK (true);

CREATE TABLE comentarios_votos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comentario_id UUID NOT NULL REFERENCES comentarios(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('like', 'dislike')),
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_comentarios_votos_unico ON comentarios_votos(comentario_id, session_id);
CREATE INDEX idx_comentarios_votos_comentario ON comentarios_votos(comentario_id);

ALTER TABLE comentarios_votos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de comentarios_votos"
  ON comentarios_votos FOR SELECT
  USING (true);

CREATE POLICY "Inserción pública de comentarios_votos"
  ON comentarios_votos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Actualización pública de comentarios_votos"
  ON comentarios_votos FOR UPDATE
  USING (true);

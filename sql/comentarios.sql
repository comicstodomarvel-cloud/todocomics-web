CREATE TABLE comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contenido_id UUID NOT NULL REFERENCES contenido(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  contenido TEXT NOT NULL CHECK (char_length(contenido) <= 300),
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comentarios_contenido ON comentarios(contenido_id, fecha DESC);

ALTER TABLE comentarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de comentarios"
  ON comentarios FOR SELECT
  USING (true);

CREATE POLICY "Inserción pública de comentarios"
  ON comentarios FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Actualización pública de comentarios"
  ON comentarios FOR UPDATE
  USING (true);

CREATE POLICY "Eliminación pública de comentarios"
  ON comentarios FOR DELETE
  USING (true);

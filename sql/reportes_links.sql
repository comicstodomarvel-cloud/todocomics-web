CREATE TABLE reportes_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contenido_id UUID NOT NULL REFERENCES contenido(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  comentario TEXT DEFAULT '',
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'verificado', 'resuelto', 'falso')),
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reportes_contenido ON reportes_links(contenido_id);
CREATE UNIQUE INDEX idx_reportes_unico ON reportes_links(contenido_id, session_id);

ALTER TABLE reportes_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de reportes_links"
  ON reportes_links FOR SELECT
  USING (true);

CREATE POLICY "Inserción pública de reportes_links"
  ON reportes_links FOR INSERT
  WITH CHECK (true);

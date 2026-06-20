CREATE TABLE peticiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  editorial TEXT NOT NULL,
  nombre_comic TEXT NOT NULL,
  numero_volumen TEXT,
  link_portada TEXT NOT NULL,
  comentarios TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'publicado', 'no_disponible')),
  respuesta_admin TEXT,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_peticiones_session ON peticiones(session_id);

ALTER TABLE peticiones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de peticiones"
  ON peticiones FOR SELECT
  USING (true);

CREATE POLICY "Inserción pública de peticiones"
  ON peticiones FOR INSERT
  WITH CHECK (true);

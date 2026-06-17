CREATE TABLE votos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contenido_id UUID NOT NULL REFERENCES contenido(id) ON DELETE CASCADE,
  valor INT NOT NULL CHECK (valor >= 1 AND valor <= 5),
  session_id TEXT NOT NULL,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_votos_unico ON votos(contenido_id, session_id);
CREATE INDEX idx_votos_contenido ON votos(contenido_id);

ALTER TABLE votos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de votos"
  ON votos FOR SELECT
  USING (true);

CREATE POLICY "Inserción pública de votos"
  ON votos FOR INSERT
  WITH CHECK (true);

CREATE TABLE presencia (
  session_id TEXT PRIMARY KEY,
  ultima_vista TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE presencia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de presencia"
  ON presencia FOR SELECT
  USING (true);

CREATE POLICY "Inserción pública de presencia"
  ON presencia FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Actualización pública de presencia"
  ON presencia FOR UPDATE
  USING (true);

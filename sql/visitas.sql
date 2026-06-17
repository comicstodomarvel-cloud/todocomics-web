CREATE TABLE visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contenido_id UUID NOT NULL REFERENCES contenido(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_visitas_contenido_fecha ON visitas(contenido_id, fecha);

ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cualquiera puede insertar visitas"
  ON visitas FOR INSERT
  USING (true);

CREATE POLICY "Cualquiera puede leer visitas"
  ON visitas FOR SELECT
  USING (true);

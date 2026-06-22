CREATE TABLE admin_notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  detalle TEXT,
  link TEXT,
  metadata JSONB,
  leida BOOLEAN NOT NULL DEFAULT false,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE admin_notificaciones ENABLE ROW LEVEL SECURITY;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE contenido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  url_portada TEXT NOT NULL DEFAULT '',
  categoria TEXT NOT NULL CHECK (categoria IN ('Comic', 'Manga', 'Pelicula', 'Serie', 'Libro')),
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  link_descarga TEXT NOT NULL DEFAULT '',
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE contenido ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos pueden leer contenido"
  ON contenido FOR SELECT
  USING (true);

CREATE POLICY "Solo admins pueden insertar contenido"
  ON contenido FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo admins pueden actualizar contenido"
  ON contenido FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Solo admins pueden eliminar contenido"
  ON contenido FOR DELETE
  USING (auth.role() = 'authenticated');

ALTER TABLE public.contenido ADD COLUMN telegram_message_id BIGINT UNIQUE;

CREATE TABLE actualizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contenido_id UUID REFERENCES contenido(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT CHECK (tipo IN ('volumen', 'correccion', 'enlace_nuevo', 'portada')),
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  telegram_message_id BIGINT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_actualizaciones_fecha ON actualizaciones(fecha DESC);
CREATE INDEX idx_actualizaciones_contenido ON actualizaciones(contenido_id);

ALTER TABLE public.actualizaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura pública de actualizaciones"
  ON public.actualizaciones
  FOR SELECT
  USING (true);

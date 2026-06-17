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

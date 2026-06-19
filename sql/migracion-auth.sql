-- ============================================================
-- Migración: Auth + Favoritos
-- Ejecutar en el SQL Editor de Supabase Studio
-- ============================================================

-- 1. Tabla de perfiles (vinculada a auth.users)
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT UNIQUE NOT NULL,
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfil visible para el propio usuario"
  ON perfiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Perfil insertable por el propio usuario"
  ON perfiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Perfil actualizable por el propio usuario"
  ON perfiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Tabla de favoritos
CREATE TABLE favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  session_id TEXT,
  contenido_id UUID REFERENCES contenido(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Un usuario solo puede tener un favorito por contenido
CREATE UNIQUE INDEX idx_favoritos_usuario_contenido
  ON favoritos(usuario_id, contenido_id)
  WHERE usuario_id IS NOT NULL;

-- Una session anónima solo puede tener un favorito por contenido
CREATE UNIQUE INDEX idx_favoritos_session_contenido
  ON favoritos(session_id, contenido_id)
  WHERE session_id IS NOT NULL;

ALTER TABLE favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Favoritos visibles para el usuario o session"
  ON favoritos FOR SELECT
  USING (
    auth.uid() = usuario_id
    OR session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "Favoritos insertables por el usuario o session"
  ON favoritos FOR INSERT
  WITH CHECK (
    auth.uid() = usuario_id
    OR session_id = current_setting('app.session_id', true)
  );

CREATE POLICY "Favoritos eliminables por el usuario o session"
  ON favoritos FOR DELETE
  USING (
    auth.uid() = usuario_id
    OR session_id = current_setting('app.session_id', true)
  );

-- 3. Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.perfiles (id, nickname, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'nickname',
      NEW.raw_user_meta_data ->> 'full_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

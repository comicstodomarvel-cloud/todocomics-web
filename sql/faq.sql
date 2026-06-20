CREATE TABLE faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pregunta TEXT NOT NULL,
  respuesta TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE faq ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de faq"
  ON faq FOR SELECT
  USING (true);

-- Insertar preguntas por defecto
INSERT INTO faq (pregunta, respuesta, orden) VALUES
  ('¿Cuál es la contraseña de los archivos?', 'La contraseña general para todos los archivos comprimidos es: <strong>todocomics</strong> (en minúsculas, sin espacios). Algunos archivos pueden tener su propia contraseña indicada en la descripción del contenido dentro del catálogo. Revisá siempre los detalles del contenido antes de descargar.', 1),
  ('¿Qué hago si la contraseña da error? No es ninguna de las contraseñas anteriores ¿Qué hago?', 'Primero asegurate de escribir la contraseña exactamente como se indica: <strong>todocomics</strong>, todo en minúsculas y sin espacios al inicio o final. Si usás un gestor de descargas, intentá descargar el archivo manualmente desde el navegador. Si el error persiste, probablemente el archivo esté dañado o haya sido reemplazado. Usá el botón <strong>"Reportar enlace caído"</strong> en la tarjeta del contenido para que podamos revisarlo y actualizarlo.', 2),
  ('¿Puedo pedir hacer peticiones?', '¡Sí! Las peticiones se realizan a través de nuestro <strong>Discord oficial</strong>. Todavía no hay un sistema automatizado de peticiones en la web, pero en Discord podés sugerir contenido y el equipo lo evaluará. También podés reportar contenido faltante desde la web usando el botón de reportar.', 3),
  ('¿Cómo descargo con Terabox?', 'Hacé clic en el enlace de descarga, se abrirá Terabox en tu navegador. Esperá que cargue la página y luego presioná el botón de descarga. En algunos casos te pedirá iniciar sesión o usar la app. Si el enlace no funciona, probá desde otro navegador o reportalo como enlace caído.', 4),
  ('¿Cómo puedo leer los archivos que descargué?', 'Depende del formato:<br><br>• <strong>CBZ / CBR:</strong> Usá CDisplayEX (Windows), Perfect Viewer (Android) o YACReader (varias plataformas).<br>• <strong>PDF:</strong> Cualquier lector de PDF.<br>• <strong>EPUB:</strong> Google Play Libros, Lithium (Android) o Calibre (PC).<br>• <strong>MP4 / MKV:</strong> VLC Media Player reproduce prácticamente todo.', 5),
  ('¿Cómo reporto un enlace caído?', 'En la tarjeta de cada contenido, debajo de la descripción, hay un botón <strong>"Reportar enlace caído"</strong>. Hacé clic y confirmá el reporte. El equipo revisará el enlace y lo reemplazará si hay una alternativa disponible.', 6),
  ('¿El sitio tiene algún costo?', 'No. <strong>TodoComics es completamente gratuito.</strong> No hay membresías, suscripciones ni pagos de ningún tipo. Todo el contenido del catálogo se puede acceder sin costo.', 7),
  ('¿Cómo puedo contactar al administrador?', 'Podés contactarnos a través de:<br><br>• <strong>Discord oficial:</strong> el widget está disponible en la página principal.<br>• <strong>Sistema de reportes:</strong> usalo para issues específicos de contenido.', 8),
  ('¿Con qué frecuencia se actualiza el catálogo?', 'El catálogo se actualiza <strong>semanalmente</strong>. Podés ver las últimas novedades desde el botón <strong>Updates</strong> en la esquina superior derecha de la página principal, o en la página dedicada de Actualizaciones.', 9),
  ('¿Qué hago si encuentro contenido duplicado?', 'Si ves un contenido repetido en el catálogo, reportalo usando el botón <strong>"Reportar enlace caído"</strong> e indicando que es un duplicado. El equipo revisará y eliminará la entrada duplicada.', 10);

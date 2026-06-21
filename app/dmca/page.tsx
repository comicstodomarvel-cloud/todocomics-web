import type { Metadata } from 'next'
import JsonLd from '@/components/JsonLd'
import Breadcrumbs from '@/components/Breadcrumbs'
import Link from 'next/link'

export const revalidate = 86400

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://todocomics.com'

export const metadata: Metadata = {
  title: 'DMCA - Aviso de Derechos de Autor | TodoComics',
  description:
    'Procedimiento para notificar infracciones de derechos de autor en TodoComics. Presenta tu reclamo DMCA y lo procesaremos rápidamente.',
  alternates: {
    canonical: '/dmca',
  },
  openGraph: {
    title: 'DMCA - Aviso de Derechos de Autor | TodoComics',
    description:
      'Procedimiento para notificar infracciones de derechos de autor en TodoComics. Presenta tu reclamo DMCA y lo procesaremos rápidamente.',
    siteName: 'TodoComics',
    url: `${siteUrl}/dmca`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DMCA - Aviso de Derechos de Autor | TodoComics',
    description:
      'Procedimiento para notificar infracciones de derechos de autor en TodoComics. Presenta tu reclamo DMCA y lo procesaremos rápidamente.',
  },
}

export default function DmcaPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="px-4 pt-6 md:px-8 md:pt-8 max-w-4xl mx-auto">
        <Breadcrumbs items={[{ label: 'DMCA' }]} />
      </div>

      <article className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 mb-3">
            DMCA — Digital Millennium Copyright Act
          </h1>
          <p className="text-zinc-400 leading-relaxed">
            TodoComics respeta los derechos de propiedad intelectual de terceros y
            cumple con la Ley de Derechos de Autor del Milenio Digital (DMCA).
            Esta página describe el procedimiento para notificar infracciones y
            nuestra política respecto a contenido presuntamente infractor.
          </p>
        </div>

        {/* 1. Designación de Agente */}
        <section>
          <h2 className="text-xl font-bold text-zinc-100 mb-3">1. Agente Designado</h2>
          <p className="text-zinc-300 leading-relaxed mb-3">
            Para presentar una notificación de infracción de derechos de autor,
            comunícate con nuestro agente designado a través de nuestro servidor de Discord:
          </p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-indigo-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-zinc-200">Servidor de Discord</p>
                <a
                  href="https://discord.gg/nKTnYSTRHE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
                >
                  discord.gg/nKTnYSTRHE
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Notificación de Infracción */}
        <section>
          <h2 className="text-xl font-bold text-zinc-100 mb-3">2. Notificación de Infracción</h2>
          <p className="text-zinc-300 leading-relaxed mb-3">
            Si crees que tu obra protegida por derechos de autor ha sido enlazada
            en TodoComics sin autorización, puedes presentar una notificación DMCA
            que debe incluir la siguiente información:
          </p>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0 text-sm">a)</span>
              <p className="text-zinc-300 text-sm leading-relaxed">
                <strong className="text-zinc-100">Identificación de la obra protegida</strong> — Describe o adjunta el título, autor y cualquier detalle que identifique el trabajo con derechos de autor que consideras infringido.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0 text-sm">b)</span>
              <p className="text-zinc-300 text-sm leading-relaxed">
                <strong className="text-zinc-100">Identificación del material infractor</strong> — Proporciona la URL o URLs específicas dentro de TodoComics donde aparece el material que reclamas.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0 text-sm">c)</span>
              <p className="text-zinc-300 text-sm leading-relaxed">
                <strong className="text-zinc-100">Tu información de contacto</strong> — Nombre completo, dirección de correo electrónico y/o número telefónico.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0 text-sm">d)</span>
              <p className="text-zinc-300 text-sm leading-relaxed">
                <strong className="text-zinc-100">Declaración de buena fe</strong> — Una declaración de que crees de buena fe que el uso del material no está autorizado por el propietario de los derechos, su agente o la ley.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0 text-sm">e)</span>
              <p className="text-zinc-300 text-sm leading-relaxed">
                <strong className="text-zinc-100">Declaración de veracidad</strong> — Una declaración de que la información en la notificación es precisa y, bajo pena de perjurio, que estás autorizado a actuar en nombre del propietario de los derechos de autor.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0 text-sm">f)</span>
              <p className="text-zinc-300 text-sm leading-relaxed">
                <strong className="text-zinc-100">Firma</strong> — Firma física o electrónica del propietario de los derechos o de su representante autorizado.
              </p>
            </div>
          </div>
          <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <p className="text-sm text-zinc-300 leading-relaxed">
              <strong className="text-amber-400">Nota importante:</strong> El envío de una notificación DMCA falsa o engañosa
              puede resultar en responsabilidad legal. Te recomendamos consultar con un
              abogado antes de presentar una notificación si no estás seguro de si el
              material infringe tus derechos.
            </p>
          </div>
        </section>

        {/* 3. Procedimiento de Notificación */}
        <section>
          <h2 className="text-xl font-bold text-zinc-100 mb-3">3. Procedimiento</h2>
          <ol className="space-y-3 text-zinc-300 leading-relaxed">
            <li className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0">1.</span>
              <p className="text-sm">Prepara tu notificación con toda la información detallada en la sección anterior.</p>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0">2.</span>
              <p className="text-sm">Envíala a través de nuestro servidor de Discord mencionando al administrador o abriendo un ticket.</p>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0">3.</span>
              <p className="text-sm">Una vez recibida, investigaremos y responderemos en un plazo máximo de 48 horas hábiles.</p>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0">4.</span>
              <p className="text-sm">Si procede, eliminaremos o deshabilitaremos el acceso al material infractor de inmediato.</p>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0">5.</span>
              <p className="text-sm">Notificaremos al usuario que publicó el enlace sobre la eliminación del material.</p>
            </li>
          </ol>
        </section>

        {/* 4. Contranotificación */}
        <section>
          <h2 className="text-xl font-bold text-zinc-100 mb-3">4. Contranotificación</h2>
          <p className="text-zinc-300 leading-relaxed mb-3">
            Si tus materiales fueron eliminados como resultado de una notificación DMCA
            y crees que no infringen derechos de autor, puedes presentar una
            contranotificación que debe incluir:
          </p>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0 text-sm">a)</span>
              <p className="text-zinc-300 text-sm leading-relaxed">
                <strong className="text-zinc-100">Identificación del material eliminado</strong> — URL o descripción del contenido que fue retirado.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0 text-sm">b)</span>
              <p className="text-zinc-300 text-sm leading-relaxed">
                <strong className="text-zinc-100">Declaración de buena fe</strong> — Bajo pena de perjurio, que crees de buena fe que el material fue eliminado por error o identificación incorrecta.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0 text-sm">c)</span>
              <p className="text-zinc-300 text-sm leading-relaxed">
                <strong className="text-zinc-100">Consentimiento de jurisdicción</strong> — Aceptas la jurisdicción del tribunal federal de tu distrito.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-500 font-bold shrink-0 text-sm">d)</span>
              <p className="text-zinc-300 text-sm leading-relaxed">
                <strong className="text-zinc-100">Firma + datos de contacto</strong> — Firma física o electrónica, nombre, dirección y correo electrónico.
              </p>
            </div>
          </div>
          <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
            Si recibimos una contranotificación válida, enviaremos una copia al
            reclamante original y restauraremos el material en un plazo de 10 a 14
            días hábiles a menos que el reclamante presente una acción judicial.
          </p>
        </section>

        {/* 5. Política de Infractores Reincidentes */}
        <section>
          <h2 className="text-xl font-bold text-zinc-100 mb-3">5. Política de Infractores Reincidentes</h2>
          <p className="text-zinc-300 leading-relaxed">
            TodoComics se reserva el derecho de suspender o cancelar el acceso de
            cualquier usuario que sea considerado infractor reincidente de derechos
            de autor. Un infractor reincidente es aquel que ha recibido tres o más
            notificaciones DMCA válidas en su contra.
          </p>
        </section>

        {/* 6. Descargo */}
        <section>
          <h2 className="text-xl font-bold text-zinc-100 mb-3">6. Descargo de Responsabilidad</h2>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <p className="text-zinc-300 text-sm leading-relaxed">
              TodoComics es un sitio web que recopila y organiza enlaces de contenido
              disponible en fuentes públicas de internet. <strong className="text-zinc-100">No almacenamos, alojamos
              ni distribuimos ningún archivo con derechos de autor en nuestros servidores.</strong>{' '}
              Todo el material compartido se encuentra originalmente en plataformas de
              terceros. Actuamos como un motor de búsqueda temático y cumpliremos con
              todas las solicitudes DMCA válidas para eliminar los enlaces
              correspondientes de nuestro catálogo.
            </p>
          </div>
        </section>

        {/* 7. Actualizaciones */}
        <section>
          <h2 className="text-xl font-bold text-zinc-100 mb-3">7. Actualizaciones de esta Política</h2>
          <p className="text-zinc-300 leading-relaxed">
            Nos reservamos el derecho de modificar esta política DMCA en cualquier
            momento. Los cambios entrarán en vigor inmediatamente después de su
            publicación en esta página. Te recomendamos revisar esta página
            periódicamente.
          </p>
          <p className="text-zinc-500 text-sm mt-2">
            Última actualización: 21 de junio de 2026.
          </p>
        </section>
      </article>

      {/* Footer */}
      <footer className="bg-zinc-900 text-zinc-500 py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm">
          <p>&copy; 2026 TodoComics. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

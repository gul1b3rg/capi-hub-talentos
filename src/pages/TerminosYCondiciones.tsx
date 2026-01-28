const TerminosYCondiciones = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <header className="mb-10 text-center">
          <h1 className="font-display text-4xl font-bold text-secondary md:text-5xl">
            Términos y Condiciones
          </h1>
          <p className="mt-4 text-sm text-secondary/70">Última actualización: Enero 2026</p>
        </header>

        <div className="rounded-3xl border border-white/40 bg-white/90 p-8 backdrop-blur-xl md:p-12">
          <div className="prose prose-secondary max-w-none space-y-6 text-secondary/80">

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">1. Información General</h2>
              <p>
                Estos Términos y Condiciones regulan el uso de la plataforma Hub CAPI (en adelante, "la Plataforma"),
                operada por la <strong>Cámara Paraguaya de Insurtech</strong> (en adelante, "CAPI"), con RUC 80136822-7
                y domicilio legal en Cruz del Chaco 604 e/ Manuel Castillo, Asunción, Paraguay.
              </p>
              <p>
                Al acceder y utilizar la Plataforma, el usuario acepta de manera expresa e irrevocable estos Términos
                y Condiciones, así como la Política de Privacidad. Si no está de acuerdo con estos términos, debe
                abstenerse de utilizar la Plataforma.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">2. Descripción de la Plataforma</h2>
              <p>
                Hub CAPI es una plataforma digital que conecta profesionales del sector asegurador con empresas y
                aseguradoras en Paraguay. Facilita:
              </p>
              <ul className="ml-6 list-disc space-y-1">
                <li>La publicación de perfiles profesionales de talentos del sector</li>
                <li>La publicación de ofertas laborales por parte de empresas</li>
                <li>La conexión entre talentos y empresas</li>
                <li>Información sobre servicios de consultoría y educación en el sector</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">3. Registro y Cuentas de Usuario</h2>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">3.1. Elegibilidad</h3>
              <p>
                Para registrarse en la Plataforma, el usuario debe ser mayor de edad según la legislación paraguaya
                (18 años o más) y tener capacidad legal para contratar.
              </p>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">3.2. Tipos de cuenta</h3>
              <ul className="ml-6 list-disc space-y-1">
                <li><strong>Talento:</strong> Profesionales del sector asegurador que buscan oportunidades laborales</li>
                <li><strong>Empresa/Aseguradora:</strong> Organizaciones que buscan contratar talento del sector</li>
              </ul>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">3.3. Veracidad de la información</h3>
              <p>
                El usuario se compromete a proporcionar información verdadera, precisa y actualizada. CAPI se reserva
                el derecho de suspender o eliminar cuentas que contengan información falsa o fraudulenta.
              </p>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">3.4. Seguridad de la cuenta</h3>
              <p>
                El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas
                las actividades realizadas bajo su cuenta.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">4. Uso Aceptable de la Plataforma</h2>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">4.1. El usuario se compromete a:</h3>
              <ul className="ml-6 list-disc space-y-1">
                <li>Utilizar la Plataforma de manera lícita y conforme a estos Términos</li>
                <li>No publicar contenido ofensivo, difamatorio, discriminatorio o ilegal</li>
                <li>Respetar los derechos de propiedad intelectual de terceros</li>
                <li>No utilizar la Plataforma para fines de spam, phishing o cualquier actividad maliciosa</li>
                <li>No intentar acceder a áreas restringidas o comprometer la seguridad de la Plataforma</li>
              </ul>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">4.2. Contenido prohibido:</h3>
              <ul className="ml-6 list-disc space-y-1">
                <li>Información falsa o engañosa</li>
                <li>Contenido que viole derechos de terceros</li>
                <li>Material pornográfico, violento u ofensivo</li>
                <li>Promoción de actividades ilegales</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">5. Propiedad Intelectual</h2>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">5.1.</h3>
              <p>
                Todos los derechos de propiedad intelectual sobre la Plataforma (diseño, código, marca, contenido)
                pertenecen a CAPI o sus licenciantes.
              </p>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">5.2.</h3>
              <p>
                El usuario conserva los derechos sobre el contenido que publica (perfil profesional, ofertas laborales),
                pero otorga a CAPI una licencia no exclusiva, mundial y gratuita para mostrar, reproducir y distribuir
                dicho contenido en la Plataforma.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">6. Responsabilidades y Limitaciones</h2>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">6.1.</h3>
              <p>
                CAPI actúa únicamente como intermediario tecnológico para facilitar la conexión entre talentos y empresas.
                No es parte de ninguna relación laboral que pueda surgir entre los usuarios.
              </p>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">6.2. CAPI no garantiza:</h3>
              <ul className="ml-6 list-disc space-y-1">
                <li>La exactitud o veracidad de la información publicada por los usuarios</li>
                <li>Que se generen contrataciones o resultados específicos</li>
                <li>La disponibilidad ininterrumpida de la Plataforma</li>
              </ul>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">6.3. CAPI no se hace responsable por:</h3>
              <ul className="ml-6 list-disc space-y-1">
                <li>Conflictos entre usuarios</li>
                <li>Daños derivados del mal uso de la Plataforma</li>
                <li>Pérdida de información por causas técnicas o fuerza mayor</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">7. Modificaciones y Terminación</h2>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">7.1.</h3>
              <p>
                CAPI se reserva el derecho de modificar estos Términos en cualquier momento. Las modificaciones entrarán
                en vigor tras su publicación en la Plataforma.
              </p>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">7.2.</h3>
              <p>
                CAPI puede suspender o eliminar cuentas que incumplan estos Términos, sin previo aviso.
              </p>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">7.3.</h3>
              <p>
                El usuario puede eliminar su cuenta en cualquier momento desde su perfil.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">8. Legislación Aplicable y Jurisdicción</h2>
              <p>
                Estos Términos se rigen por las leyes de la República del Paraguay. Cualquier controversia será
                sometida a los tribunales ordinarios de Asunción, Paraguay.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">9. Contacto</h2>
              <p>Para consultas sobre estos Términos, contactar a:</p>
              <div className="ml-4 mt-2">
                <p><strong>Cámara Paraguaya de Insurtech</strong></p>
                <p>Cruz del Chaco 604 e/ Manuel Castillo</p>
                <p>Asunción, Paraguay</p>
                <p>RUC: 80136822-7</p>
                <p>Email: <a href="mailto:info@capi.com.py" className="text-primary hover:underline">info@capi.com.py</a></p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminosYCondiciones;

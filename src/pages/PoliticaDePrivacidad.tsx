const PoliticaDePrivacidad = () => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <header className="mb-10 text-center">
          <h1 className="font-display text-4xl font-bold text-secondary md:text-5xl">
            Política de Privacidad
          </h1>
          <p className="mt-4 text-sm text-secondary/70">Última actualización: Enero 2026</p>
        </header>

        <div className="rounded-3xl border border-white/40 bg-white/90 p-8 backdrop-blur-xl md:p-12">
          <div className="prose prose-secondary max-w-none space-y-6 text-secondary/80">

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">1. Información General</h2>
              <p>
                La <strong>Cámara Paraguaya de Insurtech</strong> (CAPI), con RUC 80136822-7 y domicilio en Cruz del
                Chaco 604 e/ Manuel Castillo, Asunción, Paraguay, es responsable del tratamiento de los datos personales
                recopilados a través de la plataforma Hub CAPI.
              </p>
              <p>
                Esta Política describe qué información recopilamos, cómo la utilizamos, con quién la compartimos y
                cómo la protegemos.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">2. Datos que Recopilamos</h2>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">2.1. Información de registro</h3>
              <ul className="ml-6 list-disc space-y-1">
                <li><strong>Para talentos:</strong> nombre completo, correo electrónico, teléfono, ubicación, experiencia profesional, áreas de especialización, perfil en redes sociales profesionales</li>
                <li><strong>Para empresas:</strong> nombre de la empresa, RUC, correo electrónico, teléfono, dirección, datos del representante legal</li>
              </ul>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">2.2. Información de perfil</h3>
              <ul className="ml-6 list-disc space-y-1">
                <li>Fotografía de perfil (opcional)</li>
                <li>Biografía profesional</li>
                <li>Historial laboral y educativo</li>
                <li>Certificaciones y habilidades</li>
              </ul>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">2.3. Información de uso</h3>
              <ul className="ml-6 list-disc space-y-1">
                <li>Dirección IP</li>
                <li>Tipo de navegador y dispositivo</li>
                <li>Páginas visitadas y acciones realizadas en la Plataforma</li>
                <li>Fecha y hora de acceso</li>
              </ul>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">2.4. Cookies y tecnologías similares</h3>
              <p>
                Utilizamos cookies para mejorar la experiencia del usuario, analizar el tráfico y personalizar el contenido.
                El usuario puede configurar su navegador para rechazar cookies, aunque esto puede limitar algunas funcionalidades.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">3. Cómo Utilizamos tus Datos</h2>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">3.1. Finalidades principales</h3>
              <ul className="ml-6 list-disc space-y-1">
                <li>Crear y gestionar cuentas de usuario</li>
                <li>Mostrar perfiles de talentos a empresas registradas</li>
                <li>Facilitar la publicación y gestión de ofertas laborales</li>
                <li>Enviar notificaciones relacionadas con la Plataforma</li>
                <li>Mejorar nuestros servicios y desarrollar nuevas funcionalidades</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">3.2. Comunicaciones</h3>
              <ul className="ml-6 list-disc space-y-1">
                <li>Podemos enviar correos relacionados con el uso de la Plataforma (confirmaciones, notificaciones)</li>
                <li>Con tu consentimiento, podemos enviar información sobre eventos, cursos y novedades del sector</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">4. Con Quién Compartimos tus Datos</h2>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">4.1. Compartimos información solo en los siguientes casos</h3>
              <ul className="ml-6 list-disc space-y-1">
                <li><strong>Con otros usuarios:</strong> Los perfiles de talentos son visibles para empresas registradas. Los datos de empresas son visibles públicamente en el directorio.</li>
                <li><strong>Proveedores de servicios:</strong> Empresas que nos ayudan a operar la Plataforma (hosting, email, analytics), bajo acuerdos de confidencialidad.</li>
                <li><strong>Requisitos legales:</strong> Cuando sea requerido por ley, orden judicial o autoridad competente.</li>
              </ul>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">4.2.</h3>
              <p>
                No vendemos ni alquilamos datos personales a terceros.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">5. Seguridad de los Datos</h2>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">5.1.</h3>
              <p>
                Implementamos medidas técnicas y organizativas para proteger los datos contra acceso no autorizado,
                pérdida, alteración o divulgación.
              </p>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">5.2.</h3>
              <p>
                Utilizamos cifrado SSL/TLS para las transmisiones de datos y almacenamiento seguro en servidores con
                controles de acceso.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">6. Retención de Datos</h2>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">6.1.</h3>
              <p>
                Conservamos los datos personales mientras la cuenta esté activa y durante el tiempo necesario para
                cumplir con nuestras obligaciones legales.
              </p>

              <h3 className="mb-2 mt-4 text-lg font-semibold text-secondary">6.2.</h3>
              <p>
                Al eliminar una cuenta, los datos personales serán eliminados dentro de un plazo razonable, excepto
                aquellos que debamos conservar por obligaciones legales o contables.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">7. Tus Derechos</h2>
              <p>
                De acuerdo con la legislación paraguaya sobre protección de datos personales, tienes los siguientes derechos:
              </p>

              <ul className="ml-6 list-disc space-y-2 mt-3">
                <li><strong>7.1. Acceso:</strong> Conocer qué datos tuyos están siendo tratados</li>
                <li><strong>7.2. Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                <li><strong>7.3. Supresión:</strong> Solicitar la eliminación de tus datos</li>
                <li><strong>7.4. Oposición:</strong> Oponerte al tratamiento de tus datos en ciertos casos</li>
                <li><strong>7.5. Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
              </ul>

              <p className="mt-3">
                Para ejercer estos derechos, contactar a través de los medios indicados en la sección de contacto.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">8. Menores de Edad</h2>
              <p>
                La Plataforma no está dirigida a menores de 18 años. No recopilamos intencionalmente datos de menores.
                Si detectamos que un menor se ha registrado, eliminaremos su cuenta inmediatamente.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">9. Modificaciones a esta Política</h2>
              <p>
                Podemos actualizar esta Política periódicamente. Notificaremos cambios significativos a través de la
                Plataforma o por correo electrónico. El uso continuado tras las modificaciones constituye aceptación
                de los cambios.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-2xl font-semibold text-secondary">10. Contacto</h2>
              <p>Para consultas sobre privacidad o ejercicio de derechos:</p>
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

export default PoliticaDePrivacidad;

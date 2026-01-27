import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Educacion = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Por favor ingresá tu correo electrónico.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresá un correo electrónico válido.');
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('educacion_waitlist')
        .insert({ email: email.trim().toLowerCase() });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('Este correo ya está registrado. ¡Te avisaremos pronto!');
        } else {
          throw insertError;
        }
      } else {
        setSuccess(true);
        setEmail('');
      }
    } catch (err) {
      console.error('Error registrando email:', err);
      setError('Ocurrió un error. Por favor intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <div className="rounded-[32px] border border-secondary/10 bg-background p-10 text-center shadow-2xl">
        <p className="text-xs uppercase tracking-[0.4em] text-secondary/60">Próximamente</p>
        <h2 className="mt-2 font-display text-4xl text-secondary">Portal Educativo</h2>
        <p className="mt-3 text-secondary/70">
          Estamos construyendo un espacio dedicado a la formación y desarrollo profesional del sector asegurador paraguayo.
        </p>
        <p className="mt-2 text-secondary/60 text-sm">
          En alianza con instituciones educativas del sector, ofreceremos capacitaciones, cursos, talleres y certificaciones impartidos por expertos de la industria.
        </p>

        <div className="mt-8 rounded-3xl border border-secondary/10 bg-white p-6">
          {success ? (
            <div className="py-4">
              <p className="text-lg font-semibold text-green-600">¡Gracias por tu interés!</p>
              <p className="mt-2 text-secondary/70">Te avisaremos cuando lancemos el portal educativo.</p>
            </div>
          ) : (
            <>
              <p className="text-secondary">
                ¿Querés ser notificado cuando lancemos? Dejanos tu correo.
              </p>
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 md:flex-row">
                <input
                  type="email"
                  placeholder="tuemail@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-2xl border border-secondary/20 px-4 py-3 text-secondary focus:border-primary focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? 'Enviando...' : 'Notificarme'}
                </button>
              </form>
              {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Educacion;

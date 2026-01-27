import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Consultorias = () => {
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

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresá un correo electrónico válido.');
      return;
    }

    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('consultoria_waitlist')
        .insert({ email: email.trim().toLowerCase() });

      if (insertError) {
        if (insertError.code === '23505') {
          // Unique constraint violation
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
        <h2 className="mt-2 font-display text-4xl text-secondary">Servicios y Consultorías</h2>
        <p className="mt-3 text-secondary/70">
          Estamos preparando un espacio de servicios y consultorías para acelerar los proyectos del ecosistema asegurador.
        </p>
        <div className="mt-8 rounded-3xl border border-secondary/10 bg-white p-6">
          {success ? (
            <div className="py-4">
              <p className="text-lg font-semibold text-green-600">¡Gracias por registrarte!</p>
              <p className="mt-2 text-secondary/70">Te avisaremos cuando este espacio esté disponible.</p>
            </div>
          ) : (
            <>
              <p className="text-secondary">
                ¿Querés ofrecer tus servicios o contratar un equipo especializado? Dejanos tu correo y te avisaremos.
              </p>
              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 md:flex-row">
                <input
                  type="email"
                  placeholder="tuemail@empresa.com"
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

export default Consultorias;

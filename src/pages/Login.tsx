import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setError('Ingresá tu email y contraseña.');
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Obtener el perfil para determinar la ruta de redirección
    const userId = data.session?.user.id ?? data.user?.id;
    if (userId) {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle(); // ✅ No lanza error 406 si no encuentra

        setLoading(false);

        if (profileError) {
          console.error('Error fetching profile after login:', profileError);
          setError('Error cargando tu perfil. Por favor, intenta nuevamente.');
          return;
        }

        // Redirigir según el rol del perfil
        if (profileData?.role === 'empresa') {
          navigate('/dashboard', { replace: true });
        } else if (profileData?.role === 'talento') {
          navigate('/mi-perfil', { replace: true });
        } else {
          // Perfil no encontrado o sin rol - redirigir a perfil para completar
          console.warn('Profile not found or missing role after login');
          navigate('/mi-perfil', { replace: true });
        }
      } catch (err) {
        console.error('Unexpected error during profile fetch:', err);
        setLoading(false);
        navigate('/mi-perfil', { replace: true });
      }
    } else {
      setLoading(false);
      setError('No se pudo obtener información del usuario.');
    }
  };

  return (
    <AuthLayout
      title="Iniciar sesión"
      subtitle="Accedé a tu panel personalizado"
      footerLinks={[
        { label: '¿Aún no tenés cuenta talento?', to: '/register-talent' },
        { label: '¿Sos empresa?', to: '/register-company' },
      ]}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-secondary">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="nombre@empresa.com"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </label>
        <label className="block text-sm font-medium text-secondary">
          Contraseña
          <input
            type="password"
            className="mt-1 w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="********"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
        </label>
        {error && <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-secondary px-4 py-3 font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-secondary/70">
        ¿Olvidaste tu contraseña?{' '}
        <a href="mailto:talentos@capi.com" className="font-semibold text-primary hover:underline">
          Escríbenos
        </a>{' '}
        para ayudarte.
      </p>
    </AuthLayout>
  );
};

export default Login;

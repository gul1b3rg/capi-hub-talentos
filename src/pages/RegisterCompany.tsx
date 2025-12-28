import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { updateProfile } from '../lib/profileService';
import { supabase } from '../lib/supabaseClient';
import { useCurrentProfile } from '../context/AuthContext';

const RegisterCompany = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useCurrentProfile();

  const [form, setForm] = useState({
    companyName: '',
    email: '',
    password: '',
    location: '',
    headline: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.user?.id) {
      setError('No pudimos registrar tu empresa. Intenta nuevamente.');
      setLoading(false);
      return;
    }

    try {
      // El trigger ya creó el perfil vacío, solo actualizamos los datos
      const profile = await updateProfile(data.user.id, {
        full_name: form.companyName,
        role: 'empresa',
        location: form.location || null,
        headline: form.headline || null,
      });

      // eslint-disable-next-line no-console
      console.log('Profile updated successfully for company:', profile);

      // Refrescar el contexto para que cargue el perfil recién actualizado
      await refreshProfile(data.user.id);

      setSuccess('Registro exitoso. Redirigiendo a tu dashboard...');

      // Redirigir automáticamente después de 1.5 segundos
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (profileError) {
      // eslint-disable-next-line no-console
      console.error('Failed to update company profile:', profileError);

      setError(
        profileError instanceof Error
          ? `Error creando perfil de empresa: ${profileError.message}`
          : 'Error creando perfil de empresa. Por favor, intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Registro de Empresa"
      subtitle="Publicá vacancias y gestiona tus postulaciones"
      footerLinks={[
        { label: '¿Ya tenés cuenta?', to: '/login' },
        { label: '¿Sos talento?', to: '/register-talent' },
      ]}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-secondary">
          Nombre de la compañía
          <input
            type="text"
            className="mt-1 w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Aseguradora Fénix"
            value={form.companyName}
            onChange={(event) => setForm((prev) => ({ ...prev, companyName: event.target.value }))}
            required
          />
        </label>
        <label className="block text-sm font-medium text-secondary">
          Email corporativo
          <input
            type="email"
            className="mt-1 w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="talento@fenix.com"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </label>
        <label className="block text-sm font-medium text-secondary">
          Contraseña
          <input
            type="password"
            minLength={6}
            className="mt-1 w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
        </label>
        <label className="block text-sm font-medium text-secondary">
          Ciudad principal (opcional)
          <input
            type="text"
            className="mt-1 w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Asunción, Paraguay"
            value={form.location}
            onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
          />
        </label>
        <label className="block text-sm font-medium text-secondary">
          Titular corporativo (opcional)
          <input
            type="text"
            className="mt-1 w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Especialistas en ramos corporativos y agro"
            value={form.headline}
            onChange={(event) => setForm((prev) => ({ ...prev, headline: event.target.value }))}
          />
        </label>
        {error && <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
        {success && <p className="rounded-2xl bg-green-50 px-4 py-2 text-sm text-green-700">{success}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-secondary px-4 py-3 font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta empresa'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default RegisterCompany;

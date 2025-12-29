import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import AuthLayout from '../components/AuthLayout';
import LinkedInButton from '../components/LinkedInButton';
import { updateProfile } from '../lib/profileService';
import { supabase } from '../lib/supabaseClient';
import { useCurrentProfile } from '../context/AuthContext';

type RegistrationMode = 'choice' | 'email' | 'linkedin';

const RegisterTalent = () => {
  const navigate = useNavigate();
  const { refreshProfile } = useCurrentProfile();

  const [mode, setMode] = useState<RegistrationMode>('choice');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    location: '',
    headline: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [linkedInError, setLinkedInError] = useState<string | null>(null);
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
      setError('No pudimos crear tu usuario. Intenta nuevamente.');
      setLoading(false);
      return;
    }

    try {
      // El trigger ya creó el perfil vacío, solo actualizamos los datos
      const profile = await updateProfile(data.user.id, {
        full_name: form.fullName,
        role: 'talento',
        location: form.location || null,
        headline: form.headline || null,
      });

      // eslint-disable-next-line no-console
      console.log('Profile updated successfully for talento:', profile);

      // Refrescar el contexto para que cargue el perfil recién actualizado
      await refreshProfile(data.user.id);

      setSuccess('Registro exitoso. Redirigiendo a tu perfil...');

      // Redirigir automáticamente después de 1.5 segundos
      setTimeout(() => {
        navigate('/mi-perfil', { replace: true });
      }, 1500);
    } catch (profileError) {
      // eslint-disable-next-line no-console
      console.error('Failed to update talento profile:', profileError);

      setError(
        profileError instanceof Error
          ? `Error creando tu perfil: ${profileError.message}`
          : 'Error creando tu perfil. Por favor, intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Choice mode: Two-button choice
  if (mode === 'choice') {
    return (
      <AuthLayout
        title="Registro de Talento"
        subtitle="Elige cómo quieres registrarte"
        footerLinks={[
          { label: '¿Ya tenés cuenta?', to: '/login' },
          { label: '¿Buscás registrar tu empresa?', to: '/register-company' },
        ]}
      >
        <div className="space-y-4">
          <LinkedInButton mode="register" onError={setLinkedInError} className="w-full" />

          <button
            type="button"
            onClick={() => setMode('email')}
            className="w-full rounded-2xl border-2 border-secondary/30 bg-white px-6 py-3 font-semibold text-secondary transition hover:border-secondary hover:bg-secondary/5"
          >
            Registrarse con correo electrónico
          </button>

          {linkedInError && (
            <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-600">{linkedInError}</p>
          )}
        </div>
      </AuthLayout>
    );
  }

  // Email mode: Traditional form
  return (
    <AuthLayout
      title="Registro de Talento"
      subtitle="Crea tu perfil y accede a oportunidades curadas"
      footerLinks={[
        { label: '¿Ya tenés cuenta?', to: '/login' },
        { label: '¿Buscás registrar tu empresa?', to: '/register-company' },
      ]}
    >
      {/* Back button */}
      <button
        type="button"
        onClick={() => setMode('choice')}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-secondary/70 transition hover:text-secondary"
      >
        <FiArrowLeft className="text-lg" />
        Volver
      </button>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-secondary">
          Nombre y Apellido
          <input
            type="text"
            className="mt-1 w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Ana Gómez"
            value={form.fullName}
            onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
            required
          />
        </label>
        <label className="block text-sm font-medium text-secondary">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="ana@email.com"
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
          Ciudad / País (opcional)
          <input
            type="text"
            className="mt-1 w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Asunción, Paraguay"
            value={form.location}
            onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
          />
        </label>
        <label className="block text-sm font-medium text-secondary">
          Titular profesional (opcional)
          <input
            type="text"
            className="mt-1 w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Especialista en reaseguros y data"
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
          {loading ? 'Creando perfil...' : 'Registrarme'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default RegisterTalent;

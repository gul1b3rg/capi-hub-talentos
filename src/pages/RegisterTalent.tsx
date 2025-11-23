import { useState } from 'react';
import type { FormEvent } from 'react';
import AuthLayout from '../components/AuthLayout';
import { upsertProfile } from '../lib/profileService';
import { supabase } from '../lib/supabaseClient';

const RegisterTalent = () => {
  const [form, setForm] = useState({
    fullName: '',
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
      setError('No pudimos crear tu usuario. Intenta nuevamente.');
      setLoading(false);
      return;
    }

    try {
      await upsertProfile(data.user.id, {
        fullName: form.fullName,
        role: 'talento',
        location: form.location,
        headline: form.headline,
      });
      setSuccess('Registro exitoso. Revisá tu email para confirmar la cuenta.');
      setForm({
        fullName: '',
        email: '',
        password: '',
        location: '',
        headline: '',
      });
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : 'Error creando tu perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Registro de Talento"
      subtitle="Crea tu perfil y accede a oportunidades curadas"
      footerLinks={[
        { label: '¿Ya tenés cuenta?', to: '/login' },
        { label: '¿Buscás registrar tu empresa?', to: '/register-company' },
      ]}
    >
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

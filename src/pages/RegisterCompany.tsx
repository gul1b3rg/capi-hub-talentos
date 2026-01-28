import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaInfoCircle } from 'react-icons/fa';
import AuthLayout from '../components/AuthLayout';
import { updateProfile } from '../lib/profileService';
import { supabase } from '../lib/supabaseClient';
import { useCurrentProfile } from '../context/AuthContext';

const RegisterCompany = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, refreshProfile } = useCurrentProfile();

  const [form, setForm] = useState({
    companyName: '',
    responsibleName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirigir solo si ya es empresa
  useEffect(() => {
    if (!authLoading && user && profile && profile.role === 'empresa') {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, user, profile, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // La página se actualizará automáticamente
  };

  // Mostrar loading mientras verifica sesión
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-secondary/70">Cargando...</p>
      </div>
    );
  }

  // Si es talento, mostrar mensaje para cerrar sesión
  if (user && profile && profile.role === 'talento') {
    return (
      <AuthLayout
        title="Registrar Empresa"
        subtitle="Crear cuenta para publicar vacancias"
      >
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <p className="text-secondary">
            Actualmente tenés una sesión activa como <strong>talento</strong>.
          </p>
          <p className="mt-2 text-secondary/70">
            Para registrar una empresa, primero debés cerrar tu sesión actual.
          </p>
          <button
            onClick={handleLogout}
            className="mt-4 rounded-2xl bg-secondary px-6 py-3 font-semibold text-white transition hover:bg-secondary/90"
          >
            Cerrar sesión y continuar
          </button>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    // Validar aceptación de términos
    if (!acceptedTerms) {
      setError('Debes aceptar los Términos y Condiciones y la Política de Privacidad para continuar.');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Por favor ingresa un email válido (ej: usuario@dominio.com).');
      return;
    }

    // Validar que las contraseñas coincidan
    if (form.password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

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
      {/* Info banner */}
      <div className="mb-4 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
        <FaInfoCircle className="mt-0.5 flex-shrink-0 text-blue-500" />
        <p className="text-sm text-blue-700">
          Registrate como responsable autorizado de tu empresa para publicar vacancias y gestionar postulaciones en su nombre.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-secondary">
          Razón Social de la Empresa
          <input
            type="text"
            className="mt-1 w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Aseguradora ABC S.A."
            value={form.companyName}
            onChange={(event) => setForm((prev) => ({ ...prev, companyName: event.target.value }))}
            required
          />
        </label>
        <label className="block text-sm font-medium text-secondary">
          Nombre y Apellido del Responsable
          <input
            type="text"
            className="mt-1 w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Juan Pérez"
            value={form.responsibleName}
            onChange={(event) => setForm((prev) => ({ ...prev, responsibleName: event.target.value }))}
            required
          />
        </label>
        <label className="block text-sm font-medium text-secondary">
          Email del responsable corporativo
          <input
            type="email"
            className="mt-1 w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="responsable@aseguradora.com.py"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </label>
        <label className="block text-sm font-medium text-secondary">
          Teléfono del responsable
          <input
            type="tel"
            className="mt-1 w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="+595 981 123456"
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          />
        </label>
        <label className="block text-sm font-medium text-secondary">
          Contraseña
          <div className="relative mt-1">
            <input
              type={showPassword ? 'text' : 'password'}
              minLength={6}
              className="w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 pr-12 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary"
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </label>
        <label className="block text-sm font-medium text-secondary">
          Confirmar contraseña
          <div className="relative mt-1">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              minLength={6}
              className="w-full rounded-2xl border border-secondary/20 bg-white px-4 py-3 pr-12 text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Repetir contraseña"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary"
              tabIndex={-1}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </label>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-secondary/30 text-primary focus:ring-2 focus:ring-primary/30"
            required
          />
          <label htmlFor="acceptTerms" className="text-sm text-secondary/70">
            Acepto los{' '}
            <Link to="/terminos-y-condiciones" target="_blank" className="text-primary hover:underline">
              Términos y Condiciones
            </Link>{' '}
            y la{' '}
            <Link to="/politica-de-privacidad" target="_blank" className="text-primary hover:underline">
              Política de Privacidad
            </Link>
          </label>
        </div>

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

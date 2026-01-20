import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyProfileForm, { type CompanyFormValues } from '../components/CompanyProfileForm';
import { createCompanyProfile, fetchCompanyByOwner } from '../lib/companyService';
import { uploadCompanyLogoFromFile } from '../lib/storageService';
import { useCurrentProfile } from '../context/AuthContext';

const CompanyCreate = () => {
  const { user, profile } = useCurrentProfile();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const ensureAvailability = async () => {
      if (!user?.id) {
        setChecking(false);
        return;
      }
      try {
        const existing = await fetchCompanyByOwner(user.id);
        if (existing) {
          navigate('/empresa/editar', { replace: true });
          return;
        }
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'No pudimos verificar tu empresa.');
      } finally {
        setChecking(false);
      }
    };

    ensureAvailability();
  }, [user?.id, navigate]);

  const handleSubmit = async (values: CompanyFormValues, options?: { logoFile?: File | null }) => {
    if (!user?.id) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      let logoUrl = '';
      if (options?.logoFile) {
        logoUrl = await uploadCompanyLogoFromFile(options.logoFile, user.id);
      }
      await createCompanyProfile(user.id, { ...values, logo_url: logoUrl || undefined });
      setSuccess('Perfil de empresa creado con éxito.');
      setTimeout(() => navigate('/empresa/editar'), 1500);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Error al crear la empresa.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16">
        <p className="rounded-3xl bg-red-50 px-6 py-4 text-center text-red-600">
          Necesitas iniciar sesión para crear tu empresa.
        </p>
      </section>
    );
  }

  if (checking) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-center text-secondary/70">Verificando si ya tienes un perfil de empresa...</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">Configuración</p>
        <h1 className="mt-2 text-3xl font-semibold text-secondary">
          Hola {profile?.full_name ?? 'equipo'}, crea tu perfil de empresa
        </h1>
        <p className="mt-1 text-secondary/70">
          Estos datos alimentarán tu página pública y el dashboard interno.
        </p>
        <div className="mt-8">
          <CompanyProfileForm
            mode="create"
            onSubmit={handleSubmit}
            submitting={submitting}
            errorMessage={error}
            successMessage={success}
          />
        </div>
      </div>
    </section>
  );
};

export default CompanyCreate;

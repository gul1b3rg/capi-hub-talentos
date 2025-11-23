import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyProfileForm, { type CompanyFormValues } from '../components/CompanyProfileForm';
import { fetchCompanyByOwner, updateCompanyProfile } from '../lib/companyService';
import { uploadCompanyLogoFromFile, uploadCompanyLogoFromUrl } from '../lib/storageService';
import { useCurrentProfile } from '../context/AuthContext';

const CompanyEdit = () => {
  const { user, profile } = useCurrentProfile();
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<CompanyFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCompany = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        // eslint-disable-next-line no-console
        console.log('[CompanyEdit] Loading company for owner', user.id);
        const company = await fetchCompanyByOwner(user.id);
        if (!company) {
          // eslint-disable-next-line no-console
          console.warn('[CompanyEdit] No company found for owner, redirecting to create');
          navigate('/empresa/crear', { replace: true });
          return;
        }
        setCompanyId(company.id);
        // eslint-disable-next-line no-console
        console.log('[CompanyEdit] Company loaded', company);
        setInitialValues({
          name: company.name ?? '',
          description: company.description ?? '',
          logo_url: company.logo_url ?? '',
          website: company.website ?? '',
          industry: company.industry ?? '',
          location: company.location ?? '',
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Error cargando tu empresa.');
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, [navigate, user?.id]);

  const handleSubmit = async (values: CompanyFormValues, options?: { logoFile?: File | null }) => {
    if (!companyId) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      // eslint-disable-next-line no-console
      console.log('[CompanyEdit] Submitting form', { values, hasFile: Boolean(options?.logoFile) });
      let logoUrl = values.logo_url?.trim() ?? initialValues?.logo_url ?? '';
      if (options?.logoFile) {
        // eslint-disable-next-line no-console
        console.log('[CompanyEdit] Uploading logo from file');
        logoUrl = await uploadCompanyLogoFromFile(options.logoFile, companyId);
      } else if (logoUrl && logoUrl !== initialValues?.logo_url && /^https?:\/\//.test(logoUrl)) {
        // eslint-disable-next-line no-console
        console.log('[CompanyEdit] Uploading logo from URL');
        logoUrl = await uploadCompanyLogoFromUrl(logoUrl, companyId);
      }
      await updateCompanyProfile(companyId, { ...values, logo_url: logoUrl });
      // eslint-disable-next-line no-console
      console.log('[CompanyEdit] Company updated successfully');
      setSuccess('Perfil actualizado correctamente.');
    } catch (updateError) {
      // eslint-disable-next-line no-console
      console.error('[CompanyEdit] Error updating company', updateError);
      setError(updateError instanceof Error ? updateError.message : 'Error al actualizar.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-center text-secondary/70">Cargando datos de tu empresa...</p>
      </section>
    );
  }

  if (error && !initialValues) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16">
        <p className="rounded-3xl bg-red-50 px-6 py-4 text-center text-red-600">{error}</p>
      </section>
    );
  }

  if (!initialValues) {
    return null;
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">Mi empresa</p>
        <h1 className="mt-2 text-3xl font-semibold text-secondary">
          {profile?.full_name ?? 'Equipo'}, edita tu perfil
        </h1>
        <p className="mt-1 text-secondary/70">Actualiza la información que verán talentos y aliados.</p>
        <div className="mt-8">
          <CompanyProfileForm
            mode="edit"
            initialValues={initialValues}
            submitting={submitting}
            onSubmit={handleSubmit}
            errorMessage={error}
            successMessage={success}
          />
        </div>
      </div>
    </section>
  );
};

export default CompanyEdit;

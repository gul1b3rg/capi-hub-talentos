import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGlobe, FaMapMarkerAlt, FaIndustry } from 'react-icons/fa';
import CompanyProfileForm, { type CompanyFormValues } from '../components/CompanyProfileForm';
import { fetchCompanyByOwner, updateCompanyProfile } from '../lib/companyService';
import { uploadCompanyLogoFromFile, uploadCompanyLogoFromUrl } from '../lib/storageService';
import { useCurrentProfile } from '../context/AuthContext';

const CompanyEdit = () => {
  const { user } = useCurrentProfile();
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<CompanyFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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

      // Actualizar valores iniciales con los nuevos datos
      setInitialValues({ ...values, logo_url: logoUrl });
      setSuccess('Perfil actualizado correctamente.');
      setIsEditing(false); // Volver a modo vista

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
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
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">Mi empresa</p>
            <h1 className="mt-2 text-3xl font-semibold text-secondary">
              {isEditing ? 'Editar perfil de empresa' : initialValues.name || 'Tu Empresa'}
            </h1>
            <p className="mt-1 text-secondary/70">
              {isEditing ? 'Actualiza la información que verán talentos y aliados.' : initialValues.industry || 'Empresa del sector asegurador'}
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-full border-2 border-secondary/20 bg-white px-6 py-2 font-semibold text-secondary shadow-sm transition hover:border-secondary/40 hover:bg-secondary/5"
            >
              Editar perfil
            </button>
          )}
        </div>

        {/* Mensaje de éxito */}
        {success && !isEditing && (
          <div className="mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Vista de solo lectura */}
        {!isEditing && (
          <div className="mt-8 space-y-6">
            {/* Logo y nombre */}
            <div className="flex items-center gap-6">
              {initialValues.logo_url ? (
                <img
                  src={initialValues.logo_url}
                  alt={`Logo de ${initialValues.name}`}
                  className="h-24 w-24 rounded-2xl border-2 border-secondary/10 object-cover shadow-md"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-secondary/20 bg-gradient-to-br from-primary/20 to-secondary/20 text-3xl font-bold text-secondary">
                  {initialValues.name ? initialValues.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-semibold text-secondary">{initialValues.name || 'Nombre de empresa'}</h2>
                {initialValues.industry && (
                  <p className="mt-1 text-secondary/70">{initialValues.industry}</p>
                )}
              </div>
            </div>

            {/* Información adicional */}
            <div className="grid gap-4 md:grid-cols-2">
              {initialValues.location && (
                <div className="flex items-center gap-3 text-secondary/70">
                  <FaMapMarkerAlt className="text-primary" />
                  <span>{initialValues.location}</span>
                </div>
              )}
              {initialValues.website && (
                <div className="flex items-center gap-3 text-secondary/70">
                  <FaGlobe className="text-primary" />
                  <a
                    href={initialValues.website}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-primary hover:underline"
                  >
                    {initialValues.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {initialValues.industry && (
                <div className="flex items-center gap-3 text-secondary/70">
                  <FaIndustry className="text-primary" />
                  <span>{initialValues.industry}</span>
                </div>
              )}
            </div>

            {/* Descripción */}
            {initialValues.description && (
              <div className="rounded-2xl border border-secondary/10 bg-secondary/5 p-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary/60">Acerca de</h3>
                <p className="whitespace-pre-wrap text-secondary/80">{initialValues.description}</p>
              </div>
            )}

            {/* Si faltan datos importantes */}
            {(!initialValues.description || !initialValues.logo_url) && (
              <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm font-semibold text-yellow-800">Completa tu perfil</p>
                <p className="mt-1 text-sm text-yellow-700">
                  {!initialValues.logo_url && 'Agrega un logo. '}
                  {!initialValues.description && 'Agrega una descripción de tu empresa.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Formulario de edición */}
        {isEditing && (
          <div className="mt-8">
            <CompanyProfileForm
              mode="edit"
              initialValues={initialValues}
              submitting={submitting}
              onSubmit={handleSubmit}
              errorMessage={error}
              successMessage={success}
            />
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
              className="mt-4 w-full rounded-2xl border-2 border-secondary/20 px-6 py-3 font-semibold text-secondary transition hover:border-secondary/40 hover:bg-secondary/5"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default CompanyEdit;

import { useEffect, useState } from 'react';
import { useCurrentProfile } from '../context/AuthContext';
import { isProfileReadyForApplication, updateProfile } from '../lib/profileService';
import { uploadCvFile } from '../lib/storageService';

const experienceRanges = ['0-1 años', '1-3 años', '3-5 años', '5-8 años', '8+ años'];
const areaOptions = ['Siniestros', 'Comercial', 'TI', 'Reaseguro', 'Innovación', 'Operaciones', 'Legal', 'Finanzas'];

const TalentProfile = () => {
  const { user, profile, refreshProfile, loading } = useCurrentProfile();
  const [form, setForm] = useState({
    full_name: '',
    headline: '',
    location: '',
    experience_years: '',
    area: '',
    availability: '',
    linkedin_url: '',
    cv_url: '',
    is_public_profile: true,
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? '',
        headline: profile.headline ?? '',
        location: profile.location ?? '',
        experience_years: (profile as any).experience_years ?? '',
        area: (profile as any).area ?? '',
        availability: (profile as any).availability ?? '',
        linkedin_url: (profile as any).linkedin_url ?? '',
        cv_url: (profile as any).cv_url ?? '',
        is_public_profile: Boolean((profile as any).is_public_profile ?? true),
      });
    }
  }, [profile]);

  const handleChange = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      let cvUrl = form.cv_url;
      if (cvFile) {
        cvUrl = await uploadCvFile(cvFile, user.id);
      }

      await updateProfile(user.id, {
        full_name: form.full_name,
        headline: form.headline,
        location: form.location,
        experience_years: form.experience_years,
        area: form.area,
        availability: form.availability,
        linkedin_url: form.linkedin_url,
        cv_url: cvUrl,
        is_public_profile: form.is_public_profile,
      } as any);
      await refreshProfile(user.id);
      setSuccess('Perfil actualizado correctamente.');
      setCvFile(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No pudimos guardar tu perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-center text-secondary/70">Cargando perfil...</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-3xl border border-dashed border-secondary/30 bg-white/60 p-10 text-center shadow-xl">
          <p className="text-secondary/70">No encontramos tu perfil. Intenta volver a ingresar.</p>
        </div>
      </section>
    );
  }

  const ready = isProfileReadyForApplication({ ...profile, cv_url: form.cv_url } as any);

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-3xl border border-white/40 bg-white/90 p-8 shadow-2xl backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">Mi Perfil</p>
        <h1 className="mt-2 text-3xl font-semibold text-secondary">Actualiza tu perfil de talento</h1>
        <p className="mt-1 text-secondary/70">Este perfil se usará para tus postulaciones.</p>
        <div className="mt-2 text-xs font-semibold uppercase tracking-[0.2em]">
          {ready ? (
            <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">Listo para postular</span>
          ) : (
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-700">Faltan datos clave</span>
          )}
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm font-medium text-secondary">
              Nombre completo
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.full_name}
                onChange={(event) => handleChange('full_name', event.target.value)}
                required
              />
            </label>
            <label className="text-sm font-medium text-secondary">
              Titular / Headline
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Ej. Especialista en siniestros y data"
                value={form.headline}
                onChange={(event) => handleChange('headline', event.target.value)}
                required
              />
            </label>
            <label className="text-sm font-medium text-secondary">
              Ubicación
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Ciudad, país"
                value={form.location}
                onChange={(event) => handleChange('location', event.target.value)}
              />
            </label>
            <label className="text-sm font-medium text-secondary">
              Experiencia
              <select
                className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.experience_years}
                onChange={(event) => handleChange('experience_years', event.target.value)}
              >
                <option value="">Seleccionar</option>
                {experienceRanges.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-secondary">
              Área
              <select
                className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.area}
                onChange={(event) => handleChange('area', event.target.value)}
              >
                <option value="">Seleccionar</option>
                {areaOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-secondary">
              Disponibilidad
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Ej. Inmediata, 30 días"
                value={form.availability}
                onChange={(event) => handleChange('availability', event.target.value)}
              />
            </label>
            <label className="text-sm font-medium text-secondary">
              LinkedIn
              <input
                type="url"
                className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="https://linkedin.com/in/tu-perfil"
                value={form.linkedin_url}
                onChange={(event) => handleChange('linkedin_url', event.target.value)}
              />
            </label>
            <label className="text-sm font-medium text-secondary">
              CV (URL)
              <input
                type="url"
                className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Enlace a tu CV en la nube"
                value={form.cv_url}
                onChange={(event) => handleChange('cv_url', event.target.value)}
              />
            </label>
          </div>

          <div className="grid gap-4 rounded-2xl border border-secondary/10 bg-secondary/5 px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-secondary">Subir CV (PDF máx. 3MB)</p>
              <input
                type="file"
                accept="application/pdf"
                className="mt-2 text-sm text-secondary"
                onChange={(event) => setCvFile(event.target.files?.[0] ?? null)}
              />
              {cvFile && <p className="text-xs text-secondary/70">Archivo: {cvFile.name}</p>}
              {form.cv_url && (
                <a
                  href={form.cv_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
                >
                  Ver CV actual
                </a>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm text-secondary">
              <input
                type="checkbox"
                checked={form.is_public_profile}
                onChange={(event) => handleChange('is_public_profile', event.target.checked)}
              />
              Hacer visible mi perfil a empresas (cuando lancemos el directorio)
            </label>
          </div>

          {error && <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
          {success && <p className="rounded-2xl bg-green-50 px-4 py-2 text-sm text-green-700">{success}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-secondary px-6 py-3 font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default TalentProfile;

import { useEffect, useState } from 'react';
import { useCurrentProfile } from '../context/AuthContext';
import { isProfileReadyForApplication, updateProfile } from '../lib/profileService';
import { uploadCvFile } from '../lib/storageService';
import { validateCvFile } from '../lib/fileValidation';
import type { UploadState } from '../types/upload';
import ProgressBar from '../components/ProgressBar';
import FileUploadPreview from '../components/FileUploadPreview';

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
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    error: null,
    fileName: null,
    fileSize: null,
  });
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

  const handleCvFileChange = (file: File | null) => {
    if (!file) {
      setCvFile(null);
      setUploadState({
        status: 'idle',
        progress: 0,
        error: null,
        fileName: null,
        fileSize: null,
      });
      return;
    }

    // Validar archivo inmediatamente
    setUploadState((prev) => ({ ...prev, status: 'validating' }));

    const validation = validateCvFile(file);

    if (!validation.valid) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: validation.error ?? 'Archivo inválido',
        fileName: file.name,
        fileSize: file.size,
      });
      setCvFile(null);
      return;
    }

    // Archivo válido
    setCvFile(file);
    setUploadState({
      status: 'idle',
      progress: 0,
      error: null,
      fileName: file.name,
      fileSize: file.size,
    });
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
        // Validar nuevamente antes de subir
        const validation = validateCvFile(cvFile);
        if (!validation.valid) {
          setUploadState((prev) => ({
            ...prev,
            status: 'error',
            error: validation.error ?? 'Archivo inválido',
          }));
          throw new Error(validation.error);
        }

        // Iniciar upload con progreso
        setUploadState((prev) => ({ ...prev, status: 'uploading', progress: 0 }));

        cvUrl = await uploadCvFile(cvFile, user.id, (progress) => {
          setUploadState((prev) => ({ ...prev, progress }));
        });

        // Upload exitoso
        setUploadState((prev) => ({ ...prev, status: 'success', progress: 100 }));
      }

      await updateProfile(user.id, {
        full_name: form.full_name,
        headline: form.headline || null,
        location: form.location || null,
        experience_years: form.experience_years || null,
        area: form.area || null,
        availability: form.availability || null,
        linkedin_url: form.linkedin_url || null,
        cv_url: cvUrl,
        is_public_profile: form.is_public_profile,
      } as any);

      await refreshProfile(user.id);
      setSuccess('Perfil actualizado correctamente.');
      setCvFile(null);

      // Reset upload state después de 3 segundos
      setTimeout(() => {
        setUploadState({
          status: 'idle',
          progress: 0,
          error: null,
          fileName: null,
          fileSize: null,
        });
      }, 3000);
    } catch (submitError) {
      const errorMessage =
        submitError instanceof Error ? submitError.message : 'No pudimos guardar tu perfil.';

      setError(errorMessage);

      // Actualizar estado de upload si falló durante upload
      if (cvFile && uploadState.status === 'uploading') {
        setUploadState((prev) => ({
          ...prev,
          status: 'error',
          error: errorMessage,
        }));
      }
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
              <p className="mt-1 text-xs text-secondary/60">
                El archivo se validará antes de subir. Solo se aceptan PDFs menores a 3MB.
              </p>

              <input
                type="file"
                accept="application/pdf"
                className="mt-3 block w-full text-sm text-secondary file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
                onChange={(event) => handleCvFileChange(event.target.files?.[0] ?? null)}
                disabled={uploadState.status === 'uploading'}
              />

              {/* Preview del archivo seleccionado */}
              {uploadState.fileName && (
                <FileUploadPreview
                  fileName={uploadState.fileName}
                  fileSize={uploadState.fileSize ?? 0}
                  status={uploadState.status}
                  error={uploadState.error}
                />
              )}

              {/* Progress bar durante upload */}
              {uploadState.status === 'uploading' && (
                <div className="mt-3">
                  <ProgressBar progress={uploadState.progress} status="uploading" />
                </div>
              )}

              {/* Link al CV actual */}
              {form.cv_url && uploadState.status !== 'uploading' && (
                <a
                  href={form.cv_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
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

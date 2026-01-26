import { useEffect, useState } from 'react';
import { FaEye } from 'react-icons/fa';
import { useCurrentProfile } from '../context/AuthContext';
import { updateProfile, updateProfileAvatar } from '../lib/profileService';
import { uploadCvFile, uploadAvatarFromFile } from '../lib/storageService';
import { linkLinkedInAccount } from '../lib/linkedInAuthService';
import { validateCvFile } from '../lib/fileValidation';
import { getProfileViewCount } from '../lib/talentService';
import type { UploadState } from '../types/upload';
import type { ProfileViewCount } from '../types/talent';
import ProgressBar from '../components/ProgressBar';
import FileUploadPreview from '../components/FileUploadPreview';

const experienceRanges = ['0-1 años', '1-3 años', '3-5 años', '5-8 años', '8+ años'];
const areaOptions = ['Siniestros', 'Comercial', 'TI', 'Reaseguro', 'Innovación', 'Operaciones', 'Legal', 'Finanzas', 'Otro'];

const TalentProfile = () => {
  const { user, profile, refreshProfile, loading } = useCurrentProfile();
  const [isEditing, setIsEditing] = useState(false); // Modo vista por defecto
  const [form, setForm] = useState({
    full_name: '',
    headline: '',
    location: '',
    experience_years: '',
    area: '',
    availability: '',
    linkedin_url: '',
    cv_url: '',
    avatar_url: '',
    is_public_profile: true,
    current_company: '',
    web_url: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
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
  const [linkedinUsername, setLinkedinUsername] = useState('');
  const [viewCount, setViewCount] = useState<ProfileViewCount>({ total: 0, lastWeek: 0 });
  const [areaOther, setAreaOther] = useState('');

  useEffect(() => {
    if (profile) {
      const savedArea = (profile as any).area ?? '';
      // Detectar si el área guardada es una personalizada (no está en la lista predefinida)
      const isCustomArea = savedArea && !areaOptions.includes(savedArea);

      setForm({
        full_name: profile.full_name ?? '',
        headline: profile.headline ?? '',
        location: profile.location ?? '',
        experience_years: (profile as any).experience_years ?? '',
        area: isCustomArea ? 'Otro' : savedArea,
        availability: (profile as any).availability ?? '',
        linkedin_url: (profile as any).linkedin_url ?? '',
        cv_url: (profile as any).cv_url ?? '',
        avatar_url: (profile as any).avatar_url ?? '',
        is_public_profile: Boolean((profile as any).is_public_profile ?? true),
        current_company: (profile as any).current_company ?? '',
        web_url: (profile as any).web_url ?? '',
      });

      // Si es área personalizada, guardar en el campo de texto
      if (isCustomArea) {
        setAreaOther(savedArea);
      }

      // Extraer username de LinkedIn URL si existe
      const linkedinUrl = (profile as any).linkedin_url ?? '';
      if (linkedinUrl) {
        const match = linkedinUrl.match(/linkedin\.com\/in\/(.+?)\/?$/);
        if (match) {
          setLinkedinUsername(match[1]);
        }
      }

      // Cargar estadísticas de vistas del perfil
      const loadViewCount = async () => {
        try {
          const count = await getProfileViewCount(profile.id);
          setViewCount(count);
        } catch (err) {
          // Silently fail - no mostrar error si falla carga de estadísticas
          console.warn('Failed to load profile view count', err);
        }
      };
      loadViewCount();
    }
  }, [profile]);

  const handleChange = (field: keyof typeof form, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLinkedinUsernameChange = (username: string) => {
    setLinkedinUsername(username);
    // Construir URL completa automáticamente
    if (username.trim()) {
      const fullUrl = `https://linkedin.com/in/${username.trim()}`;
      setForm((prev) => ({ ...prev, linkedin_url: fullUrl }));
    } else {
      setForm((prev) => ({ ...prev, linkedin_url: '' }));
    }
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

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen es demasiado grande (máximo 5MB).');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload automatically after selection
    if (!user?.id) return;

    setUploadingAvatar(true);
    setError(null);

    try {
      const avatarUrl = await uploadAvatarFromFile(file, user.id);
      await updateProfileAvatar(user.id, avatarUrl);
      await refreshProfile(user.id);
      setForm((prev) => ({ ...prev, avatar_url: avatarUrl }));
      setSuccess('Foto de perfil actualizada correctamente.');
      setAvatarPreview(null);

      setTimeout(() => setSuccess(null), 3000);
    } catch (uploadError) {
      const errorMessage =
        uploadError instanceof Error ? uploadError.message : 'No pudimos subir la foto.';
      setError(errorMessage);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLinkLinkedIn = async () => {
    setError(null);
    try {
      await linkLinkedInAccount();
      // El redirect a LinkedIn sucede automáticamente
    } catch (linkError) {
      const errorMessage =
        linkError instanceof Error ? linkError.message : 'No pudimos vincular LinkedIn.';
      setError(errorMessage);
    }
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

      // Si el área es "Otro", usar el valor personalizado
      const finalArea = form.area === 'Otro' ? (areaOther || null) : (form.area || null);

      await updateProfile(user.id, {
        full_name: form.full_name,
        headline: form.headline || null,
        location: form.location || null,
        experience_years: form.experience_years || null,
        area: finalArea,
        availability: form.availability || null,
        linkedin_url: form.linkedin_url || null,
        cv_url: cvUrl,
        is_public_profile: form.is_public_profile,
        current_company: form.current_company || null,
        web_url: form.web_url || null,
      } as any);

      await refreshProfile(user.id);
      setSuccess('Perfil actualizado correctamente.');
      setCvFile(null);
      setIsEditing(false); // Volver a modo vista después de guardar

      // Reset upload state después de 3 segundos
      setTimeout(() => {
        setUploadState({
          status: 'idle',
          progress: 0,
          error: null,
          fileName: null,
          fileSize: null,
        });
        setSuccess(null); // Limpiar mensaje de éxito
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

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-3xl border border-white/40 bg-white/90 p-8 shadow-2xl backdrop-blur">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">Mi Perfil</p>
            <h1 className="mt-2 text-3xl font-semibold text-secondary">
              {isEditing ? 'Editar perfil' : form.full_name || 'Tu Perfil'}
            </h1>
            <p className="mt-1 text-secondary/70">
              {isEditing ? 'Actualiza tu información' : form.headline || 'Especialista en seguros'}
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

        {/* Estadísticas de vistas - Solo visible en modo vista */}
        {!isEditing && viewCount.total > 0 && (
          <div className="mt-6 rounded-2xl border border-secondary/10 bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
              <FaEye className="text-primary" />
              <span>Estadísticas de tu perfil</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="text-2xl font-bold text-secondary">{viewCount.total}</p>
                <p className="text-xs text-secondary/60">Vistas totales</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{viewCount.lastWeek || 0}</p>
                <p className="text-xs text-secondary/60">Última semana</p>
              </div>
              {viewCount.lastMonth !== undefined && (
                <div>
                  <p className="text-2xl font-bold text-secondary">{viewCount.lastMonth}</p>
                  <p className="text-xs text-secondary/60">Último mes</p>
                </div>
              )}
              {viewCount.uniqueViewers !== undefined && (
                <div>
                  <p className="text-2xl font-bold text-secondary">{viewCount.uniqueViewers}</p>
                  <p className="text-xs text-secondary/60">Visitantes únicos</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vista de solo lectura */}
        {!isEditing && (
          <div className="mt-8 space-y-6">
            {/* Avatar display */}
            <div className="flex items-center gap-4">
              {form.avatar_url ? (
                <img
                  src={form.avatar_url}
                  alt="Foto de perfil"
                  className="h-24 w-24 rounded-full border-2 border-secondary/20 object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-secondary/20 bg-gradient-to-br from-primary/20 to-secondary/20 text-2xl font-bold text-secondary">
                  {form.full_name ? form.full_name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-secondary">{form.full_name || 'Tu nombre'}</h2>
                <p className="text-secondary/70">{form.headline || 'Tu título profesional'}</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-secondary">Ubicación</p>
                <p className="mt-1 text-secondary/70">{form.location || 'No especificada'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary">Experiencia</p>
                <p className="mt-1 text-secondary/70">{form.experience_years || 'No especificada'}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary">Área</p>
                <p className="mt-1 text-secondary/70">
                  {form.area === 'Otro' ? (areaOther || 'No especificada') : (form.area || 'No especificada')}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-secondary">Disponibilidad</p>
                <p className="mt-1 text-secondary/70">{form.availability || 'No especificada'}</p>
              </div>
              {form.current_company && (
                <div>
                  <p className="text-sm font-semibold text-secondary">Empresa actual</p>
                  <p className="mt-1 text-secondary/70">{form.current_company}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {form.cv_url && (
                <a
                  href={form.cv_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
                >
                  Ver CV
                </a>
              )}
              {form.linkedin_url && (
                <a
                  href={form.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-secondary/10 px-5 py-2 text-sm font-semibold text-secondary hover:bg-secondary/20"
                >
                  Ver LinkedIn
                </a>
              )}
              {form.web_url && (
                <a
                  href={form.web_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-secondary/10 px-5 py-2 text-sm font-semibold text-secondary hover:bg-secondary/20"
                >
                  Sitio web
                </a>
              )}
            </div>
          </div>
        )}

        {/* Formulario de edición */}
        {isEditing && (
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
                onChange={(event) => {
                  handleChange('area', event.target.value);
                  // Limpiar área personalizada si cambia de "Otro"
                  if (event.target.value !== 'Otro') {
                    setAreaOther('');
                  }
                }}
              >
                <option value="">Seleccionar</option>
                {areaOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            {form.area === 'Otro' && (
              <label className="text-sm font-medium text-secondary">
                Especificar área
                <input
                  type="text"
                  className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Ej. Recursos Humanos, Marketing, etc."
                  value={areaOther}
                  onChange={(event) => setAreaOther(event.target.value)}
                />
              </label>
            )}
            <label className="text-sm font-medium text-secondary">
              Disponibilidad (opcional)
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Ej. Inmediata, 30 días"
                value={form.availability}
                onChange={(event) => handleChange('availability', event.target.value)}
              />
            </label>
            <label className="text-sm font-medium text-secondary">
              Empresa actual (opcional)
              <input
                type="text"
                className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Nombre de la empresa donde trabajas"
                value={form.current_company}
                onChange={(event) => handleChange('current_company', event.target.value)}
              />
            </label>
            <label className="text-sm font-medium text-secondary">
              LinkedIn
              <div className="mt-2 flex items-center gap-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
                <span className="text-secondary/60 whitespace-nowrap">linkedin.com/in/</span>
                <input
                  type="text"
                  className="flex-1 outline-none bg-transparent"
                  placeholder="tu-usuario"
                  value={linkedinUsername}
                  onChange={(event) => handleLinkedinUsernameChange(event.target.value)}
                />
              </div>
              {form.linkedin_url && (
                <p className="mt-1 text-xs text-secondary/60">
                  URL: {form.linkedin_url}
                </p>
              )}
            </label>
            <label className="text-sm font-medium text-secondary">
              Sitio web / Portfolio (opcional)
              <input
                type="url"
                className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="https://mi-sitio.com o portfolio"
                value={form.web_url}
                onChange={(event) => handleChange('web_url', event.target.value)}
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

          {/* Avatar Upload Section */}
          <div className="grid gap-4 rounded-2xl border border-secondary/10 bg-secondary/5 px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-secondary">Foto de perfil</p>
              <p className="mt-1 text-xs text-secondary/60">
                Sube una imagen (JPG, PNG, WebP) de máximo 5MB
              </p>

              {/* Avatar preview */}
              <div className="mt-3 flex items-center gap-4">
                {avatarPreview || form.avatar_url ? (
                  <img
                    src={avatarPreview || form.avatar_url}
                    alt="Vista previa"
                    className="h-20 w-20 rounded-full border-2 border-secondary/20 object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-secondary/20 bg-gradient-to-br from-primary/20 to-secondary/20 text-xl font-bold text-secondary">
                    {form.full_name ? form.full_name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-secondary file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
                    onChange={handleAvatarFileChange}
                    disabled={uploadingAvatar}
                  />

                  {uploadingAvatar && (
                    <p className="text-sm text-primary">Subiendo foto...</p>
                  )}

                  {!form.avatar_url && !uploadingAvatar && (
                    <button
                      type="button"
                      onClick={handleLinkLinkedIn}
                      className="rounded-full border border-[#0A66C2] bg-white px-4 py-1.5 text-sm font-semibold text-[#0A66C2] transition hover:bg-[#0A66C2]/5"
                    >
                      Importar desde LinkedIn
                    </button>
                  )}
                </div>
              </div>
            </div>
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
          </div>

          {error && <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
          {success && <p className="rounded-2xl bg-green-50 px-4 py-2 text-sm text-green-700">{success}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setError(null);
                setAvatarPreview(null);
                // Restaurar valores del profile
                if (profile) {
                  const savedArea = (profile as any).area ?? '';
                  const isCustomArea = savedArea && !areaOptions.includes(savedArea);
                  setForm({
                    full_name: profile.full_name ?? '',
                    headline: profile.headline ?? '',
                    location: profile.location ?? '',
                    experience_years: (profile as any).experience_years ?? '',
                    area: isCustomArea ? 'Otro' : savedArea,
                    availability: (profile as any).availability ?? '',
                    linkedin_url: (profile as any).linkedin_url ?? '',
                    cv_url: (profile as any).cv_url ?? '',
                    avatar_url: (profile as any).avatar_url ?? '',
                    is_public_profile: Boolean((profile as any).is_public_profile ?? true),
                    current_company: (profile as any).current_company ?? '',
                    web_url: (profile as any).web_url ?? '',
                  });
                  setAreaOther(isCustomArea ? savedArea : '');
                }
              }}
              className="w-1/3 rounded-2xl border-2 border-secondary/20 px-6 py-3 font-semibold text-secondary transition hover:border-secondary/40 hover:bg-secondary/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-2/3 rounded-2xl bg-secondary px-6 py-3 font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
        )}
      </div>
    </section>
  );
};

export default TalentProfile;

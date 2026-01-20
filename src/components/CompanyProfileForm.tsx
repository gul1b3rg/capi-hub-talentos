import { type FormEvent, useEffect, useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';

export interface CompanyFormValues {
  name: string;
  description: string;
  logo_url: string;
  website: string;
  industry: string;
  location: string;
}

interface CompanyProfileFormProps {
  mode: 'create' | 'edit';
  initialValues?: CompanyFormValues;
  submitting: boolean;
  errorMessage?: string | null;
  successMessage?: string | null;
  onSubmit: (values: CompanyFormValues, options?: { logoFile?: File | null }) => Promise<void> | void;
}

const defaultValues: CompanyFormValues = {
  name: '',
  description: '',
  logo_url: '',
  website: '',
  industry: '',
  location: '',
};

const MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB

const CompanyProfileForm = ({
  mode,
  initialValues,
  submitting,
  errorMessage,
  successMessage,
  onSubmit,
}: CompanyProfileFormProps) => {
  const [formValues, setFormValues] = useState<CompanyFormValues>(initialValues ?? defaultValues);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  useEffect(() => {
    if (initialValues) {
      setFormValues((prev) => ({ ...prev, ...initialValues }));
      setLogoFile(null);
      setLogoError(null);
    }
  }, [initialValues]);

  const handleChange = (field: keyof CompanyFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoFileChange = (file: File | null) => {
    setLogoError(null);

    if (file) {
      if (!file.type.startsWith('image/')) {
        setLogoError('El archivo debe ser una imagen (JPG, PNG, WebP).');
        setLogoFile(null);
        return;
      }
      if (file.size > MAX_LOGO_SIZE) {
        setLogoError(`El logo es demasiado grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo 5MB.`);
        setLogoFile(null);
        return;
      }
    }

    setLogoFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValues.name.trim() || !formValues.description.trim()) {
      setValidationError('El nombre y la descripción son obligatorios.');
      return;
    }
    if (logoError) {
      setValidationError('Corrige el error del logo antes de continuar.');
      return;
    }
    setValidationError(null);
    await onSubmit(formValues, { logoFile });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium text-secondary">
          <span className="flex items-center gap-2">
            Nombre comercial *
            <span className="group relative">
              <FaInfoCircle className="cursor-help text-secondary/40 hover:text-secondary/60" />
              <span className="absolute bottom-full left-1/2 z-10 mb-2 hidden w-52 -translate-x-1/2 rounded-lg bg-secondary p-2 text-xs font-normal text-white shadow-lg group-hover:block">
                Nombre público que aparecerá en el directorio de empresas y en las vacancias
              </span>
            </span>
          </span>
          <input
            type="text"
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="CAPI Seguros"
            value={formValues.name}
            onChange={(event) => handleChange('name', event.target.value)}
            required
          />
        </label>
        <label className="text-sm font-medium text-secondary">
          Actividad económica
          <input
            type="text"
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Aseguradora, Corredora, Startup, etc."
            value={formValues.industry}
            onChange={(event) => handleChange('industry', event.target.value)}
          />
        </label>
        <label className="text-sm font-medium text-secondary">
          Sitio web
          <input
            type="url"
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="https://capi.com.py"
            value={formValues.website}
            onChange={(event) => handleChange('website', event.target.value)}
          />
        </label>
        <label className="text-sm font-medium text-secondary">
          Ubicación
          <input
            type="text"
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Asunción, Paraguay"
            value={formValues.location}
            onChange={(event) => handleChange('location', event.target.value)}
          />
        </label>
        <label className="text-sm font-medium text-secondary">
          Logo URL
          <input
            type="url"
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="https://cdn.capi.com/logo.png"
            value={formValues.logo_url}
            onChange={(event) => handleChange('logo_url', event.target.value)}
          />
          <p className="mt-2 text-xs text-secondary/60">O carga un archivo desde tu equipo (máx. 5MB):</p>
          <input
            type="file"
            accept="image/*"
            className="mt-2 block w-full text-sm text-secondary file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
            onChange={(event) => handleLogoFileChange(event.target.files?.[0] ?? null)}
          />
          {logoError && (
            <p className="mt-2 text-xs text-red-600">{logoError}</p>
          )}
          {logoFile && !logoError && (
            <p className="mt-1 text-xs text-green-600">
              Archivo seleccionado: <span className="font-semibold">{logoFile.name}</span> ({(logoFile.size / 1024).toFixed(0)}KB)
            </p>
          )}
        </label>
      </div>
      <label className="block text-sm font-medium text-secondary">
        Descripción *
        <textarea
          className="mt-2 min-h-[150px] w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Contá más información sobre la empresa, actividad, historia, etc."
          value={formValues.description}
          onChange={(event) => handleChange('description', event.target.value)}
          required
        />
      </label>
      {validationError && <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-600">{validationError}</p>}
      {errorMessage && <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-600">{errorMessage}</p>}
      {successMessage && <p className="rounded-2xl bg-green-50 px-4 py-2 text-sm text-green-700">{successMessage}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-2xl bg-secondary px-6 py-3 font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Guardando...' : mode === 'create' ? 'Crear perfil de empresa' : 'Actualizar perfil'}
      </button>
    </form>
  );
};

export default CompanyProfileForm;

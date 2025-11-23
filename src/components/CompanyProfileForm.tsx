import { type FormEvent, useEffect, useState } from 'react';

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

  useEffect(() => {
    if (initialValues) {
      setFormValues((prev) => ({ ...prev, ...initialValues }));
      setLogoFile(null);
    }
  }, [initialValues]);

  const handleChange = (field: keyof CompanyFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValues.name.trim() || !formValues.description.trim()) {
      setValidationError('El nombre y la descripción son obligatorios.');
      return;
    }
    setValidationError(null);
    await onSubmit(formValues, { logoFile });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium text-secondary">
          Nombre comercial *
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
          Industria
          <input
            type="text"
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Seguros generales"
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
          <p className="mt-2 text-xs text-secondary/60">O carga un archivo desde tu equipo:</p>
          <input
            type="file"
            accept="image/*"
            className="mt-2 block w-full text-sm text-secondary"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setLogoFile(file);
            }}
          />
          {logoFile && (
            <p className="mt-1 text-xs text-secondary/70">
              Archivo seleccionado: <span className="font-semibold">{logoFile.name}</span>
            </p>
          )}
        </label>
      </div>
      <label className="block text-sm font-medium text-secondary">
        Descripción *
        <textarea
          className="mt-2 min-h-[150px] w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Contá qué hace tu empresa, ramos, equipo, beneficios y cultura."
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

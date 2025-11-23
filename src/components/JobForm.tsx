import { useEffect, useState } from 'react';
import TagInput from './TagInput';
import type { JobFormValues, JobStatus } from '../types/jobs';

const modalityOptions = ['Presencial', 'Híbrido', 'Remoto'];
const areaOptions = ['Siniestros', 'Comercial', 'TI', 'Innovación', 'Operaciones', 'Legal', 'Finanzas', 'Otro'];
const experienceOptions = ['0–2 años', '2–5 años', '5+ años'];
const statusOptions: JobStatus[] = ['Activa', 'Borrador', 'Cerrada'];

interface JobFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<JobFormValues>;
  submitting: boolean;
  errorMessage?: string | null;
  successMessage?: string | null;
  onSubmit: (values: JobFormValues) => Promise<void> | void;
}

const defaultValues: JobFormValues = {
  title: '',
  description: '',
  location: '',
  modality: '',
  area: '',
  seniority: '',
  salary_range: '',
  deadline: '',
  status: 'Activa',
  tags: [],
};

const JobForm = ({ mode, initialValues, submitting, errorMessage, successMessage, onSubmit }: JobFormProps) => {
  const [values, setValues] = useState<JobFormValues>({ ...defaultValues, ...initialValues });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [customArea, setCustomArea] = useState('');
  const [useCustomArea, setUseCustomArea] = useState(false);

  useEffect(() => {
    const merged = { ...defaultValues, ...initialValues };
    setValues(merged);
    const requiresCustomArea =
      merged.area.length > 0 && !areaOptions.includes(merged.area) && merged.area !== 'Otro';
    setUseCustomArea(requiresCustomArea);
    setCustomArea(requiresCustomArea ? merged.area : '');
  }, [initialValues]);

  const handleChange = (field: keyof JobFormValues, value: string | string[]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.title.trim() || !values.description.trim()) {
      setValidationError('El título y la descripción son obligatorios.');
      return;
    }
    setValidationError(null);
    await onSubmit(values);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium text-secondary">
          Título *
          <input
            type="text"
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Ej. Especialista en Siniestros"
            value={values.title}
            onChange={(event) => handleChange('title', event.target.value)}
            required
          />
        </label>
        <label className="text-sm font-medium text-secondary">
          Ubicación
          <input
            type="text"
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Asunción, Paraguay"
            value={values.location}
            onChange={(event) => handleChange('location', event.target.value)}
          />
        </label>
        <label className="text-sm font-medium text-secondary">
          Modalidad
          <select
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={values.modality}
            onChange={(event) => handleChange('modality', event.target.value)}
          >
            <option value="">Seleccionar</option>
            {modalityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-secondary">
          Área
          <select
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={useCustomArea ? 'Otro' : values.area}
            onChange={(event) => {
              const selected = event.target.value;
              if (selected === 'Otro') {
                setUseCustomArea(true);
                setCustomArea(values.area && !areaOptions.includes(values.area) ? values.area : '');
                handleChange('area', values.area && !areaOptions.includes(values.area) ? values.area : '');
              } else {
                setUseCustomArea(false);
                setCustomArea('');
                handleChange('area', selected);
              }
            }}
          >
            <option value="">Seleccionar</option>
            {areaOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {useCustomArea && (
            <input
              type="text"
              className="mt-3 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Describe el área"
              value={customArea}
              onChange={(event) => {
                setCustomArea(event.target.value);
                handleChange('area', event.target.value);
              }}
            />
          )}
        </label>
        <label className="text-sm font-medium text-secondary">
          Experiencia
          <select
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={values.seniority}
            onChange={(event) => handleChange('seniority', event.target.value)}
          >
            <option value="">Seleccionar</option>
            {experienceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-secondary">
          Rango salarial
          <input
            type="text"
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Gs. 15M - 20M + bonos"
            value={values.salary_range}
            onChange={(event) => handleChange('salary_range', event.target.value)}
          />
        </label>
        <label className="text-sm font-medium text-secondary">
          Fecha límite
          <input
            type="date"
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={values.deadline}
            onChange={(event) => handleChange('deadline', event.target.value)}
          />
        </label>
        <label className="text-sm font-medium text-secondary">
          Estado
          <select
            className="mt-2 w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={values.status}
            onChange={(event) => handleChange('status', event.target.value)}
            required
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm font-medium text-secondary">
        Descripción *
        <textarea
          className="mt-2 min-h-[200px] w-full rounded-2xl border border-secondary/20 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Describe la misión del rol, responsabilidades, stack y beneficios."
          value={values.description}
          onChange={(event) => handleChange('description', event.target.value)}
          required
        />
      </label>
      <div>
        <p className="text-sm font-medium text-secondary">Etiquetas</p>
        <div className="mt-2">
          <TagInput value={values.tags} onChange={(tags) => handleChange('tags', tags)} />
        </div>
      </div>
      {validationError && <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-600">{validationError}</p>}
      {errorMessage && <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-600">{errorMessage}</p>}
      {successMessage && (
        <p className="rounded-2xl bg-green-50 px-4 py-2 text-sm text-green-700">{successMessage}</p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-2xl bg-secondary px-6 py-3 font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Guardando...' : mode === 'create' ? 'Publicar vacancia' : 'Actualizar vacancia'}
      </button>
    </form>
  );
};

export default JobForm;

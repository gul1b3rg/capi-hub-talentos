import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import JobForm from '../components/JobForm';
import { useCurrentProfile } from '../context/AuthContext';
import { fetchJobDetail, updateJob } from '../lib/jobService';
import type { JobFormValues } from '../types/jobs';

const mapFormValues = (values: JobFormValues) => ({
  title: values.title,
  description: values.description,
  location: values.location,
  modality: values.modality,
  area: values.area,
  seniority: values.seniority,
  salary_range: values.salary_range,
  status: values.status,
  deadline: values.deadline ? new Date(values.deadline).toISOString() : null,
  published_at: values.status === 'Activa' ? new Date().toISOString() : null,
});

const JobEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useCurrentProfile();
  const [initialValues, setInitialValues] = useState<JobFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const job = await fetchJobDetail(id);
        if (job.company?.owner_id && job.company.owner_id !== user?.id) {
          setError('No tienes permisos para editar esta vacancia.');
          return;
        }
        setInitialValues({
          title: job.title,
          description: job.description,
          location: job.location ?? '',
          modality: job.modality ?? '',
          area: job.area ?? '',
          seniority: job.seniority ?? '',
          salary_range: job.salary_range ?? '',
          deadline: job.deadline ? job.deadline.split('T')[0] : '',
          status: job.status,
          tags: job.tags,
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la vacancia.');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id, user?.id]);

  const handleSubmit = async (values: JobFormValues) => {
    if (!id) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await updateJob(id, mapFormValues(values), values.tags);
      setSuccess('Vacancia actualizada correctamente.');
      setTimeout(() => navigate('/dashboard/mis-vacancias'), 1500);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo actualizar la vacancia.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-center text-secondary/70">Cargando vacancia...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16">
        <p className="rounded-3xl bg-red-50 px-6 py-4 text-center text-red-600">{error}</p>
      </section>
    );
  }

  if (!initialValues) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-3xl border border-white/40 bg-white/90 p-8 shadow-2xl backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">Editar vacancia</p>
        <h1 className="mt-2 text-3xl font-semibold text-secondary">Actualiza los detalles y república</h1>
        <div className="mt-8">
          <JobForm
            mode="edit"
            initialValues={initialValues}
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

export default JobEdit;

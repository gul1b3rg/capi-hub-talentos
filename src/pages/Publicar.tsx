import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobForm from '../components/JobForm';
import { useCurrentProfile } from '../context/AuthContext';
import { fetchCompanyByOwner } from '../lib/companyService';
import { createJob } from '../lib/jobService';
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

const Publicar = () => {
  const { user, profile } = useCurrentProfile();
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCompany = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const company = await fetchCompanyByOwner(user.id);
        if (!company) {
          setError('Necesitas crear tu empresa antes de publicar vacancias.');
        } else {
          setCompanyId(company.id);
        }
      } catch (companyError) {
        setError(companyError instanceof Error ? companyError.message : 'Error obteniendo empresa.');
      } finally {
        setLoading(false);
      }
    };

    loadCompany();
  }, [user?.id]);

  const handleSubmit = async (values: JobFormValues) => {
    if (!companyId) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await createJob(companyId, mapFormValues(values), values.tags);
      setSuccess('Vacancia creada con éxito.');
      setTimeout(() => navigate('/dashboard/mis-vacancias'), 1500);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No pudimos crear la vacancia.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-center text-secondary/70">Verificando tu empresa...</p>
      </section>
    );
  }

  if (!companyId) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-3xl border border-dashed border-secondary/30 bg-white/60 p-10 text-center shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">Publicar</p>
          <h1 className="mt-3 text-3xl font-semibold text-secondary">Necesitas crear tu empresa</h1>
          <p className="mt-2 text-secondary/70">Crea tu perfil de empresa antes de publicar vacancias.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <div className="rounded-3xl border border-white/40 bg-white/90 p-8 shadow-2xl backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">Publicar vacancia</p>
        <h1 className="mt-2 text-3xl font-semibold text-secondary">
          {profile?.full_name ?? 'Equipo'}, comparte una nueva oportunidad
        </h1>
        <p className="mt-1 text-secondary/70">Completa los campos para llegar al pool de talentos aseguradores.</p>
        <div className="mt-8">
          <JobForm
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

export default Publicar;

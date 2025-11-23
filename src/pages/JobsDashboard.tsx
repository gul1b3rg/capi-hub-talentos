import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentProfile } from '../context/AuthContext';
import { fetchCompanyByOwner } from '../lib/companyService';
import { duplicateJob, fetchCompanyJobs, updateJobStatus } from '../lib/jobService';
import type { JobWithRelations } from '../lib/jobService';

const JobsDashboard = () => {
  const { user, profile } = useCurrentProfile();
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadJobs = async (ownerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const company = await fetchCompanyByOwner(ownerId);
      if (!company) {
        setError('Crea tu empresa para gestionar vacancias.');
        return;
      }
      setCompanyId(company.id);
      const list = await fetchCompanyJobs(company.id);
      setJobs(list);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No pudimos cargar tus vacancias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadJobs(user.id);
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const handleStatusChange = async (jobId: string, status: 'Activa' | 'Cerrada') => {
    try {
      await updateJobStatus(jobId, status);
      setFeedback(`Vacancia ${status === 'Activa' ? 'reabierta' : 'cerrada'} correctamente.`);
      if (user?.id) loadJobs(user.id);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'No se pudo actualizar el estado.');
    }
  };

  const handleDuplicate = async (jobId: string) => {
    if (!companyId) return;
    try {
      const copy = await duplicateJob(jobId, companyId);
      navigate(`/editar-vacancia/${copy.id}`);
    } catch (duplicateError) {
      setError(duplicateError instanceof Error ? duplicateError.message : 'No se pudo duplicar la vacancia.');
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-center text-secondary/70">Cargando vacancias...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="rounded-3xl bg-red-50 px-6 py-4 text-center text-red-600">{error}</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">Mis vacancias</p>
          <h1 className="text-3xl font-semibold text-secondary">
            {profile?.full_name ?? 'Equipo'}, gestiona tus oportunidades
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/publicar')}
          className="rounded-full bg-secondary px-6 py-3 font-semibold text-white"
        >
          Publicar nueva vacancia
        </button>
      </div>
      {feedback && <p className="mt-4 rounded-2xl bg-green-50 px-4 py-2 text-sm text-green-700">{feedback}</p>}
      {jobs.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-secondary/30 bg-white/70 p-10 text-center shadow-xl">
          <p className="text-secondary/70">Todavía no tienes vacancias registradas.</p>
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {jobs.map((job) => (
            <article key={job.id} className="rounded-3xl border border-white/40 bg-white/90 p-6 shadow-lg backdrop-blur">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-secondary/60">{job.status}</p>
                  <h2 className="text-2xl font-semibold text-secondary">{job.title}</h2>
                  <p className="text-sm text-secondary/70">
                    {job.location ?? 'Ubicación flexible'} · {job.modality ?? 'Modalidad'} ·{' '}
                    {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Sin fecha'}
                  </p>
                  <p className="text-xs text-secondary/60">
                    Publicada:{' '}
                    {job.published_at ? new Date(job.published_at).toLocaleDateString() : 'Borrador'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/editar-vacancia/${job.id}`)}
                    className="rounded-full border border-secondary/20 px-4 py-2 text-sm font-semibold text-secondary"
                  >
                    Editar
                  </button>
                  {job.status === 'Activa' ? (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(job.id, 'Cerrada')}
                      className="rounded-full border border-secondary/20 px-4 py-2 text-sm font-semibold text-secondary"
                    >
                      Cerrar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(job.id, 'Activa')}
                      className="rounded-full border border-secondary/20 px-4 py-2 text-sm font-semibold text-secondary"
                    >
                      Reabrir
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDuplicate(job.id)}
                    className="rounded-full border border-secondary/20 px-4 py-2 text-sm font-semibold text-secondary"
                  >
                    Duplicar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default JobsDashboard;

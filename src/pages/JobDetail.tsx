import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCurrentProfile } from '../context/AuthContext';
import { fetchJobDetail, type JobWithRelations } from '../lib/jobService';

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { role, user } = useCurrentProfile();
  const [job, setJob] = useState<JobWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const detail = await fetchJobDetail(id);
        setJob(detail);
      } catch (jobError) {
        setError(jobError instanceof Error ? jobError.message : 'No se pudo cargar la vacancia.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-center text-secondary/70">Cargando vacancia...</p>
      </section>
    );
  }

  if (error || !job) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16">
        <p className="rounded-3xl bg-red-50 px-6 py-4 text-center text-red-600">{error ?? 'Vacancia no encontrada'}</p>
      </section>
    );
  }

  const isOwner = role === 'empresa' && job.company?.owner_id === user?.id;

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-3xl border border-white/40 bg-white/90 p-8 shadow-2xl backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-secondary/60">{job.company?.name ?? 'Empresa'}</p>
            <h1 className="mt-2 text-3xl font-semibold text-secondary">{job.title}</h1>
            <p className="text-secondary/70">
              {job.location ?? 'Ubicación flexible'} · {job.modality ?? 'Modalidad a definir'}
            </p>
          </div>
          {job.company && (
            <Link
              to={`/empresa/${job.company.id}`}
              className="rounded-full border border-secondary/20 px-5 py-2 text-sm font-semibold text-secondary"
            >
              Ver empresa
            </Link>
          )}
        </div>
        <div className="mt-6 grid gap-4 text-sm text-secondary/70 md:grid-cols-2">
          <p>
            <span className="font-semibold text-secondary">Área:</span> {job.area ?? 'No especificado'}
          </p>
          <p>
            <span className="font-semibold text-secondary">Seniority:</span> {job.seniority ?? 'No especificado'}
          </p>
          <p>
            <span className="font-semibold text-secondary">Salario:</span> {job.salary_range ?? 'No detallado'}
          </p>
          <p>
            <span className="font-semibold text-secondary">Fecha límite:</span>{' '}
            {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Abierta'}
          </p>
        </div>
        <article className="mt-6 whitespace-pre-line text-secondary/80">{job.description}</article>
        <div className="mt-6 flex flex-wrap gap-2">
          {job.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-background px-3 py-1 text-sm text-secondary">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {role === 'talento' && (
            <button
              type="button"
              className="rounded-full bg-secondary px-6 py-3 font-semibold text-white"
              disabled
            >
              Postularme (Próximamente)
            </button>
          )}
          {isOwner && (
            <Link
              to={`/editar-vacancia/${job.id}`}
              className="rounded-full border border-secondary/20 px-6 py-3 font-semibold text-secondary"
            >
              Editar vacancia
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default JobDetail;

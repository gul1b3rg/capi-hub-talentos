import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCurrentProfile } from '../context/AuthContext';
import { fetchJobDetail, type JobWithRelations } from '../lib/jobService';
import { isProfileReadyForApplication } from '../lib/profileService';
import { createApplication, checkIfAlreadyApplied } from '../lib/applicationService';

const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { role, user, profile } = useCurrentProfile();
  const [job, setJob] = useState<JobWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

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

  // Verificar si ya se postuló
  useEffect(() => {
    const checkApplication = async () => {
      if (!id || !user?.id || role !== 'talento') return;
      try {
        const applied = await checkIfAlreadyApplied(id, user.id);
        setAlreadyApplied(applied);
      } catch (err) {
        console.error('[JobDetail] Error checking application', err);
      }
    };

    checkApplication();
  }, [id, user?.id, role]);

  // Handler para postularse
  const handleApply = async () => {
    if (!id || !user?.id || !profile) return;

    if (!isProfileReadyForApplication(profile)) {
      alert('Debes completar tu perfil (nombre, titular y CV) antes de postularte.');
      return;
    }

    setApplying(true);
    setError(null);

    try {
      await createApplication(id, user.id, profile);
      setApplicationSuccess(true);
      setAlreadyApplied(true);
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : 'No pudimos procesar tu postulación.'
      );
    } finally {
      setApplying(false);
    }
  };

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
        <div className="mt-8 flex flex-col gap-3">
          {role === 'talento' && (
            <>
              {applicationSuccess && (
                <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
                  ¡Postulación enviada exitosamente! La empresa revisará tu perfil pronto.
                </div>
              )}

              {!profile || !isProfileReadyForApplication(profile) ? (
                <div className="rounded-2xl bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                  Completa tu perfil (nombre, titular y CV) para poder postularte.
                  <Link to="/mi-perfil" className="ml-2 font-semibold underline">
                    Ir a mi perfil
                  </Link>
                </div>
              ) : alreadyApplied ? (
                <button
                  type="button"
                  disabled
                  className="rounded-full bg-green-600 px-6 py-3 font-semibold text-white cursor-not-allowed"
                >
                  Ya te postulaste
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applying || job.status !== 'Activa'}
                  className="rounded-full bg-secondary px-6 py-3 font-semibold text-white hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {applying ? 'Postulando...' : 'Postularme'}
                </button>
              )}
            </>
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

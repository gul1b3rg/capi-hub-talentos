import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentProfile } from '../context/AuthContext';
import {
  fetchApplicationsByTalent,
  type ApplicationWithRelations,
} from '../lib/applicationService';
import { APPLICATION_STATUS_COLORS } from '../types/applications';

const TalentApplications = () => {
  const { profile, user } = useCurrentProfile();
  const [applications, setApplications] = useState<ApplicationWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      try {
        const data = await fetchApplicationsByTalent(user.id);
        setApplications(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'No pudimos cargar tus postulaciones.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [user?.id]);

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-center text-secondary/70">Cargando postulaciones...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="rounded-3xl bg-red-50 px-6 py-4 text-center text-red-600">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">
          Mis Postulaciones
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-secondary">
          {profile
            ? `${profile.full_name}, este es tu progreso`
            : 'Seguimiento de postulaciones'}
        </h1>
        <p className="mt-2 text-secondary/70">
          Conecta con las empresas aseguradoras y consultoras que buscan tu talento.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-secondary/30 bg-white/60 p-10 text-center shadow-xl">
          <p className="text-secondary/70">
            Aún no tienes postulaciones. Explora las vacancias disponibles.
          </p>
          <Link
            to="/vacancias"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-secondary px-6 py-3 font-semibold text-white hover:bg-secondary/90"
          >
            Ver vacancias
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <article
              key={application.id}
              className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg backdrop-blur"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  {application.company?.logo_url && (
                    <img
                      src={application.company.logo_url}
                      alt={application.company.name}
                      className="h-12 w-12 rounded-xl object-contain"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-secondary/60">
                      {application.company?.name ?? 'Empresa'}
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold text-secondary">
                      {application.job?.title ?? 'Vacancia'}
                    </h2>
                    <p className="text-sm text-secondary/70">
                      {application.job?.location} · {application.job?.modality}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-secondary/70">
                    Postulado el {new Date(application.created_at).toLocaleDateString()}
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-4 py-1 text-sm font-semibold ${APPLICATION_STATUS_COLORS[application.status]}`}
                  >
                    {application.status}
                  </span>
                </div>
              </div>

              {application.notes && (
                <div className="mt-4 rounded-2xl bg-secondary/5 px-4 py-3">
                  <p className="text-sm font-semibold text-secondary">
                    Notas de la empresa:
                  </p>
                  <p className="mt-1 text-sm text-secondary/70">
                    {application.notes}
                  </p>
                </div>
              )}

              <div className="mt-4 flex gap-3">
                <Link
                  to={`/vacancia/${application.job_id}`}
                  className="rounded-full border border-secondary/20 px-4 py-2 text-sm font-semibold text-secondary hover:bg-secondary/5"
                >
                  Ver vacancia
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default TalentApplications;

import { useMemo } from 'react';
import { useCurrentProfile } from '../context/AuthContext';

const TalentApplications = () => {
  const { profile } = useCurrentProfile();

  const sampleApplications = useMemo(
    () => [
      {
        id: 'app-1',
        jobTitle: 'Analista Sr. de Siniestros',
        company: 'Mapfre Paraguay',
        status: 'En revisión',
        appliedAt: '2025-02-01',
      },
      {
        id: 'app-2',
        jobTitle: 'Especialista en Reaseguros',
        company: 'Aseguradora Fénix',
        status: 'Entrevista agendada',
        appliedAt: '2025-01-28',
      },
    ],
    [],
  );

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">Mis Postulaciones</p>
        <h1 className="mt-4 text-3xl font-semibold text-secondary">
          {profile ? `${profile.full_name}, este es tu progreso` : 'Seguimiento de postulaciones'}
        </h1>
        <p className="mt-2 text-secondary/70">
          Conecta con las empresas aseguradoras y consultoras que buscan tu talento.
        </p>
      </div>

      <div className="space-y-4">
        {sampleApplications.map((application) => (
          <article
            key={application.id}
            className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg backdrop-blur"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-secondary/60">{application.company}</p>
                <h2 className="mt-1 text-2xl font-semibold text-secondary">{application.jobTitle}</h2>
              </div>
              <div className="text-right">
                <p className="text-sm text-secondary/70">Postulado el {new Date(application.appliedAt).toLocaleDateString()}</p>
                <span className="mt-2 inline-flex rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
                  {application.status}
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm text-secondary/70">
              Próximamente verás actualizaciones en tiempo real desde el panel de las empresas.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TalentApplications;

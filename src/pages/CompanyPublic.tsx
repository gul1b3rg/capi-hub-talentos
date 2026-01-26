import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaEnvelope, FaPhone } from 'react-icons/fa';
import {
  fetchActiveJobsForCompany,
  fetchCompanyById,
  type Company,
  type JobSummary,
} from '../lib/companyService';

const CompanyPublic = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError('Empresa no encontrada.');
        setLoading(false);
        return;
      }
      try {
        const [companyData, jobsData] = await Promise.all([
          fetchCompanyById(id),
          fetchActiveJobsForCompany(id),
        ]);
        if (!companyData) {
          setError('No encontramos esta empresa.');
        } else {
          setCompany(companyData);
          setJobs(jobsData);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Error cargando la empresa.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-center text-secondary/70">Cargando perfil público...</p>
      </section>
    );
  }

  if (error || !company) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-8">
        <p className="rounded-3xl bg-red-50 px-6 py-4 text-center text-red-600">{error ?? 'Empresa no encontrada'}</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-2xl backdrop-blur">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={`Logo de ${company.name}`}
              className="h-24 w-24 rounded-2xl border border-secondary/10 object-cover p-2"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-secondary/10 bg-secondary/5 text-3xl font-bold text-secondary">
              {company.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-secondary/60">
              {company.industry ?? 'Industria aseguradora'}
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-secondary">{company.name}</h1>
            <p className="mt-1 text-secondary/70">{company.location ?? 'Latam'}</p>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center text-sm font-semibold text-primary hover:underline"
              >
                Visitar sitio web
              </a>
            )}
            {/* Contacto corporativo */}
            <div className="mt-3 flex flex-wrap gap-4">
              {company.corporate_email && (
                <a
                  href={`mailto:${company.corporate_email}`}
                  className="flex items-center gap-2 text-sm text-secondary/70 hover:text-primary"
                >
                  <FaEnvelope className="text-primary" />
                  {company.corporate_email}
                </a>
              )}
              {company.corporate_phone && (
                <span className="flex items-center gap-2 text-sm text-secondary/70">
                  <FaPhone className="text-primary" />
                  {company.corporate_phone}
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="mt-8 whitespace-pre-line text-secondary/80">
          {company.description ?? 'Esta empresa aún no agregó una descripción detallada.'}
        </p>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-secondary">Vacancias activas</h2>
        {jobs.length === 0 ? (
          <p className="mt-4 rounded-3xl border border-dashed border-secondary/20 px-4 py-6 text-center text-secondary/60">
            Actualmente no hay vacancias activas de esta empresa.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {jobs.map((job) => (
              <article
                key={job.id}
                className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-xl backdrop-blur"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-secondary/50">Vacancia</p>
                    <h3 className="text-2xl font-semibold text-secondary">{job.title}</h3>
                    <p className="text-secondary/70">
                      {job.location ?? 'Ubicación flexible'} • {job.modality ?? 'Modalidad a definir'}
                    </p>
                  </div>
                  <Link
                    to={`/vacancia/${job.id}`}
                    className="inline-flex items-center justify-center rounded-full border border-primary/30 px-5 py-2 font-semibold text-primary transition hover:border-primary"
                  >
                    Ver detalle
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CompanyPublic;

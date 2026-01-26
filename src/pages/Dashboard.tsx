import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentProfile } from '../context/AuthContext';
import {
  countActiveJobs,
  countNewApplications,
  countSavedTalents,
  fetchCompanyByOwner,
  type Company,
} from '../lib/companyService';

interface Metrics {
  activeJobs: number;
  newApplications: number;
  savedTalents: number;
}

const Dashboard = () => {
  const { profile, user } = useCurrentProfile();
  const [company, setCompany] = useState<Company | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({
    activeJobs: 0,
    newApplications: 0,
    savedTalents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const companyData = await fetchCompanyByOwner(user.id);
        if (!companyData) {
          setCompany(null);
          setMetrics({ activeJobs: 0, newApplications: 0, savedTalents: 0 });
        } else {
          setCompany(companyData);
          const [activeJobs, newApplications, savedTalents] = await Promise.all([
            countActiveJobs(companyData.id),
            countNewApplications(companyData.id),
            countSavedTalents(companyData.id),
          ]);
          setMetrics({ activeJobs, newApplications, savedTalents });
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No pudimos cargar el dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [user?.id]);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-center text-secondary/70">Preparando tu panel...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-8">
        <p className="rounded-3xl bg-red-50 px-6 py-4 text-center text-red-600">{error}</p>
      </section>
    );
  }

  if (!company) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-3xl border border-dashed border-secondary/30 bg-white/60 p-10 text-center shadow-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold text-secondary">Configura tu empresa para comenzar</h1>
          <p className="mt-2 text-secondary/70">
            Antes de ver métricas, necesitamos que completes el perfil de tu empresa.
          </p>
          <Link
            to="/empresa/crear"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-secondary px-6 py-3 font-semibold text-white"
          >
            Crear perfil de empresa
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-[32px] border border-white/40 bg-white/80 p-10 shadow-2xl backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">Bienvenida</p>
        <h1 className="mt-2 text-4xl font-semibold text-secondary">
          Hola {profile?.full_name ?? 'equipo'}, esta es la actividad de {company.name}
        </h1>
        <p className="mt-1 text-secondary/70">{company.location ?? 'Latam'} • {company.industry ?? 'Seguros'}</p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { label: 'Vacancias activas', value: metrics.activeJobs },
            { label: 'Postulaciones nuevas (7d)', value: metrics.newApplications },
            { label: 'Talentos guardados', value: metrics.savedTalents },
          ].map((stat) => (
            <article key={stat.label} className="rounded-3xl border border-secondary/10 bg-background p-6 text-secondary">
              <p className="text-sm uppercase tracking-[0.3em] text-secondary/60">{stat.label}</p>
              <p className="mt-4 text-4xl font-bold">{stat.value}</p>
              <p className="text-sm text-secondary/60">Actualizado en tiempo real</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 md:flex-row">
          <Link
            to="/publicar"
            className="flex-1 rounded-3xl bg-secondary px-6 py-4 text-center font-semibold text-white transition hover:bg-secondary/90"
          >
            Publicar nueva vacancia
          </Link>
          <Link
            to="/empresa/editar"
            className="flex-1 rounded-3xl border border-secondary/20 px-6 py-4 text-center font-semibold text-secondary"
          >
            Editar perfil de empresa
          </Link>
          <Link
            to="/dashboard/mis-vacancias"
            className="flex-1 rounded-3xl border border-secondary/20 px-6 py-4 text-center font-semibold text-secondary hover:bg-secondary/5"
          >
            Ver todas mis vacancias
          </Link>
          <Link
            to="/dashboard/postulaciones"
            className="flex-1 rounded-3xl border border-secondary/20 px-6 py-4 text-center font-semibold text-secondary hover:bg-secondary/5"
          >
            Ver postulaciones
            {metrics.newApplications > 0 && ` (${metrics.newApplications} nuevas)`}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;

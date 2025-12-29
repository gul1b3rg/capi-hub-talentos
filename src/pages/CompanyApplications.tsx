import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentProfile } from '../context/AuthContext';
import { fetchCompanyByOwner } from '../lib/companyService';
import {
  fetchApplicationsByCompany,
  updateApplicationStatus,
  type ApplicationWithRelations,
} from '../lib/applicationService';
import { APPLICATION_STATUS_COLORS, APPLICATION_STATUS_LABELS, type ApplicationStatus } from '../types/applications';

const CompanyApplications = () => {
  const { user } = useCurrentProfile();
  const [applications, setApplications] = useState<ApplicationWithRelations[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<ApplicationWithRelations[]>([]);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const loadApplications = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      try {
        const company = await fetchCompanyByOwner(user.id);
        if (!company) {
          setError('No encontramos tu empresa.');
          return;
        }

        const data = await fetchApplicationsByCompany(company.id);
        setApplications(data);
        setFilteredApplications(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'No pudimos cargar las postulaciones.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [user?.id]);

  useEffect(() => {
    if (filterStatus === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(
        applications.filter((app) => app.status === filterStatus)
      );
    }
  }, [filterStatus, applications]);

  const handleStatusChange = async (
    applicationId: string,
    newStatus: ApplicationStatus
  ) => {
    setUpdatingId(applicationId);

    try {
      await updateApplicationStatus(applicationId, newStatus);

      // Actualizar estado local
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (updateError) {
      alert(
        updateError instanceof Error
          ? updateError.message
          : 'No se pudo actualizar el estado.'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-center text-secondary/70">Cargando postulaciones...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="rounded-3xl bg-red-50 px-6 py-4 text-center text-red-600">
          {error}
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">
          Gestión de Postulaciones
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-secondary">
          Postulaciones recibidas
        </h1>
        <p className="mt-1 text-secondary/70">
          Revisa, filtra y actualiza el estado de las postulaciones.
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            filterStatus === 'all'
              ? 'bg-secondary text-white'
              : 'border border-secondary/20 text-secondary hover:bg-secondary/5'
          }`}
        >
          Todas ({applications.length})
        </button>

        {(
          [
            'Recibida',
            'En revisión',
            'Entrevista agendada',
            'Aceptada',
            'Rechazada',
          ] as ApplicationStatus[]
        ).map((status) => {
          const count = applications.filter((app) => app.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filterStatus === status
                  ? 'bg-secondary text-white'
                  : 'border border-secondary/20 text-secondary hover:bg-secondary/5'
              }`}
            >
              {APPLICATION_STATUS_LABELS[status]} ({count})
            </button>
          );
        })}
      </div>

      {/* Lista de postulaciones */}
      {filteredApplications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-secondary/30 bg-white/60 p-10 text-center shadow-xl">
          <p className="text-secondary/70">
            {filterStatus === 'all'
              ? 'Aún no has recibido postulaciones.'
              : `No hay postulaciones con estado "${APPLICATION_STATUS_LABELS[filterStatus]}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <article
              key={application.id}
              className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-lg backdrop-blur"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="text-xl font-semibold text-secondary">
                        {application.talent?.full_name ?? 'Talento'}
                      </h3>
                      <p className="text-sm text-secondary/70">
                        {application.talent?.headline ?? 'Sin titular'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-secondary/70">
                    <p>
                      <span className="font-semibold text-secondary">Vacancia:</span>{' '}
                      {application.job?.title}
                    </p>
                    <p>
                      <span className="font-semibold text-secondary">Postulado:</span>{' '}
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      to={`/talento/${application.talent_id}`}
                      className="rounded-full bg-secondary/10 px-4 py-2 text-sm font-semibold text-secondary hover:bg-secondary/20"
                    >
                      Ver Perfil Completo
                    </Link>

                    {application.talent?.cv_url && (
                      <a
                        href={application.talent.cv_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
                      >
                        Ver CV
                      </a>
                    )}
                    {application.talent?.linkedin_url && (
                      <a
                        href={application.talent.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>

                <div className="lg:text-right">
                  <p className="mb-3 text-sm font-semibold text-secondary">Estado:</p>
                  <div className="flex flex-col gap-2 lg:items-end">
                    {/* Badge actual del estado */}
                    <div className={`inline-block rounded-full px-4 py-2 text-sm font-semibold ${APPLICATION_STATUS_COLORS[application.status]}`}>
                      {APPLICATION_STATUS_LABELS[application.status]}
                    </div>

                    {/* Selector desplegable mejorado */}
                    <select
                      value={application.status}
                      onChange={(e) =>
                        handleStatusChange(
                          application.id,
                          e.target.value as ApplicationStatus
                        )
                      }
                      disabled={updatingId === application.id}
                      className="w-full rounded-2xl border-2 border-secondary/20 bg-white px-4 py-2 text-sm font-semibold text-secondary shadow-sm transition hover:border-secondary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 lg:w-auto"
                    >
                      {(
                        [
                          'Recibida',
                          'En revisión',
                          'Entrevista agendada',
                          'Aceptada',
                          'Rechazada',
                        ] as ApplicationStatus[]
                      ).map((status) => (
                        <option key={status} value={status}>
                          {APPLICATION_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {application.notes && (
                <div className="mt-4 rounded-2xl bg-secondary/5 px-4 py-3">
                  <p className="text-sm font-semibold text-secondary">Notas:</p>
                  <p className="mt-1 text-sm text-secondary/70">
                    {application.notes}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default CompanyApplications;

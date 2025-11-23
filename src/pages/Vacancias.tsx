import { useEffect, useState } from 'react';
import JobCard from '../components/JobCard';
import JobListFilters from '../components/JobListFilters';
import { fetchCompaniesForFilters } from '../lib/companyService';
import { fetchPublicJobs, type JobWithRelations } from '../lib/jobService';

interface Filters {
  area: string;
  seniority: string;
  modality: string;
  location: string;
  companyId: string;
  search: string;
}

const defaultFilters: Filters = {
  area: '',
  seniority: '',
  modality: '',
  location: '',
  companyId: '',
  search: '',
};

const Vacancias = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [jobs, setJobs] = useState<JobWithRelations[]>([]);
  const [companyOptions, setCompanyOptions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await fetchCompaniesForFilters();
        setCompanyOptions(data);
      } catch {
        // ignore filter load errors
      }
    };
    loadCompanies();
  }, []);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('[Vacancias] Fetching jobs with filters', filters);
        const data = await fetchPublicJobs(filters);
        setJobs(data);
        console.log('[Vacancias] Jobs loaded', data.length);
      } catch (loadError) {
        console.error('[Vacancias] Error fetching jobs', loadError);
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las vacancias.');
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [filters]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">Vacancias activas</p>
        <h1 className="mt-2 text-4xl font-semibold text-secondary">Explora oportunidades curadas</h1>
        <p className="text-secondary/70">Filtra por área, seniority, modalidad o empresa.</p>
      </div>

      <JobListFilters filters={filters} onChange={setFilters} companyOptions={companyOptions} />

      {loading ? (
        <p className="mt-10 text-center text-secondary/70">Cargando vacancias...</p>
      ) : error ? (
        <p className="mt-10 rounded-3xl bg-red-50 px-6 py-4 text-center text-red-600">{error}</p>
      ) : jobs.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-secondary/30 px-6 py-8 text-center text-secondary/60">
          No encontramos vacancias que coincidan con tus filtros. Ajusta los criterios para ver nuevas opciones.
        </p>
      ) : (
        <div className="mt-10 grid gap-5">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </section>
  );
};

export default Vacancias;

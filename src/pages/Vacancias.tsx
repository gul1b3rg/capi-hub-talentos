import { useCallback, useEffect, useState } from 'react';
import JobCard from '../components/JobCard';
import JobListFilters from '../components/JobListFilters';
import InfiniteScrollTrigger from '../components/InfiniteScrollTrigger';
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

// Hook personalizado para debouncing
const useDebouncedValue = <T,>(value: T, delay = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Vacancias = () => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [jobs, setJobs] = useState<JobWithRelations[]>([]);
  const [companyOptions, setCompanyOptions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Aplicar debounce solo al campo de búsqueda (500ms)
  const debouncedSearch = useDebouncedValue(filters.search, 500);

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

  // Cuando cambian los filtros, resetear paginación y cargar desde cero
  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      setError(null);
      setPage(0);
      try {
        // Usar el valor debounced de search junto con los otros filtros
        const activeFilters = { ...filters, search: debouncedSearch };
        console.log('[Vacancias] Fetching jobs with filters', activeFilters);
        const response = await fetchPublicJobs(activeFilters, { limit: 20, offset: 0 });
        setJobs(response.jobs);
        setHasMore(response.hasMore);
        console.log('[Vacancias] Jobs loaded', response.jobs.length, 'hasMore:', response.hasMore);
      } catch (loadError) {
        console.error('[Vacancias] Error fetching jobs', loadError);
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las vacancias.');
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.area, filters.seniority, filters.modality, filters.location, filters.companyId, debouncedSearch]);

  // Función para cargar más ofertas (infinite scroll)
  const loadMoreJobs = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const activeFilters = { ...filters, search: debouncedSearch };
      const nextPage = page + 1;
      const response = await fetchPublicJobs(activeFilters, { limit: 20, offset: nextPage * 20 });

      setJobs((prev) => [...prev, ...response.jobs]);
      setHasMore(response.hasMore);
      setPage(nextPage);
      console.log('[Vacancias] Loaded more jobs', response.jobs.length, 'hasMore:', response.hasMore);
    } catch (loadError) {
      console.error('[Vacancias] Error loading more jobs', loadError);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, filters, debouncedSearch, page]);

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
        <>
          <div className="mt-10 grid gap-5">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {/* Infinite scroll trigger */}
          <InfiniteScrollTrigger onLoadMore={loadMoreJobs} hasMore={hasMore} loading={loadingMore} />
        </>
      )}
    </section>
  );
};

export default Vacancias;

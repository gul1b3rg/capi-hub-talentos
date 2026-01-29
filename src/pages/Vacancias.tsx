import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import JobCard from '../components/JobCard';
import JobListFilters from '../components/JobListFilters';
import InfiniteScrollTrigger from '../components/InfiniteScrollTrigger';
import { fetchCompaniesForFilters } from '../lib/companyService';
import { fetchPublicJobs, type JobWithRelations } from '../lib/jobService';
import { useCurrentProfile } from '../context/AuthContext';

const MAX_JOBS_UNAUTHENTICATED = 1; // Limit for non-authenticated users

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
  const { user } = useCurrentProfile();
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
        const response = await fetchPublicJobs(activeFilters, { limit: 20, offset: 0 });
        setJobs(response.jobs);
        setHasMore(response.hasMore);
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
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">Vacancias activas</p>
        <h1 className="mt-2 text-4xl font-semibold text-secondary">Explora oportunidades curadas</h1>
        <p className="text-secondary/70">Filtra por área, seniority, modalidad o empresa.</p>
        <p className="mt-3 text-sm text-secondary/60">
          ¿Tu aseguradora o empresa necesita contratar?{' '}
          <Link to="/register-company" className="font-semibold text-primary hover:underline">
            Publicá tu vacancia gratis
          </Link>
          , recibí postulaciones y gestioná todo desde un solo lugar.
        </p>
      </div>

      <JobListFilters filters={filters} onChange={setFilters} companyOptions={companyOptions} />

      {loading ? (
        <p className="mt-10 text-center text-secondary/70">Cargando vacancias...</p>
      ) : error ? (
        <p className="mt-10 rounded-3xl bg-red-50 px-6 py-4 text-center text-red-600">{error}</p>
      ) : jobs.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-secondary/30 px-6 py-8 text-center text-secondary/60">
          <p>No encontramos vacancias que coincidan con tus filtros. Volvé pronto para ver nuevas oportunidades.</p>
          <p className="mt-3">
            ¿Tu empresa o aseguradora busca contratar talento?{' '}
            <Link to="/register-company" className="font-semibold text-primary hover:underline">
              Registrate aquí
            </Link>{' '}
            y publicá una vacancia.
          </p>
        </div>
      ) : (
        <>
          <div className="relative mt-10">
            <div className="grid gap-5">
              {/* Show only first job for non-authenticated users */}
              {(user ? jobs : jobs.slice(0, MAX_JOBS_UNAUTHENTICATED)).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {/* Gradient fade overlay for non-authenticated users */}
            {!user && jobs.length > MAX_JOBS_UNAUTHENTICATED && (
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/95 to-transparent" />
            )}
          </div>

          {/* CTA for non-authenticated users */}
          {!user && jobs.length > MAX_JOBS_UNAUTHENTICATED && (
            <div className="relative z-10 -mt-16 rounded-3xl border border-secondary/20 bg-white px-8 py-10 text-center shadow-xl">
              <h3 className="text-2xl font-semibold text-secondary">
                Para ver todas las vacancias disponibles
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-secondary/70">
                Registrate como profesional para postularte a las oportunidades, o registra tu aseguradora/empresa para publicar vacancias y encontrar talento.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to="/register-talent"
                  className="w-full rounded-full bg-accent px-6 py-3 font-semibold text-secondary shadow-lg transition hover:shadow-xl sm:w-auto"
                >
                  Registrarme como profesional
                </Link>
                <Link
                  to="/register-company"
                  className="w-full rounded-full border-2 border-secondary/30 px-6 py-3 font-semibold text-secondary transition hover:border-secondary sm:w-auto"
                >
                  Registrar empresa
                </Link>
              </div>
            </div>
          )}

          {/* Infinite scroll trigger - only for authenticated users */}
          {user && (
            <InfiniteScrollTrigger onLoadMore={loadMoreJobs} hasMore={hasMore} loading={loadingMore} />
          )}
        </>
      )}
    </section>
  );
};

export default Vacancias;

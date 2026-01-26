import { useCallback, useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import CompanyCard from '../components/CompanyCard';
import InfiniteScrollTrigger from '../components/InfiniteScrollTrigger';
import { fetchPublicCompanies, type CompanyListItem } from '../lib/companyService';

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

const Empresas = () => {
  const [search, setSearch] = useState('');
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const debouncedSearch = useDebouncedValue(search, 500);

  // Cargar empresas cuando cambia el filtro de búsqueda
  useEffect(() => {
    const loadCompanies = async () => {
      setLoading(true);
      setError(null);
      setPage(0);
      try {
        const response = await fetchPublicCompanies(
          { search: debouncedSearch },
          { limit: 20, offset: 0 }
        );
        setCompanies(response.companies);
        setHasMore(response.hasMore);
      } catch (loadError) {
        // eslint-disable-next-line no-console
        console.error('[Empresas] Error fetching companies', loadError);
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las empresas.');
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, [debouncedSearch]);

  // Cargar más empresas (infinite scroll)
  const loadMoreCompanies = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await fetchPublicCompanies(
        { search: debouncedSearch },
        { limit: 20, offset: nextPage * 20 }
      );

      setCompanies((prev) => [...prev, ...response.companies]);
      setHasMore(response.hasMore);
      setPage(nextPage);
    } catch (loadError) {
      // eslint-disable-next-line no-console
      console.error('[Empresas] Error loading more companies', loadError);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, debouncedSearch, page]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-secondary/70">Directorio</p>
        <h1 className="mt-2 text-4xl font-semibold text-secondary">Empresas en la plataforma</h1>
        <p className="text-secondary/70">Descubre las aseguradoras y empresas que están conectadas en el sector asegurador.</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-8">
        <div className="relative mx-auto max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40" />
          <input
            type="text"
            placeholder="Buscar empresa por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-secondary/20 bg-white py-3 pl-11 pr-4 text-secondary placeholder:text-secondary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-center text-secondary/70">Cargando empresas...</p>
      ) : error ? (
        <p className="mt-10 rounded-3xl bg-red-50 px-6 py-4 text-center text-red-600">{error}</p>
      ) : companies.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-secondary/30 px-6 py-8 text-center text-secondary/60">
          {search.trim()
            ? 'No encontramos empresas que coincidan con tu búsqueda.'
            : 'Aún no hay empresas registradas en la plataforma.'}
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

          <InfiniteScrollTrigger onLoadMore={loadMoreCompanies} hasMore={hasMore} loading={loadingMore} />
        </>
      )}
    </section>
  );
};

export default Empresas;

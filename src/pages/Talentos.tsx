import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TalentCard from '../components/TalentCard';
import TalentListFilters from '../components/TalentListFilters';
import InfiniteScrollTrigger from '../components/InfiniteScrollTrigger';
import { fetchPublicTalents } from '../lib/talentService';
import type { PublicTalentProfile, TalentFilters } from '../types/talent';

const TALENTS_PER_PAGE = 20;

const Talentos = () => {
  const [talents, setTalents] = useState<PublicTalentProfile[]>([]);
  const [filters, setFilters] = useState<TalentFilters>({
    search: '',
    area: null,
    experience_years: null,
    location: '',
    sortBy: 'popular'
  });
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch inicial y cuando cambian filtros
  useEffect(() => {
    fetchTalentsData(true);
  }, [filters]);

  const fetchTalentsData = async (reset = false) => {
    const currentPage = reset ? 0 : page;
    const isInitialLoad = currentPage === 0;

    if (isInitialLoad) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    setError(null);

    try {
      const { talents: newTalents, hasMore: more } = await fetchPublicTalents(
        filters,
        {
          limit: TALENTS_PER_PAGE,
          offset: currentPage * TALENTS_PER_PAGE
        }
      );

      if (reset) {
        setTalents(newTalents);
        setPage(0);
      } else {
        setTalents((prev) => [...prev, ...newTalents]);
      }

      setHasMore(more);
    } catch (err) {
      setError('Error al cargar los talentos. Por favor intenta de nuevo.');
      // eslint-disable-next-line no-console
      console.error('Error fetching talents:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setPage((prev) => prev + 1);
      fetchTalentsData(false);
    }
  };

  const handleFilterChange = (newFilters: TalentFilters) => {
    setFilters(newFilters);
    setTalents([]);
    setPage(0);
    setHasMore(true);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-secondary md:text-5xl">
            Directorio de Talentos
          </h1>
          <p className="mt-4 text-lg text-secondary/70">
            Conecta con profesionales del mercado asegurador en Paraguay
          </p>
        </header>

        {/* Filtros */}
        <TalentListFilters filters={filters} onFilterChange={handleFilterChange} />

        {/* Stats */}
        {!loading && !error && (
          <div className="mb-6 text-center">
            <div className="text-sm text-secondary/70">
              {talents.length > 0 ? (
                <>
                  Mostrando {talents.length} talento{talents.length !== 1 ? 's' : ''}
                  {hasMore && ' (carga más abajo para ver más)'}
                </>
              ) : (
                'No se encontraron talentos'
              )}
            </div>
            <p className="mt-2 text-sm text-secondary/60">
              ¿No encontrás tu perfil?{' '}
              <Link to="/register-talent" className="font-semibold text-primary hover:underline">
                Registrate gratis
              </Link>{' '}
              y dá a conocer tu talento al sector asegurador.
            </p>
          </div>
        )}

        {/* Loading inicial */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl border border-white/40 bg-white/90 p-6"
              >
                <div className="mb-4 flex justify-center">
                  <div className="h-24 w-24 rounded-full bg-secondary/10" />
                </div>
                <div className="mb-4 space-y-2">
                  <div className="mx-auto h-5 w-3/4 rounded bg-secondary/10" />
                  <div className="mx-auto h-4 w-1/2 rounded bg-secondary/10" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-secondary/10" />
                  <div className="h-4 w-2/3 rounded bg-secondary/10" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchTalentsData(true)}
              className="mt-4 rounded-full bg-red-600 px-6 py-2 text-white hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && talents.length === 0 && (
          <div className="rounded-3xl border border-white/40 bg-white/90 p-12 text-center backdrop-blur-xl">
            <p className="text-lg font-semibold text-secondary">
              No se encontraron talentos con estos criterios
            </p>
            <p className="mt-2 text-secondary/70">
              Intenta ajustar los filtros de búsqueda
            </p>
            <button
              onClick={() => handleFilterChange({
                search: '',
                area: null,
                experience_years: null,
                location: '',
                sortBy: 'popular'
              })}
              className="mt-6 rounded-full bg-secondary px-6 py-3 font-semibold text-white hover:bg-secondary/90"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Grid de talentos */}
        {!loading && !error && talents.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {talents.map((talent) => (
                <TalentCard key={talent.id} talent={talent} />
              ))}
            </div>

            {/* Infinite scroll trigger */}
            {hasMore && (
              <InfiniteScrollTrigger
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
                loading={loadingMore}
              />
            )}

            {/* End message + Registration CTA */}
            {!hasMore && talents.length > 0 && (
              <div className="mt-10 rounded-3xl border border-dashed border-secondary/30 px-6 py-8 text-center">
                <p className="text-secondary/60">Has visto todos los talentos disponibles</p>
                <p className="mt-3 text-secondary">
                  ¿Sos profesional del sector asegurador?{' '}
                  <Link to="/register-talent" className="font-semibold text-primary hover:underline">
                    Creá tu perfil gratis
                  </Link>{' '}
                  y conectá con empresas que buscan tu talento.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Talentos;
